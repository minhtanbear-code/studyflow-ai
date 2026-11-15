// ==============================================================================
// STUDYFLOW AI - REAL WEBRTC VOICE 1V1 STREAMING SERVICE
// ==============================================================================
// Kết nối âm thanh ngang hàng (P2P) giữa 2 thiết bị độc lập.
// Sử dụng STUN servers của Google + Mozilla và Supabase REST làm kênh Signaling.
// ==============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCVoiceManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isHost: boolean = false;
  private roomCode: string = "";
  private senderId: string = "";
  private signalInterval: NodeJS.Timeout | null = null;
  private isClosed: boolean = false;

  // ICE Candidate queue to prevent dropping before remoteDescription is ready
  private pendingCandidates: RTCIceCandidateInit[] = [];

  // Audio Analysers for volume detection
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;

  public onLocalSpeaking?: (volume: number) => void;
  public onRemoteSpeaking?: (volume: number) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onError?: (err: string) => void;

  constructor(roomCode: string, senderId: string, isHost: boolean) {
    this.roomCode = roomCode.trim().toUpperCase();
    this.senderId = senderId;
    this.isHost = isHost;
  }

  /**
   * Khởi động cuộc gọi WebRTC Voice
   */
  async start(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.onError?.("Trình duyệt không hỗ trợ WebRTC Audio.");
      return false;
    }

    try {
      // 1. Xin quyền Microphone thực tế (1 lần duy nhất cho toàn bộ app)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Tạo phần tử Audio gắn trực tiếp vào DOM để vượt qua chính sách Autoplay
      let audioEl = document.getElementById("studyflow-remote-audio") as HTMLAudioElement | null;
      if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.id = "studyflow-remote-audio";
        audioEl.autoplay = true;
        (audioEl as any).playsInline = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
      }
      this.audioElement = audioEl;

      // 3. Khởi tạo RTCPeerConnection với STUN đa điểm
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      // Thêm các audio track cục bộ vào kết nối
      this.localStream.getAudioTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Thiết lập đo âm lượng người nói hiện tại (local speaking)
      this.setupLocalAnalyser(this.localStream);

      // Lắng nghe track âm thanh từ bạn học
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.audioElement) {
            this.audioElement.srcObject = this.remoteStream;
            const playPromise = this.audioElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Nếu trình duyệt chặn Autoplay, tự động phát ngay khi người dùng chạm/click vào trang
                const unlock = () => {
                  this.audioElement?.play().catch(() => {});
                  document.removeEventListener("click", unlock);
                  document.removeEventListener("touchstart", unlock);
                };
                document.addEventListener("click", unlock, { once: true });
                document.addEventListener("touchstart", unlock, { once: true });
              });
            }
          }
          this.setupRemoteAnalyser(this.remoteStream);
        }
      };

      // Lắng nghe trạng thái kết nối
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          this.onConnectionStateChange?.(this.peerConnection.connectionState);
        }
      };

      // Gửi ICE Candidates lên Supabase Signaling
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          this.sendSignal("candidate", event.candidate.toJSON());
        }
      };

      // 4. Nếu là Host: Dọn dẹp các tín hiệu WebRTC cũ của phòng này rồi tạo Offer
      if (this.isHost) {
        // Xóa tín hiệu gọi cũ nếu có
        await fetch(
          `${SUPABASE_URL}/rest/v1/webrtc_signals?room_code=eq.${encodeURIComponent(this.roomCode)}&type=in.(offer,answer,candidate)`,
          {
            method: "DELETE",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        ).catch(() => {});

        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
        });
        await this.peerConnection.setLocalDescription(offer);
        await this.sendSignal("offer", offer);
      }

      // 5. Bắt đầu lắng nghe tín hiệu Signaling chu kỳ nhanh (500ms) để kết nối tức thì
      this.startSignalPolling();

      return true;
    } catch (err: any) {
      console.error("WebRTC start error:", err);
      this.onError?.(err?.message || "Không thể truy cập microphone.");
      return false;
    }
  }

  /**
   * Bật / Tắt Microphone
   */
  setMicEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Bật / Tắt Loa phát giọng bạn học
   */
  setSpeakerEnabled(enabled: boolean): void {
    if (this.audioElement) {
      this.audioElement.muted = !enabled;
    }
  }

  /**
   * Mở khóa âm thanh nếu trình duyệt hạn chế autoplay
   */
  unlockAudio(): void {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(() => {});
    }
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
  }

  /**
   * Xử lý thêm ICE Candidate an toàn (buffer lại nếu remoteDescription chưa sẵn sàng)
   */
  private async addCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!candidate || !candidate.candidate) return;

    if (this.peerConnection?.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("addIceCandidate warning:", e);
      }
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  /**
   * Đẩy toàn bộ các ICE Candidate đã buffer vào kết nối sau khi setRemoteDescription
   */
  private async flushCandidates(): Promise<void> {
    if (!this.peerConnection?.remoteDescription) return;

    while (this.pendingCandidates.length > 0) {
      const cand = this.pendingCandidates.shift();
      if (cand) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn("flush candidate warning:", e);
        }
      }
    }
  }

  /**
   * Thiết lập Audio Analyser cho microphone cục bộ
   */
  private setupLocalAnalyser(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.localAnalyser = this.audioContext.createAnalyser();
      this.localAnalyser.fftSize = 256;
      source.connect(this.localAnalyser);

      const buffer = new Uint8Array(this.localAnalyser.frequencyBinCount);
      const checkLocal = () => {
        if (this.isClosed || !this.localAnalyser) return;
        this.localAnalyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        this.onLocalSpeaking?.(avg);
        requestAnimationFrame(checkLocal);
      };
      checkLocal();
    } catch (e) {
      console.warn("setupLocalAnalyser error:", e);
    }
  }

  /**
   * Thiết lập Audio Analyser để đo âm lượng bạn học (vẽ sóng âm)
   */
  private setupRemoteAnalyser(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.remoteAnalyser = this.audioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 256;
      source.connect(this.remoteAnalyser);

      const buffer = new Uint8Array(this.remoteAnalyser.frequencyBinCount);
      const checkVolume = () => {
        if (this.isClosed || !this.remoteAnalyser) return;
        this.remoteAnalyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        this.onRemoteSpeaking?.(avg);
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.warn("setupRemoteAnalyser error:", e);
    }
  }

  /**
   * Gửi tín hiệu WebRTC (Offer, Answer, Candidate) lên Supabase
   */
  private async sendSignal(type: "offer" | "answer" | "candidate", payload: any): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/webrtc_signals`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          room_code: this.roomCode,
          sender_id: this.senderId,
          type: type,
          payload: payload,
        }),
      });
    } catch (e) {}
  }

  /**
   * Lắng nghe tín hiệu từ thiết bị đối tác qua Supabase Signaling
   */
  private startSignalPolling(): void {
    const processedSignalIds = new Set<string>();

    this.signalInterval = setInterval(async () => {
      if (this.isClosed || !this.peerConnection) return;

      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/webrtc_signals?room_code=eq.${encodeURIComponent(this.roomCode)}&sender_id=neq.${encodeURIComponent(this.senderId)}&type=in.(offer,answer,candidate)&order=created_at.asc`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!res.ok) return;
        const signals = await res.json();
        if (!signals || !Array.isArray(signals)) return;

        for (const sig of signals) {
          if (processedSignalIds.has(sig.id)) continue;
          processedSignalIds.add(sig.id);

          if (sig.type === "offer" && !this.isHost) {
            // Guest nhận Offer -> thiết lập remote description -> tạo Answer
            try {
              if (this.peerConnection.signalingState === "stable" || !this.peerConnection.remoteDescription) {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushCandidates();
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                await this.sendSignal("answer", answer);
              }
            } catch (err) {
              console.warn("Guest handle offer error:", err);
            }
          } else if (sig.type === "answer" && this.isHost) {
            // Host nhận Answer -> thiết lập remote description
            try {
              if (this.peerConnection.signalingState === "have-local-offer") {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushCandidates();
              }
            } catch (err) {
              console.warn("Host handle answer error:", err);
            }
          } else if (sig.type === "candidate") {
            // Nhận ICE Candidate và thêm vào kết nối
            await this.addCandidate(sig.payload);
          }
        }
      } catch (e) {}
    }, 500); // Polling 500ms giúp bắt tay WebRTC hoàn tất trong 1-2 giây
  }

  /**
   * Dọn dẹp và kết thúc cuộc gọi
   */
  destroy(): void {
    this.isClosed = true;
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
      this.signalInterval = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.audioElement) {
      this.audioElement.srcObject = null;
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
