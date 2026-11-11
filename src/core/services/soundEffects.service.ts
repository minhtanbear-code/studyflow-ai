/**
 * Web Audio API Sound & Background Music Service
 * Hoạt động 100% offline, không phụ thuộc file mp3 ngoài, không lo lỗi 404 hay CORS.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: NodeJS.Timeout | null = null;
  private bgmGainNode: GainNode | null = null;
  private volume: number = 0.15; // Âm lượng nhạc nền êm dịu, nhẹ nhàng, hỗ trợ tập trung

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Phát một nốt nhạc synth êm dịu (chime/bell/kalimba)
   */
  private playTone(freq: number, type: OscillatorType, duration: number, gainValue: number, startTimeOffset: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + startTimeOffset);
      gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + startTimeOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTimeOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration + 0.1);
    } catch (e) {
      // Audio fallback silent
    }
  }

  /**
   * Bắt đầu vòng lặp nhạc nền Luyện tập / Học tập (Lo-fi Study Beats & Chords)
   * Giai điệu thư giãn, tạo cảm giác tập trung và vui tươi cho sinh viên.
   */
  public startBackgroundMusic() {
    if (this.isBgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmPlaying = true;

    // Giai điệu Lo-fi Study (hợp âm Cmaj7 - Am7 - Fmaj7 - G7 êm ái)
    const melodyPattern = [
      // Bar 1: Cmaj7
      { freq: 261.63, delay: 0 },    // C4
      { freq: 329.63, delay: 0.35 }, // E4
      { freq: 392.00, delay: 0.7 },  // G4
      { freq: 493.88, delay: 1.05 }, // B4
      { freq: 392.00, delay: 1.4 },  // G4

      // Bar 2: Am7
      { freq: 220.00, delay: 1.75 }, // A3
      { freq: 261.63, delay: 2.1 },  // C4
      { freq: 329.63, delay: 2.45 }, // E4
      { freq: 392.00, delay: 2.8 },  // G4

      // Bar 3: Fmaj7
      { freq: 174.61, delay: 3.15 }, // F3
      { freq: 261.63, delay: 3.5 },  // C4
      { freq: 329.63, delay: 3.85 }, // E4
      { freq: 349.23, delay: 4.2 },  // F4

      // Bar 4: G
      { freq: 196.00, delay: 4.55 }, // G3
      { freq: 246.94, delay: 4.9 },  // B3
      { freq: 293.66, delay: 5.25 }, // D4
      { freq: 392.00, delay: 5.6 },  // G4
    ];

    const loopLengthSeconds = 6.0;

    const playLoop = () => {
      if (!this.isBgmPlaying) return;
      const now = this.getContext()?.currentTime || 0;

      melodyPattern.forEach((note) => {
        // Bass / pad tone
        this.playTone(note.freq, "sine", 0.6, this.volume * 0.4, note.delay);
        // Triangle harmonic for warm kalimba vibe
        this.playTone(note.freq * 2, "triangle", 0.3, this.volume * 0.2, note.delay);
      });
    };

    playLoop();
    this.bgmInterval = setInterval(playLoop, loopLengthSeconds * 1000);
  }

  /**
   * Tạm dừng nhạc nền
   */
  public stopBackgroundMusic() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  /**
   * Chuyển đổi bật/tắt nhạc nền
   */
  public toggleBackgroundMusic(): boolean {
    if (this.isBgmPlaying) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  /**
   * Hiệu ứng âm thanh khi trả lời ĐÚNG (Tiếng chuông ngân vui tươi C5 - E5 - G5 - C6)
   */
  public playCorrectSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
      this.playTone(f, "triangle", 0.3, 0.25, idx * 0.08);
    });
  }

  /**
   * Hiệu ứng âm thanh khi trả lời SAI (Tone trầm nhẹ nhàng không gây khó chịu)
   */
  public playWrongSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(220, "sawtooth", 0.25, 0.15, 0);
    this.playTone(185, "sawtooth", 0.3, 0.15, 0.12);
  }

  /**
   * Hiệu ứng đếm ngược thời gian (Tik-tok nhẹ)
   */
  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(800, "sine", 0.05, 0.08, 0);
  }

  /**
   * Hiệu ứng chiến thắng khi hoàn thành trận
   */
  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const fanfare = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 659.25, d: 0.15, t: 0.15 },
      { f: 783.99, d: 0.2, t: 0.3 },
      { f: 1046.5, d: 0.6, t: 0.5 },
    ];
    fanfare.forEach((n) => {
      this.playTone(n.f, "triangle", n.d, 0.3, n.t);
    });
  }
}

export const soundEffects = new SoundEffectsService();
