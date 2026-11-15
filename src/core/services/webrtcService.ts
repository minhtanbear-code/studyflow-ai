// ==============================================================================
// STUDYFLOW AI - REAL WEBRTC VOICE 1V1 STREAMING SERVICE
// ==============================================================================
// Kết nối âm thanh ngang hàng (P2P) giữa 2 thiết bị độc lập.
// Sử dụng STUN server miễn phí của Google và Supabase REST làm kênh Signaling.
// ==============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
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

  // Audio Analysers for volume detection
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;

  public onRemoteSpeaking?: (volume: number) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onError?: (err: string) => void;

  constructor(roomCode: string, senderId: string, isHost: boolean) {
    this.roomCode = roomCode;
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
      // 1. Xin quyền Microphone thực tế
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Tạo phần tử Audio ẩn để phát giọng của bạn học
      this.audioElement = new Audio();
      this.audioElement.autoplay = true;
      (this.audioElement as any).playsInline = true;

      // 3. Khởi tạo RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      // Thêm các audio track cục bộ vào kết nối
      this.localStream.getAudioTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Lắng nghe track âm thanh từ bạn học
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.audioElement) {
            this.audioElement.srcObject = this.remoteStream;
            this.audioElement.play().catch((e) => console.warn("Audio autoplay blocked:", e));
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
        if (event.candidate) {
          this.sendSignal("candidate", event.candidate);
        }
      };

      // 4. Nếu là Host: Tạo Offer
      if (this.isHost) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        await this.sendSignal("offer", offer);
      }

      // 5. Bắt đầu lắng nghe tín hiệu Signaling từ bên kia
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
   * Thiết lập Audio Analyser để đo âm lượng bạn học (vẽ sóng âm)
   */
  private setupRemoteAnalyser(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
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
    let processedSignalIds = new Set<string>();

    this.signalInterval = setInterval(async () => {
      if (this.isClosed || !this.peerConnection) return;

      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/webrtc_signals?room_code=eq.${encodeURIComponent(this.roomCode)}&sender_id=neq.${encodeURIComponent(this.senderId)}&order=created_at.asc`,
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
            // Guest nhận Offer -> tạo Answer
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            await this.sendSignal("answer", answer);
          } else if (sig.type === "answer" && this.isHost) {
            // Host nhận Answer
            if (this.peerConnection.signalingState !== "stable") {
              await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
            }
          } else if (sig.type === "candidate") {
            // Nhận ICE Candidate
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(sig.payload));
            } catch (err) {}
          }
        }
      } catch (e) {}
    }, 1200);
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
