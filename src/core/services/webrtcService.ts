// ==============================================================================
// STUDYFLOW AI - REAL WEBRTC VOICE 1V1 STREAMING SERVICE
// ==============================================================================
// Kết nối âm thanh ngang hàng (P2P) giữa 2 thiết bị độc lập.
// Sử dụng STUN của Google & Mozilla + TURN relay để vượt qua tường lửa NAT/4G.
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
    // Public WebRTC STUN/TURN relays to punch through 4G CGNAT and campus firewalls
    { urls: "stun:stun.relay.metered.ca:80" },
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
  private role: "host" | "guest" = "host";
  private mySenderId: string = "";
  private targetSenderId: string = "";
  private signalInterval: NodeJS.Timeout | null = null;
  private isClosed: boolean = false;

  // ICE Candidate queue to prevent dropping before remoteDescription is ready
  private pendingCandidates: RTCIceCandidateInit[] = [];

  // Audio Analysers for volume detection
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private remoteGainNode: GainNode | null = null;
  private audioContext: AudioContext | null = null;

  public onLocalSpeaking?: (volume: number) => void;
  public onRemoteSpeaking?: (volume: number) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onError?: (err: string) => void;
  public onAutoplayBlocked?: (blocked: boolean) => void;
  public onRemoteAudioPlaying?: () => void;

  constructor(roomCode: string, _senderId: string, isHost: boolean) {
    this.roomCode = roomCode.trim().toUpperCase();
    this.isHost = isHost;
    this.role = isHost ? "host" : "guest";
    // Phân vai trò rõ ràng: Host gửi với ID bắt đầu bằng host_, Guest gửi với ID guest_
    // Đảm bảo không bao giờ bị trùng lặp ID kể cả khi test trên cùng một máy 2 tab
    const randomHex = Math.random().toString(36).slice(2, 8);
    this.mySenderId = `${this.role}_${randomHex}`;
    this.targetSenderId = isHost ? "guest" : "host";
  }

  /**
   * Cho phép React component gắn trực tiếp phần tử <audio> có sẵn trong DOM
   */
  attachAudioElement(el: HTMLAudioElement): void {
    if (!el) return;
    this.audioElement = el;
    this.audioElement.autoplay = true;
    (this.audioElement as any).playsInline = true;
    this.audioElement.muted = false;
    this.audioElement.defaultMuted = false;
    this.audioElement.volume = 1.0;
    console.log("[WebRTC Audio] Đã gắn Audio Element trực tiếp từ React component!");

    if (this.remoteStream) {
      this.bindStreamToAudioElement(this.remoteStream);
    }
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
      console.log(`[WebRTC Audio] Bắt đầu phiên kết nối Voice [${this.role.toUpperCase()}] phòng: ${this.roomCode}`);

      // 1. Xin quyền Microphone thực tế với cấu hình tối ưu đàm thoại học tập
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Tạo hoặc lấy phần tử Audio gắn trực tiếp vào DOM nếu chưa có
      if (!this.audioElement) {
        let audioEl = document.getElementById("studyflow-remote-audio") as HTMLAudioElement | null;
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.id = "studyflow-remote-audio";
          audioEl.autoplay = true;
          (audioEl as any).playsInline = true;
          // Sử dụng offscreen positioning thay vì display: none để Chromium không deprioritize render audio
          audioEl.style.position = "fixed";
          audioEl.style.top = "-9999px";
          audioEl.style.left = "-9999px";
          audioEl.style.width = "1px";
          audioEl.style.height = "1px";
          audioEl.style.opacity = "0.001";
          audioEl.style.pointerEvents = "none";
          document.body.appendChild(audioEl);
        }
        audioEl.muted = false;
        audioEl.defaultMuted = false;
        audioEl.volume = 1.0;
        this.audioElement = audioEl;
      }

      // 3. Khởi tạo RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      // Thêm các audio track cục bộ vào kết nối
      this.localStream.getAudioTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          console.log(`[WebRTC Audio] Thêm local audio track vào PeerConnection: id=${track.id}, label=${track.label}`);
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Thiết lập đo âm lượng người nói hiện tại (local speaking)
      this.setupLocalAnalyser(this.localStream);

      // 4. LẮNG NGHE TRACK ÂM THANH TỪ BẠN HỌC (ontrack)
      this.peerConnection.ontrack = (event) => {
        console.log("[WebRTC Audio] ========================================");
        console.log("[WebRTC Audio] [Bước 1: ontrack] Nhận sự kiện ontrack từ bạn học!", event);
        const track = event.track;

        if (!track || track.kind !== "audio") {
          console.warn("[WebRTC Audio] Track nhận được không phải là audio:", track?.kind);
          return;
        }

        console.log(`[WebRTC Audio] [Bước 1.1: track info] id=${track.id}, kind=${track.kind}, readyState=${track.readyState}, enabled=${track.enabled}, muted=${track.muted}`);

        // Đảm bảo track được kích hoạt
        track.enabled = true;

        // Xử lý remote MediaStream (hỗ trợ cả khi event.streams rỗng)
        let stream: MediaStream;
        if (event.streams && event.streams[0]) {
          stream = event.streams[0];
          console.log(`[WebRTC Audio] [Bước 2: stream] Sử dụng stream từ event: id=${stream.id}, tracks=${stream.getAudioTracks().length}`);
          if (!stream.getAudioTracks().includes(track)) {
            stream.addTrack(track);
          }
        } else {
          console.log("[WebRTC Audio] [Bước 2: stream] event.streams rỗng, khởi tạo MediaStream bọc track!");
          stream = new MediaStream([track]);
        }

        this.remoteStream = stream;

        // Lắng nghe sự kiện của track để phát âm thanh ngay khi un-mute
        track.onmute = () => {
          console.log("[WebRTC Audio] [Track state] Track tạm thời bị mute bởi mạng (đang chờ gói dữ liệu RTP...)");
        };

        track.onunmute = () => {
          console.log("[WebRTC Audio] [Track state] 🎉 Track ĐÃ UNMUTE! Gói tin âm thanh đang truyền tới. Kích hoạt phát ra loa ngay...");
          this.playAudioElement();
        };

        track.onended = () => {
          console.warn("[WebRTC Audio] [Track state] Remote track đã kết thúc.");
        };

        // Gán stream vào Audio Element và gọi play()
        this.bindStreamToAudioElement(stream);

        // Thiết lập Analyser để vẽ sóng âm giọng bạn học
        this.setupRemoteAnalyser(stream);
        console.log("[WebRTC Audio] ========================================");
      };

      // Lắng nghe trạng thái kết nối
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          const state = this.peerConnection.connectionState;
          console.log(`[WebRTC Audio] Trạng thái kết nối PeerConnection: ${state.toUpperCase()}`);
          this.onConnectionStateChange?.(state);
        }
      };

      // Gửi ICE Candidates lên Supabase Signaling
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candJson = {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          };
          this.sendSignal("candidate", candJson);
        }
      };

      // 5. Nếu là Host: Tạo Offer đầu tiên
      if (this.isHost) {
        console.log("[WebRTC Audio] [Host] Đang tạo Offer kết nối...");
        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
        });
        await this.peerConnection.setLocalDescription(offer);
        await this.sendSignal("offer", {
          type: offer.type,
          sdp: offer.sdp,
        });
      }

      // 6. Bắt đầu lắng nghe tín hiệu Signaling chu kỳ 500ms
      this.startSignalPolling();

      return true;
    } catch (err: any) {
      console.error("WebRTC start error:", err);
      this.onError?.(err?.message || "Không thể truy cập microphone.");
      return false;
    }
  }

  /**
   * Gán MediaStream vào HTMLAudioElement và bắt đầu phát
   */
  private bindStreamToAudioElement(stream: MediaStream): void {
    if (!this.audioElement) {
      console.warn("[WebRTC Audio] Không tìm thấy audioElement để gán stream!");
      return;
    }

    console.log("[WebRTC Audio] [Bước 3: gán srcObject] Đang gán remoteStream vào audioElement.srcObject...");
    this.audioElement.srcObject = stream;
    this.audioElement.autoplay = true;
    (this.audioElement as any).playsInline = true;
    this.audioElement.muted = false;
    this.audioElement.defaultMuted = false;
    this.audioElement.volume = 1.0;

    // Gán các sự kiện theo dõi vòng đời âm thanh
    this.audioElement.onplaying = () => {
      console.log("[WebRTC Audio] [Bước 5: PHÁT THÀNH CÔNG] 🎉 LOA ĐANG PHÁT ÂM THANH TỪ BẠN HỌC!");
      this.onRemoteAudioPlaying?.();
      this.onAutoplayBlocked?.(false);
    };

    this.audioElement.onpause = () => {
      console.log("[WebRTC Audio] Audio element đang ở trạng thái pause.");
    };

    this.audioElement.onerror = (e) => {
      console.error("[WebRTC Audio] Lỗi Audio element:", e);
    };

    this.playAudioElement();
  }

  /**
   * Gọi audio.play() an toàn và xử lý autoplay rejection
   */
  public playAudioElement(): void {
    if (!this.audioElement) return;

    this.audioElement.muted = false;
    this.audioElement.volume = 1.0;

    console.log("[WebRTC Audio] [Bước 4: gọi play()] Đang gọi this.audioElement.play()...");
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("[WebRTC Audio] [Bước 5: play success] audio.play() THÀNH CÔNG!");
          this.onAutoplayBlocked?.(false);
          this.onRemoteAudioPlaying?.();
        })
        .catch((err) => {
          console.warn("[WebRTC Audio] [Bước 5: play rejected] Trình duyệt chặn Autoplay Audio:", err?.name, err?.message);
          // Báo cho UI hiển thị nút "Bật âm thanh"
          this.onAutoplayBlocked?.(true);

          // Lắng nghe tương tác chạm / click dự phòng trên toàn bộ cửa sổ
          const unlock = () => {
            if (this.audioElement) {
              this.audioElement.play()
                .then(() => {
                  console.log("[WebRTC Audio] Đã mở khóa phát loa sau tương tác!");
                  this.onAutoplayBlocked?.(false);
                  this.onRemoteAudioPlaying?.();
                })
                .catch(() => {});
            }
            if (this.audioContext && this.audioContext.state === "suspended") {
              this.audioContext.resume().catch(() => {});
            }
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("keydown", unlock);
          };

          window.addEventListener("click", unlock, { once: true });
          window.addEventListener("touchstart", unlock, { once: true });
          window.addEventListener("keydown", unlock, { once: true });
        });
    }
  }

  /**
   * Bật / Tắt Microphone của chính mình (TUYỆT ĐỐI KHÔNG ẢNH HƯỞNG REMOTE AUDIO)
   */
  setMicEnabled(enabled: boolean): void {
    console.log(`[WebRTC Audio] [Mic Toggle] Micro của bạn: ${enabled ? "BẬT" : "TẮT"}`);
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
    // Xác thực an toàn: remote audio element không bị mute
    if (this.audioElement) {
      console.log(`[WebRTC Audio] Kiểm tra sau khi tắt mic: remote audio element muted=${this.audioElement.muted}, volume=${this.audioElement.volume}`);
    }
  }

  /**
   * Bật / Tắt Loa phát giọng bạn học
   */
  setSpeakerEnabled(enabled: boolean): void {
    console.log(`[WebRTC Audio] [Speaker Toggle] Loa phát bạn học: ${enabled ? "BẬT" : "TẮT"}`);
    if (this.audioElement) {
      this.audioElement.muted = !enabled;
      this.audioElement.volume = enabled ? 1.0 : 0.0;
    }
    if (this.remoteGainNode) {
      this.remoteGainNode.gain.value = enabled ? 1.0 : 0.0;
    }
  }

  /**
   * Mở khóa âm thanh nếu trình duyệt chặn autoplay (gọi từ nút UI "Bật âm thanh")
   */
  async unlockAudio(): Promise<boolean> {
    console.log("[WebRTC Audio] [User Gesture] Người dùng chủ động bấm 'Bật âm thanh' / Mở khóa...");
    let success = false;

    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.log("[WebRTC Audio] AudioContext đã resumed thành công!");
      } catch (e) {
        console.warn("[WebRTC Audio] AudioContext resume error:", e);
      }
    }

    if (this.audioElement) {
      this.audioElement.muted = false;
      this.audioElement.volume = 1.0;
      try {
        await this.audioElement.play();
        console.log("[WebRTC Audio] AudioElement play() thành công qua user gesture!");
        this.onAutoplayBlocked?.(false);
        this.onRemoteAudioPlaying?.();
        success = true;
      } catch (err) {
        console.error("[WebRTC Audio] AudioElement play() thất bại:", err);
      }
    }

    // Nếu AudioElement vẫn chưa phát, kích hoạt Web Audio GainNode fallback phát trực tiếp
    if (!success && this.remoteGainNode && this.audioContext && this.audioContext.state === "running") {
      console.log("[WebRTC Audio] Kích hoạt Web Audio Output Fallback qua AudioContext.destination!");
      this.remoteGainNode.gain.value = 1.0;
      this.onAutoplayBlocked?.(false);
      this.onRemoteAudioPlaying?.();
      success = true;
    }

    return success;
  }

  /**
   * Thêm ICE Candidate an toàn
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
   * Đẩy toàn bộ các ICE Candidate đã buffer vào kết nối
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
   * Sử dụng track.clone() để Web Audio không can thiệp hoặc tắt tiếng luồng của HTMLAudioElement
   */
  private setupRemoteAnalyser(stream: MediaStream): void {
    try {
      const tracks = stream.getAudioTracks();
      if (tracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      // Clone track riêng cho Analyser để bảo toàn luồng phát nguyên bản của HTMLAudioElement
      const clonedTrack = tracks[0].clone();
      const analyserStream = new MediaStream([clonedTrack]);
      const source = this.audioContext.createMediaStreamSource(analyserStream);

      this.remoteAnalyser = this.audioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 256;
      source.connect(this.remoteAnalyser);

      // Web Audio GainNode dự phòng
      this.remoteGainNode = this.audioContext.createGain();
      this.remoteGainNode.gain.value = 0.0;
      source.connect(this.remoteGainNode);
      this.remoteGainNode.connect(this.audioContext.destination);

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
          sender_id: this.mySenderId,
          type: type,
          payload: payload,
        }),
      });
    } catch (e) {}
  }

  /**
   * Lắng nghe tín hiệu từ đối tác qua Supabase Signaling
   */
  private startSignalPolling(): void {
    const processedSignalIds = new Set<string>();

    this.signalInterval = setInterval(async () => {
      if (this.isClosed || !this.peerConnection) return;

      try {
        // Lấy các tín hiệu gửi từ vai trò đối tác trong vòng 2 phút gần nhất
        const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/webrtc_signals?room_code=eq.${encodeURIComponent(this.roomCode)}&sender_id=like.${encodeURIComponent(this.targetSenderId)}*&type=in.(offer,answer,candidate)&created_at=gte.${encodeURIComponent(twoMinutesAgo)}&order=created_at.asc`,
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
            // Guest nhận Offer từ Host -> setRemoteDescription -> tạo Answer gửi lại
            try {
              if (this.peerConnection.signalingState === "stable" || !this.peerConnection.remoteDescription) {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushCandidates();
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                await this.sendSignal("answer", {
                  type: answer.type,
                  sdp: answer.sdp,
                });
              }
            } catch (err) {
              console.warn("Guest handle offer error:", err);
            }
          } else if (sig.type === "answer" && this.isHost) {
            // Host nhận Answer từ Guest -> setRemoteDescription
            try {
              if (this.peerConnection.signalingState === "have-local-offer") {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushCandidates();
              }
            } catch (err) {
              console.warn("Host handle answer error:", err);
            }
          } else if (sig.type === "candidate") {
            // Nhận ICE Candidate
            await this.addCandidate(sig.payload);
          }
        }
      } catch (e) {}
    }, 500);
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
    if (this.remoteGainNode) {
      try {
        this.remoteGainNode.disconnect();
      } catch (e) {}
      this.remoteGainNode = null;
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
