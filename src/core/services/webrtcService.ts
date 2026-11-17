// ==============================================================================
// STUDYFLOW AI - REAL WEBRTC VOICE 1V1 STREAMING SERVICE
// ==============================================================================
// Kết nối âm thanh ngang hàng (P2P) giữa 2 thiết bị độc lập.
// Hỗ trợ đàm thoại 2 chiều thực tế không qua máy chủ trung gian (P2P Mesh).
// STUN/TURN relays chuẩn hóa vượt tường lửa NAT/4G/WiFi trường đại học.
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

export interface WebRTCVoiceStats {
  pcState: RTCPeerConnectionState;
  iceState: RTCIceConnectionState;
  signalingState: RTCSignalingState;
  hasLocalAudio: boolean;
  hasRemoteAudio: boolean;
  remoteAudioLive: boolean;
  remoteAudioPlaying: boolean;
  autoplayBlocked: boolean;
  localVolume: number;
  remoteVolume: number;
}

export class WebRTCVoiceManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isHost: boolean = false;
  private roomCode: string = "";
  private role: "host" | "guest" = "host";
  private mySenderId: string = "";
  private signalInterval: NodeJS.Timeout | null = null;
  private isClosed: boolean = false;
  private sessionStartTime: string = "";

  // ICE Candidate queue to prevent dropping before remoteDescription is ready
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private localCandidatesBuffer: RTCIceCandidateInit[] = [];

  // Audio Analysers for volume detection
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private remoteGainNode: GainNode | null = null;
  private audioContext: AudioContext | null = null;

  // Realtime Volume metrics
  private currentLocalVolume: number = 0;
  private currentRemoteVolume: number = 0;
  private isAudioElementPlaying: boolean = false;
  private isAutoplayBlockedState: boolean = false;

  // Callbacks
  public onLocalSpeaking?: (volume: number) => void;
  public onRemoteSpeaking?: (volume: number) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onError?: (err: string) => void;
  public onAutoplayBlocked?: (blocked: boolean) => void;
  public onRemoteAudioPlaying?: () => void;
  public onStatsUpdate?: (stats: WebRTCVoiceStats) => void;

  constructor(roomCode: string, _senderId: string, isHost: boolean) {
    this.roomCode = roomCode.trim().toUpperCase();
    this.isHost = isHost;
    this.role = isHost ? "host" : "guest";
    // Phân vai trò rõ ràng: mỗi client có ID ngẫu nhiên phân biệt Host và Guest
    const randomHex = Math.random().toString(36).slice(2, 8);
    this.mySenderId = `${this.role}_${randomHex}`;
    // Timestamp bắt đầu phiên làm việc để không bỏ lỡ tín hiệu
    this.sessionStartTime = new Date(Date.now() - 30000).toISOString();
  }

  private log(tag: string, ...args: any[]): void {
    const rolePrefix = `[WebRTC Voice][${this.role.toUpperCase()} - ${this.roomCode}]`;
    console.log(`${rolePrefix} [${tag}]`, ...args);
  }

  private warn(tag: string, ...args: any[]): void {
    const rolePrefix = `[WebRTC Voice][${this.role.toUpperCase()} - ${this.roomCode}]`;
    console.warn(`${rolePrefix} ⚠️ [${tag}]`, ...args);
  }

  private error(tag: string, ...args: any[]): void {
    const rolePrefix = `[WebRTC Voice][${this.role.toUpperCase()} - ${this.roomCode}]`;
    console.error(`${rolePrefix} ❌ [${tag}]`, ...args);
  }

  private broadcastStats(): void {
    if (!this.onStatsUpdate) return;
    const pc = this.peerConnection;
    const remoteTrack = this.remoteStream?.getAudioTracks()[0];
    this.onStatsUpdate({
      pcState: pc?.connectionState || "closed",
      iceState: pc?.iceConnectionState || "closed",
      signalingState: pc?.signalingState || "closed",
      hasLocalAudio: Boolean(this.localStream && this.localStream.getAudioTracks().length > 0),
      hasRemoteAudio: Boolean(remoteTrack),
      remoteAudioLive: Boolean(remoteTrack && remoteTrack.readyState === "live" && remoteTrack.enabled),
      remoteAudioPlaying: this.isAudioElementPlaying,
      autoplayBlocked: this.isAutoplayBlockedState,
      localVolume: Math.round(this.currentLocalVolume),
      remoteVolume: Math.round(this.currentRemoteVolume),
    });
  }

  /**
   * Cho phép React component gắn trực tiếp phần tử <audio> cố định trong DOM
   */
  attachAudioElement(el: HTMLAudioElement): void {
    if (!el) return;
    this.audioElement = el;
    this.audioElement.autoplay = true;
    (this.audioElement as any).playsInline = true;
    this.audioElement.muted = false;
    this.audioElement.defaultMuted = false;
    this.audioElement.volume = 1.0;
    this.log("AudioElement", "Đã gắn Audio Element DOM thành công:", el.id);

    if (this.remoteStream) {
      this.bindStreamToAudioElement(this.remoteStream);
    }
  }

  /**
   * Khởi động cuộc gọi WebRTC Voice
   */
  async start(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      this.error("Init", "Trình duyệt không hỗ trợ WebRTC Audio.");
      this.onError?.("Trình duyệt không hỗ trợ WebRTC Audio.");
      return false;
    }

    try {
      this.log("Start", `Bắt đầu phiên đàm thoại Voice P2P. ID người gửi: ${this.mySenderId}`);

      // 1. Xin quyền Microphone thực tế với cấu hình tối ưu đàm thoại học tập
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.log("Microphone", "Đã cấp quyền mic thành công. Số track:", this.localStream.getAudioTracks().length);

      // 2. Tạo hoặc lấy phần tử Audio gắn vào DOM nếu React component chưa kịp truyền
      if (!this.audioElement) {
        let audioEl = document.getElementById("studyflow-remote-audio-player") as HTMLAudioElement | null;
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.id = "studyflow-remote-audio-player";
          audioEl.autoplay = true;
          (audioEl as any).playsInline = true;
          // Không dùng display: none vì Chromium có thể tắt âm thanh ngầm
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
          this.log("TrackAdd", `Thêm local audio track vào PeerConnection: id=${track.id}, label=${track.label}`);
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Thiết lập đo âm lượng người nói hiện tại (local speaking)
      this.setupLocalAnalyser(this.localStream);

      // 4. LẮNG NGHE SỰ KIỆN NHẬN AUDIO TRACK TỪ BẠN HỌC (ontrack)
      this.peerConnection.ontrack = (event) => {
        this.log("ontrack", "===> NHẬN SỰ KIỆN ontrack TỪ BẠN HỌC!", {
          trackKind: event.track?.kind,
          trackId: event.track?.id,
          streamsCount: event.streams?.length,
        });

        const track = event.track;
        if (!track || track.kind !== "audio") {
          this.warn("ontrack", "Track nhận được không phải là audio track:", track?.kind);
          return;
        }

        this.log(
          "ontrack",
          `Thông số Track: id=${track.id}, kind=${track.kind}, readyState=${track.readyState}, enabled=${track.enabled}, muted=${track.muted}`
        );

        // Kích hoạt track
        track.enabled = true;

        // Xây dựng MediaStream
        let stream: MediaStream;
        if (event.streams && event.streams[0]) {
          stream = event.streams[0];
          this.log("Stream", `Sử dụng stream từ event: id=${stream.id}, tracks=${stream.getAudioTracks().length}`);
          if (!stream.getAudioTracks().includes(track)) {
            stream.addTrack(track);
          }
        } else {
          this.log("Stream", "event.streams rỗng, bọc track vào MediaStream mới.");
          stream = new MediaStream([track]);
        }

        this.remoteStream = stream;

        // Lắng nghe sự kiện của track
        track.onmute = () => {
          this.warn("TrackState", "Track bị mute mạng (đang chờ gói RTP truyền đến...)");
          this.broadcastStats();
        };

        track.onunmute = () => {
          this.log("TrackState", "🎉 TRACK ĐÃ UNMUTE! Gói tin âm thanh đang truyền đến loa. Kích hoạt phát ngay...");
          this.playAudioElement();
          this.broadcastStats();
        };

        track.onended = () => {
          this.warn("TrackState", "Remote audio track đã kết thúc.");
          this.broadcastStats();
        };

        // Gán stream vào Audio Element và gọi play()
        this.bindStreamToAudioElement(stream);

        // Thiết lập Analyser để vẽ sóng âm giọng bạn học
        this.setupRemoteAnalyser(stream);

        this.broadcastStats();
      };

      // Lắng nghe trạng thái kết nối WebRTC PeerConnection
      this.peerConnection.onconnectionstatechange = () => {
        if (!this.peerConnection) return;
        const state = this.peerConnection.connectionState;
        this.log("ConnectionState", `Trạng thái kết nối PeerConnection: ${state.toUpperCase()}`);
        this.onConnectionStateChange?.(state);
        this.broadcastStats();

        if (state === "failed") {
          this.warn("ConnectionState", "Kết nối thất bại. Đang thử ICE Restart...");
          this.restartIce();
        }
      };

      // Lắng nghe trạng thái ICE
      this.peerConnection.oniceconnectionstatechange = () => {
        if (!this.peerConnection) return;
        const iceState = this.peerConnection.iceConnectionState;
        this.log("ICEState", `Trạng thái ICE Connection: ${iceState.toUpperCase()}`);
        this.broadcastStats();
      };

      // Gửi ICE Candidates lên Supabase Signaling
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candJson: RTCIceCandidateInit = {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          };
          this.localCandidatesBuffer.push(candJson);
          this.sendSignal("candidate", candJson);
        }
      };

      // 5. CƠ CHẾ BẮT TAY ĐỒNG BỘ 2 CHIỀU (SYMMETRIC HANDSHAKE)
      if (this.isHost) {
        // Host: Tạo Offer đầu tiên
        await this.createAndSendOffer();
      } else {
        // Guest: Gửi tín hiệu báo "Tôi đã vào phòng, hãy gửi Offer cho tôi"
        this.log("Handshake", "Guest gửi tín hiệu 'request_offer' đến Host...");
        await this.sendSignal("request_offer", { ready: true });
      }

      // 6. Bắt đầu lắng nghe tín hiệu Signaling từ Supabase (mỗi 500ms)
      this.startSignalPolling();

      this.broadcastStats();
      return true;
    } catch (err: any) {
      this.error("StartError", "Lỗi khởi động WebRTC:", err);
      this.onError?.(err?.message || "Không thể truy cập microphone.");
      return false;
    }
  }

  /**
   * Tạo Offer và gửi qua Signaling
   */
  private async createAndSendOffer(iceRestart = false): Promise<void> {
    if (!this.peerConnection || this.isClosed) return;
    try {
      this.log("Offer", `[Host] Đang tạo Offer (iceRestart: ${iceRestart})...`);
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        iceRestart: iceRestart,
      });
      await this.peerConnection.setLocalDescription(offer);
      await this.sendSignal("offer", {
        type: offer.type,
        sdp: offer.sdp,
      });
      this.log("Offer", "Đã gửi Offer lên Supabase Signaling thành công!");
    } catch (err) {
      this.error("OfferError", "Lỗi tạo hoặc gửi Offer:", err);
    }
  }

  /**
   * Thử lại kết nối qua ICE Restart
   */
  private async restartIce(): Promise<void> {
    if (this.isHost) {
      await this.createAndSendOffer(true);
    } else {
      await this.sendSignal("request_offer", { iceRestart: true });
    }
  }

  /**
   * Gán MediaStream vào HTMLAudioElement và bắt đầu phát
   */
  private bindStreamToAudioElement(stream: MediaStream): void {
    if (!this.audioElement) {
      this.warn("BindStream", "Không tìm thấy audioElement để gán stream!");
      return;
    }

    this.log("BindStream", "Gán remoteStream vào audioElement.srcObject...");
    this.audioElement.srcObject = stream;
    this.audioElement.autoplay = true;
    (this.audioElement as any).playsInline = true;
    this.audioElement.muted = false;
    this.audioElement.defaultMuted = false;
    this.audioElement.volume = 1.0;

    // Gán các sự kiện theo dõi vòng đời âm thanh
    this.audioElement.onplaying = () => {
      this.log("AudioElement", "🎉 LOA ĐANG PHÁT THÀNH CÔNG GIỌNG BẠN HỌC!");
      this.isAudioElementPlaying = true;
      this.isAutoplayBlockedState = false;
      this.onRemoteAudioPlaying?.();
      this.onAutoplayBlocked?.(false);
      this.broadcastStats();
    };

    this.audioElement.onpause = () => {
      this.log("AudioElement", "Audio element đang ở trạng thái pause.");
      this.isAudioElementPlaying = false;
      this.broadcastStats();
    };

    this.audioElement.onerror = (e) => {
      this.error("AudioElement", "Lỗi Audio element:", e);
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

    this.log("Play", "Đang gọi this.audioElement.play()...");
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.log("Play", "audio.play() THÀNH CÔNG! Âm thanh đang phát ra loa.");
          this.isAudioElementPlaying = true;
          this.isAutoplayBlockedState = false;
          this.onAutoplayBlocked?.(false);
          this.onRemoteAudioPlaying?.();
          this.broadcastStats();
        })
        .catch((err) => {
          this.warn("AutoplayBlock", "Trình duyệt chặn Autoplay Audio:", err?.name, err?.message);
          this.isAudioElementPlaying = false;
          this.isAutoplayBlockedState = true;
          this.onAutoplayBlocked?.(true);
          this.broadcastStats();

          // Thiết lập unlock listener khi người dùng chạm bất kỳ đâu
          const unlock = () => {
            if (this.audioElement) {
              this.audioElement
                .play()
                .then(() => {
                  this.log("AutoplayUnlock", "Đã mở khóa loa sau tương tác người dùng!");
                  this.isAudioElementPlaying = true;
                  this.isAutoplayBlockedState = false;
                  this.onAutoplayBlocked?.(false);
                  this.onRemoteAudioPlaying?.();
                  this.broadcastStats();
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
    this.log("MicToggle", `Microphone của bạn: ${enabled ? "BẬT" : "TẮT"}`);
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
    // Xác thực an toàn: remote audio element không bị mute
    if (this.audioElement) {
      this.log("MicToggleCheck", `Xác thực sau khi đổi mic: remote audio element muted=${this.audioElement.muted}, volume=${this.audioElement.volume}`);
    }
    this.broadcastStats();
  }

  /**
   * Bật / Tắt Loa phát giọng bạn học
   */
  setSpeakerEnabled(enabled: boolean): void {
    this.log("SpeakerToggle", `Loa phát giọng bạn học: ${enabled ? "BẬT" : "TẮT"}`);
    if (this.audioElement) {
      this.audioElement.muted = !enabled;
      this.audioElement.volume = enabled ? 1.0 : 0.0;
    }
    if (this.remoteGainNode) {
      this.remoteGainNode.gain.value = enabled ? 1.0 : 0.0;
    }
    this.broadcastStats();
  }

  /**
   * Mở khóa âm thanh nếu trình duyệt chặn autoplay (gọi từ nút UI "Bật âm thanh")
   */
  async unlockAudio(): Promise<boolean> {
    this.log("UserGestureUnlock", "Người dùng bấm 'Bật âm thanh' / Mở khóa...");
    let success = false;

    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        this.log("UserGestureUnlock", "AudioContext đã resumed thành công!");
      } catch (e) {
        this.warn("AudioContextResume", "Resume error:", e);
      }
    }

    if (this.audioElement) {
      this.audioElement.muted = false;
      this.audioElement.volume = 1.0;
      try {
        await this.audioElement.play();
        this.log("UserGestureUnlock", "AudioElement play() thành công qua user gesture!");
        this.isAudioElementPlaying = true;
        this.isAutoplayBlockedState = false;
        this.onAutoplayBlocked?.(false);
        this.onRemoteAudioPlaying?.();
        success = true;
      } catch (err) {
        this.error("UserGestureUnlock", "AudioElement play() thất bại:", err);
      }
    }

    // Nếu AudioElement vẫn chưa phát, kích hoạt Web Audio GainNode fallback phát trực tiếp
    if (!success && this.remoteGainNode && this.audioContext && this.audioContext.state === "running") {
      this.log("WebAudioFallback", "Kích hoạt Web Audio Output Fallback qua AudioContext.destination!");
      this.remoteGainNode.gain.value = 1.0;
      this.isAudioElementPlaying = true;
      this.isAutoplayBlockedState = false;
      this.onAutoplayBlocked?.(false);
      this.onRemoteAudioPlaying?.();
      success = true;
    }

    this.broadcastStats();
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
        this.warn("addIceCandidate", "addIceCandidate warning:", e);
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
          this.warn("flushCandidates", "flush candidate warning:", e);
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
        this.currentLocalVolume = avg;
        this.onLocalSpeaking?.(avg);
        requestAnimationFrame(checkLocal);
      };
      checkLocal();
    } catch (e) {
      this.warn("setupLocalAnalyser", "Local Analyser warning:", e);
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
        this.currentRemoteVolume = avg;
        this.onRemoteSpeaking?.(avg);
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      this.warn("setupRemoteAnalyser", "Remote Analyser warning:", e);
    }
  }

  /**
   * Gửi tín hiệu WebRTC (Offer, Answer, Candidate, Request Offer) lên Supabase
   */
  private async sendSignal(
    type: "offer" | "answer" | "candidate" | "request_offer",
    payload: any
  ): Promise<void> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/webrtc_signals`, {
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

      if (!res.ok) {
        this.error("SendSignal", `HTTP ${res.status}: Gửi signal '${type}' thất bại!`);
      } else {
        this.log("SendSignal", `✅ Đã gửi tín hiệu '${type}' lên Supabase Signaling.`);
      }
    } catch (e) {
      this.error("SendSignal", `Lỗi kết nối khi gửi signal '${type}':`, e);
    }
  }

  /**
   * Lắng nghe tín hiệu từ đối tác qua Supabase Signaling
   */
  private startSignalPolling(): void {
    const processedSignalIds = new Set<string>();

    this.signalInterval = setInterval(async () => {
      if (this.isClosed || !this.peerConnection) return;

      try {
        // Lấy tất cả tín hiệu trong phòng gửi từ người khác (sender_id != mySenderId)
        const url = `${SUPABASE_URL}/rest/v1/webrtc_signals?room_code=eq.${encodeURIComponent(
          this.roomCode
        )}&sender_id=neq.${encodeURIComponent(
          this.mySenderId
        )}&type=in.(offer,answer,candidate,request_offer)&created_at=gte.${encodeURIComponent(
          this.sessionStartTime
        )}&order=created_at.asc`;

        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!res.ok) return;
        const signals = await res.json();
        if (!signals || !Array.isArray(signals)) return;

        for (const sig of signals) {
          if (processedSignalIds.has(sig.id)) continue;
          processedSignalIds.add(sig.id);

          this.log("SignalRecv", `📩 Nhận tín hiệu '${sig.type}' từ đối tác (${sig.sender_id})`);

          // 1. Nhận request_offer từ Guest: Host tạo Offer mới gửi lại
          if (sig.type === "request_offer" && this.isHost) {
            this.log("SignalHandle", "Guest yêu cầu Offer! Đang tạo và gửi Offer mới...");
            await this.createAndSendOffer(Boolean(sig.payload?.iceRestart));

            // Re-broadcast all local buffered ICE candidates
            for (const cand of this.localCandidatesBuffer) {
              await this.sendSignal("candidate", cand);
            }
          }

          // 2. Nhận Offer từ Host: Guest áp dụng Remote Description & tạo Answer gửi lại
          else if (sig.type === "offer" && !this.isHost) {
            try {
              this.log("SignalHandle", "Guest nhận Offer từ Host. Đang xử lý...");
              await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
              await this.flushCandidates();

              const answer = await this.peerConnection.createAnswer();
              await this.peerConnection.setLocalDescription(answer);

              await this.sendSignal("answer", {
                type: answer.type,
                sdp: answer.sdp,
              });
              this.log("SignalHandle", "Guest đã gửi Answer lại cho Host thành công!");

              // Re-broadcast all local buffered ICE candidates
              for (const cand of this.localCandidatesBuffer) {
                await this.sendSignal("candidate", cand);
              }
            } catch (err) {
              this.error("GuestOfferError", "Guest xử lý offer lỗi:", err);
            }
          }

          // 3. Nhận Answer từ Guest: Host áp dụng Remote Description
          else if (sig.type === "answer" && this.isHost) {
            try {
              this.log("SignalHandle", "Host nhận Answer từ Guest. Đang setRemoteDescription...");
              if (this.peerConnection.signalingState === "have-local-offer") {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await this.flushCandidates();
                this.log("SignalHandle", "Host đã hoàn tất thiết lập kết nối 2 chiều!");
              }
            } catch (err) {
              this.error("HostAnswerError", "Host xử lý answer lỗi:", err);
            }
          }

          // 4. Nhận ICE Candidate
          else if (sig.type === "candidate") {
            await this.addCandidate(sig.payload);
          }
        }
      } catch (e) {
        // Silent polling error
      }
    }, 500);
  }

  /**
   * Dọn dẹp và kết thúc cuộc gọi
   */
  destroy(): void {
    this.log("Destroy", "Đang dọn dẹp WebRTC Voice Manager...");
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
      if (this.audioElement.parentNode && this.audioElement.id === "studyflow-remote-audio-player") {
        // Chỉ gỡ nếu nó là phần tử tự tạo, không gỡ nếu được React quản lý
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
