"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  Mic,
  MicOff,
  Music,
  Radio,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { getQuestionsBySubject, QuizQuestion } from "@/core/data/quizQuestions";
import { soundEffects } from "@/core/services/soundEffects.service";
import { userService } from "@/core/services/userService";
import { voiceRealtimeService } from "@/core/services/voiceRealtimeService";
import { WebRTCVoiceManager, WebRTCVoiceStats } from "@/core/services/webrtcService";
import { QuizConfigData } from "./PKQuizConfigurationScreen";

interface PKActiveVoiceQuizProps {
  subject: PKSubject;
  roomName: string;
  roomCode: string;
  friendName: string;
  friendAvatar: string;
  config?: QuizConfigData;
  isHost?: boolean;
  onLeave: () => void;
  customQuestions?: QuizQuestion[];
}

export function PKActiveVoiceQuiz({
  subject,
  roomName,
  roomCode,
  friendName,
  friendAvatar,
  config,
  isHost = true,
  onLeave,
  customQuestions,
}: PKActiveVoiceQuizProps) {
  // Questions list based on configured count (or AI generated set)
  const questions: QuizQuestion[] = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) {
      return customQuestions;
    }
    return getQuestionsBySubject(subject.id || subject.name, config?.questionCount || 5);
  }, [customQuestions, subject, config]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ = questions[currentQIndex] || questions[0];

  // Countdown timer for current question (60 seconds)
  const [timeLeft, setTimeLeft] = useState(60);

  // Learning Support drawers/modals
  const [showHintModal, setShowHintModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // =========================================================
  // 1. PLAYER 1 (USER) STATE
  // =========================================================
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [userSubmitted, setUserSubmitted] = useState<boolean>(false);
  const [userScoreCount, setUserScoreCount] = useState(0);

  // =========================================================
  // 2. PLAYER 2 (FRIEND) STATE
  // =========================================================
  const [peerStatus, setPeerStatus] = useState<
    "dang_suy_nghi" | "dang_noi" | "da_chot"
  >("dang_suy_nghi");
  const [peerSelectedOption, setPeerSelectedOption] = useState<number | null>(null);
  const [peerSubmitted, setPeerSubmitted] = useState<boolean>(false);
  const [peerScoreCount, setPeerScoreCount] = useState(0);

  // Current user identity & partner states
  const currentUser = userService.getCurrentUser();
  const isRealPeer = Boolean(friendName && !friendName.toLowerCase().includes("bot") && friendName !== "Bot Luyện Tập");
  const [friendMicOn, setFriendMicOn] = useState(true);
  const [partnerLeft, setPartnerLeft] = useState(false);
  const webrtcManagerRef = useRef<WebRTCVoiceManager | null>(null);

  // Lắng nghe đồng bộ thao tác làm bài (chọn đáp án, chốt câu) từ bạn học thật
  useEffect(() => {
    if (!isRealPeer) return;

    const unsub = voiceRealtimeService.subscribeToQuizActions(roomCode, currentUser.id, (action) => {
      if (action.type === "select" && action.questionIndex === currentQIndex) {
        setPeerSelectedOption(action.optionIndex ?? null);
        setPeerStatus("dang_suy_nghi");
      } else if (action.type === "submit" && action.questionIndex === currentQIndex) {
        setPeerSelectedOption(action.optionIndex ?? null);
        setPeerSubmitted(true);
        setPeerStatus("da_chot");
        if (action.isCorrect) {
          setPeerScoreCount((prev) => prev + 1);
        }
      } else if (action.type === "next_question" && action.questionIndex > currentQIndex) {
        setCurrentQIndex(action.questionIndex);
      }
    });

    return () => unsub();
  }, [roomCode, currentUser.id, currentQIndex, isRealPeer]);

  // =========================================================
  // 3. VOICE & AUDIO CONNECTION STATE
  // =========================================================
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [voiceConnectionState, setVoiceConnectionState] = useState<
    "connected" | "connecting" | "reconnecting"
  >("connecting");
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [peerIsSpeaking, setPeerIsSpeaking] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [webrtcStats, setWebrtcStats] = useState<WebRTCVoiceStats | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Nhận diện trình duyệt thực tế đang chạy (Edge vs Chrome)
  const currentBrowserName = useMemo(() => {
    if (typeof window === "undefined") return "Trình duyệt";
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("Chrome/")) return "Google Chrome";
    if (ua.includes("Firefox/")) return "Mozilla Firefox";
    return "Trình duyệt Chromium";
  }, []);

  // Dedicated DOM Audio Element ref for peer voice
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Khởi tạo kết nối WebRTC Voice và lắng nghe đồng bộ phòng thời gian thực
  useEffect(() => {
    const manager = new WebRTCVoiceManager(roomCode, currentUser.id, isHost);
    webrtcManagerRef.current = manager;

    // Gắn trực tiếp Audio Element từ React component
    if (remoteAudioRef.current) {
      manager.attachAudioElement(remoteAudioRef.current);
    }

    manager.onLocalSpeaking = (volume) => {
      setUserIsSpeaking(volume > 15);
    };

    manager.onRemoteSpeaking = (volume) => {
      setPeerIsSpeaking(volume > 15);
    };

    manager.onAutoplayBlocked = (blocked) => {
      setIsAutoplayBlocked(blocked);
    };

    manager.onRemoteAudioPlaying = () => {
      setIsAutoplayBlocked(false);
    };

    manager.onStatsUpdate = (stats) => {
      setWebrtcStats(stats);
    };

    manager.onError = (err) => {
      console.warn("[PKActiveVoiceQuiz] WebRTC Error:", err);
    };

    manager.onConnectionStateChange = (state) => {
      if (state === "connected") {
        setVoiceConnectionState("connected");
      } else if (state === "connecting" || state === "new") {
        setVoiceConnectionState("connecting");
      } else {
        setVoiceConnectionState("reconnecting");
      }
    };

    manager.start();

    // Lắng nghe trạng thái micro và phòng từ bạn học
    const unsub = voiceRealtimeService.subscribeToRoom(roomCode, (room) => {
      if (room.status === "closed") {
        setPartnerLeft(true);
      }
    });

    return () => {
      unsub();
      manager.destroy();
    };
  }, [roomCode, isHost, currentUser.id]);

  // Both players submitted => Reveal Answer Stage
  const isBothSubmitted = userSubmitted && peerSubmitted;
  const isFinishedAll = currentQIndex >= questions.length - 1 && isBothSubmitted;

  // Gentle Background Music Lifecycle Effect (Volume nhẹ nhàng, không lấn át đàm thoại)
  useEffect(() => {
    soundEffects.setVolume(0.14); // Nhẹ êm dịu, chuẩn học tập
    if (isMusicOn) {
      soundEffects.startBackgroundMusic();
    } else {
      soundEffects.stopBackgroundMusic();
    }
    return () => {
      soundEffects.stopBackgroundMusic();
    };
  }, [isMusicOn]);

  // Fanfare when finished
  useEffect(() => {
    if (isFinishedAll) {
      soundEffects.stopBackgroundMusic();
      if (isMusicOn) soundEffects.playVictoryFanfare();
    }
  }, [isFinishedAll, isMusicOn]);

  // Sound chime when both players answer correctly
  useEffect(() => {
    if (isBothSubmitted && isMusicOn) {
      if (userSelectedOption === currentQ.correct && peerSelectedOption === currentQ.correct) {
        soundEffects.playCorrectSound();
      }
    }
  }, [isBothSubmitted, isMusicOn, userSelectedOption, peerSelectedOption, currentQ]);

  // Countdown Timer Effect with subtle tick
  useEffect(() => {
    if (isBothSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1 && isMusicOn) {
          soundEffects.playTick();
        }
        if (prev <= 1) {
          // Time out => auto confirm current selection
          if (!userSubmitted) setUserSubmitted(true);
          if (!peerSubmitted) {
            setPeerSubmitted(true);
            setPeerStatus("da_chot");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBothSubmitted, userSubmitted, peerSubmitted, isMusicOn]);

  // Question Reset Effect
  useEffect(() => {
    setUserSelectedOption(null);
    setUserSubmitted(false);
    setPeerSelectedOption(null);
    setPeerSubmitted(false);
    setPeerStatus("dang_suy_nghi");
    setTimeLeft(60);

    // Nếu đấu với người thật, không chạy timer mô phỏng bot
    if (!isRealPeer) {
      // Peer simulated voice discussion timeline (chỉ dùng khi đấu với Bot)
      const peerSpeakTimer = setTimeout(() => {
        setPeerIsSpeaking(true);
        setPeerStatus("dang_noi");

        setTimeout(() => {
          setPeerIsSpeaking(false);
          setPeerStatus("dang_suy_nghi");
        }, 4000);

        // Peer selects realistic answer
        const correctIdx = currentQ.correct;
        const willBeCorrect = Math.random() < 0.8;
        const peerPick = willBeCorrect
          ? correctIdx
          : (correctIdx + 1) % currentQ.options.length;

        setPeerSelectedOption(peerPick);

        // Peer confirms after discussion
        const peerConfirmTimer = setTimeout(() => {
          setPeerSubmitted(true);
          setPeerStatus("da_chot");
          if (peerPick === correctIdx) {
            setPeerScoreCount((prev) => prev + 1);
          }
        }, 4500);

        return () => clearTimeout(peerConfirmTimer);
      }, 3000);

      return () => clearTimeout(peerSpeakTimer);
    }
  }, [currentQIndex, currentQ]);

  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    webrtcManagerRef.current?.setMicEnabled(next);
    voiceRealtimeService.updateMicState(roomCode, isHost, next);
  };

  const handleToggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    webrtcManagerRef.current?.setSpeakerEnabled(next);
    if (next) {
      webrtcManagerRef.current?.unlockAudio();
    }
  };

  const handleSelectOption = (idx: number) => {
    webrtcManagerRef.current?.unlockAudio();
    if (userSubmitted) return;
    setUserSelectedOption(idx);
    if (isRealPeer) {
      voiceRealtimeService.broadcastQuizAction(roomCode, currentUser.id, {
        type: "select",
        questionIndex: currentQIndex,
        optionIndex: idx,
      });
    }
  };

  const handleConfirmAnswer = () => {
    if (userSelectedOption === null || userSubmitted) return;
    setUserSubmitted(true);
    const isCorrect = userSelectedOption === currentQ.correct;
    if (isCorrect) {
      setUserScoreCount((prev) => prev + 1);
    }
    if (isRealPeer) {
      voiceRealtimeService.broadcastQuizAction(roomCode, currentUser.id, {
        type: "submit",
        questionIndex: currentQIndex,
        optionIndex: userSelectedOption,
        isCorrect,
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      if (isRealPeer) {
        voiceRealtimeService.broadcastQuizAction(roomCode, currentUser.id, {
          type: "next_question",
          questionIndex: nextIdx,
        });
      }
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* TOP HEADER: BRAND, ROOM META & VOICE CONTROL BAR          */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Exit & Room Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all group"
            title="Rời phòng Voice học"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Rời phòng</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-black text-[#17133B]">{roomName}</span>
                <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.5 rounded-md">
                  {roomCode}
                </span>
              </div>
              <span className="text-[11px] text-[#77738F] font-medium hidden sm:block mt-0.5">
                Môn: {subject.name} • 2 người đang học
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live WebRTC Audio Pill & Step 3 Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          {/* 3-Step Progress Indicator (Step 3: Active) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Thiết lập</span>
            </span>
            <div className="w-2 h-0.5 bg-emerald-300" />
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Mời bạn</span>
            </span>
            <div className="w-2 h-0.5 bg-emerald-300" />
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-[#7C3AED] text-white text-[9px] flex items-center justify-center font-bold">
                3
              </span>
              <span>Bắt đầu ôn tập ({currentQIndex + 1}/{questions.length})</span>
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              voiceConnectionState === "connected"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : voiceConnectionState === "connecting"
                ? "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                : "bg-rose-50 text-rose-700 border-rose-300"
            }`}
          >
            {voiceConnectionState === "connecting" ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            ) : (
              <Radio
                className={`w-3.5 h-3.5 ${
                  voiceConnectionState === "connected"
                    ? "text-emerald-600 animate-pulse"
                    : "text-rose-500 animate-pulse"
                }`}
              />
            )}
            <span>
              {voiceConnectionState === "connected"
                ? "WebRTC Voice Live"
                : voiceConnectionState === "connecting"
                ? "Đang kết nối Voice..."
                : "Đang kết nối lại..."}
            </span>
          </div>
        </div>

        {/* Right: Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              isMicOn
                ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                : "bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200"
            }`}
            title={isMicOn ? "Microphone đang BẬT (Bấm để tắt)" : "Microphone đang TẮT (Bấm để bật)"}
          >
            {isMicOn ? (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Mic: Bật</span>
                {/* Audio Waves */}
                <span className="flex items-end gap-0.5 h-3">
                  <span
                    className={`w-0.5 bg-white rounded-full transition-all ${
                      userIsSpeaking ? "h-3 animate-bounce" : "h-1"
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-white rounded-full transition-all ${
                      userIsSpeaking ? "h-4 animate-bounce delay-75" : "h-2"
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-white rounded-full transition-all ${
                      userIsSpeaking ? "h-2 animate-bounce delay-150" : "h-1"
                    }`}
                  />
                </span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">Mic: Tắt</span>
              </>
            )}
          </button>

          {/* Speaker Toggle */}
          <button
            type="button"
            onClick={handleToggleSpeaker}
            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              isSpeakerOn
                ? "bg-white text-slate-700 border-[#E8E4F3] hover:border-[#7C3AED]"
                : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
            title={isSpeakerOn ? "Loa: BẬT" : "Loa: TẮT"}
          >
            {isSpeakerOn ? <Volume2 className="w-4 h-4 text-[#7C3AED]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Gentle BGM Toggle (Nhạc nền nhẹ) */}
          <button
            type="button"
            onClick={() => {
              const next = !isMusicOn;
              setIsMusicOn(next);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              isMusicOn
                ? "bg-[#FAF8FF] text-[#7C3AED] border-[#EDE9FE] hover:bg-[#EDE9FE]/60"
                : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/60"
            }`}
            title={isMusicOn ? "Đang phát nhạc nền nhẹ nhàng (Bấm để tắt)" : "Nhạc nền đang tắt (Bấm để bật)"}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicOn ? "text-[#7C3AED] animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{isMusicOn ? "Nhạc nhẹ: Bật" : "Nhạc: Tắt"}</span>
            {isMusicOn && (
              <span className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-0.5 h-2.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-0.5 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* DEDICATED DOM AUDIO ELEMENT FOR PEER VOICE STREAM (React-managed) */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        id="studyflow-remote-audio-player"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0.001,
          pointerEvents: "none",
        }}
      />

      {/* AUTOPLAY BLOCKED BANNER WITH ONE-CLICK "BẬT ÂM THANH" BUTTON */}
      {isAutoplayBlocked && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-lg animate-in slide-in-from-top-2 border-b border-amber-600 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <VolumeX className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black block">
                Trình duyệt đang chặn âm thanh tự động từ bạn học!
              </span>
              <span className="text-[11px] text-white/90 font-medium">
                Do chính sách bảo vệ tự động phát (Autoplay) của trình duyệt. Vui lòng bấm nút bên phải để kích hoạt loa:
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const res = await webrtcManagerRef.current?.unlockAudio();
              if (res) {
                setIsAutoplayBlocked(false);
              }
            }}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-black text-xs transition-all shadow-md shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Bật âm thanh</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN DESKTOP LAYOUT (MATCHING REFERENCE IMAGE) */}
      {/* ========================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* ======================================================= */}
        {/* AREA A: LEFT / CENTRAL AREA – QUESTION & ANSWERS (65%)  */}
        {/* ======================================================= */}
        <main className="flex-1 bg-white rounded-3xl p-5 sm:p-8 border border-[#E8E4F3] shadow-sm flex flex-col justify-between space-y-6">
          {/* Progress Header & Countdown Timer */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black text-xs">
                  Câu hỏi {currentQIndex + 1} / {questions.length}
                </span>
                <span className="text-xs font-bold text-[#77738F] hidden sm:inline">
                  {subject.name} • {currentQ.topic}
                </span>
              </div>

              {/* Countdown Timer Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all ${
                  timeLeft <= 10
                    ? "bg-rose-50 text-rose-600 border-rose-300 animate-pulse"
                    : "bg-[#FAF8FF] text-[#7C3AED] border-[#EDE9FE]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E8E4F3] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text Box */}
          <div className="p-4 sm:p-6 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE]">
            <h2 className="text-base sm:text-lg font-black text-[#17133B] leading-relaxed">
              {currentQ.q}
            </h2>
          </div>

          {/* 4 Large Answer Cards: A, B, C, D */}
          <div className="space-y-3">
            {currentQ.options.map((optionText, optIdx) => {
              const letter = optionLetters[optIdx];
              const isUserSelected = userSelectedOption === optIdx;
              const isCorrect = isBothSubmitted && optIdx === currentQ.correct;
              const isUserWrong = isBothSubmitted && isUserSelected && !isCorrect;
              const isPeerPicked = isBothSubmitted && peerSelectedOption === optIdx;

              let cardStyles = "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/70 hover:bg-[#FAF8FF]";
              let letterStyles = "bg-[#F8F7FC] text-[#77738F] border-[#E8E4F3]";

              if (!isBothSubmitted) {
                if (isUserSelected) {
                  cardStyles = "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE] shadow-xs";
                  letterStyles = "bg-[#7C3AED] text-white border-[#7C3AED]";
                }
              } else {
                if (isCorrect) {
                  cardStyles = "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200 shadow-sm";
                  letterStyles = "bg-emerald-600 text-white border-emerald-600";
                } else if (isUserWrong) {
                  cardStyles = "border-rose-400 bg-rose-50/50";
                  letterStyles = "bg-rose-500 text-white border-rose-500";
                } else {
                  cardStyles = "border-slate-200 bg-white opacity-60";
                }
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => {
                    if (!userSubmitted) {
                      handleSelectOption(optIdx);
                    }
                  }}
                  className={`w-full rounded-2xl p-4 border-2 transition-all flex items-start justify-between gap-3 ${
                    userSubmitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                  } ${cardStyles}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border shrink-0 transition-all ${letterStyles}`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#17133B] pt-1 leading-relaxed">
                      {optionText}
                    </span>
                  </div>

                  {/* Submission badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                    {!isBothSubmitted && isUserSelected && (
                      <span className="text-[11px] font-black text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Bạn đã chọn</span>
                      </span>
                    )}

                    {isBothSubmitted && (
                      <div className="flex flex-wrap items-center gap-1 justify-end">
                        {isCorrect && (
                          <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đáp án Đúng</span>
                          </span>
                        )}

                        {isUserSelected && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Bạn chọn
                          </span>
                        )}

                        {isPeerPicked && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {friendName} chọn
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===================================================== */}
          {/* AREA D – LEARNING SUPPORT & CONFIRMATION BAR          */}
          {/* ===================================================== */}
          {!isBothSubmitted ? (
            <div className="pt-4 border-t border-[#E8E4F3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 💡 "Gợi ý" button */}
                <button
                  type="button"
                  onClick={() => setShowHintModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] flex items-center gap-1.5 transition-all"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gợi ý</span>
                </button>

                {/* 📖 "Ôn lại kiến thức" button */}
                <button
                  type="button"
                  onClick={() => setShowKnowledgeModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] flex items-center gap-1.5 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Ôn lại kiến thức</span>
                </button>
              </div>

              {/* 🔒 "Chốt đáp án" button */}
              <div className="w-full sm:w-auto">
                {!userSubmitted ? (
                  <button
                    type="button"
                    disabled={userSelectedOption === null}
                    onClick={handleConfirmAnswer}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                      userSelectedOption !== null
                        ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:scale-98 shadow-purple-200"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chốt đáp án</span>
                  </button>
                ) : (
                  <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#EDE9FE] text-[#7C3AED] font-black text-xs flex items-center justify-center gap-2 border border-[#7C3AED]/30">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                    <span>Đang chờ {friendName} chốt đáp án...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AFTER REVEAL EXPLANATION CARD */
            <div className="pt-4 border-t border-[#E8E4F3] space-y-4 animate-in fade-in duration-300">
              <div
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-2 ${
                  userSelectedOption === currentQ.correct && peerSelectedOption === currentQ.correct
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-purple-50 text-purple-900 border border-purple-200"
                }`}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                  {userSelectedOption === currentQ.correct && peerSelectedOption === currentQ.correct ? (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span>🎉 Xuất sắc! Cả hai bạn đều trả lời chính xác!</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5 text-[#7C3AED]" />
                      <span>💡 Hai bạn có góc nhìn khác nhau. Hãy cùng trao đổi qua Mic nhé!</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] font-bold text-[#77738F]">
                  Đáp án chuẩn: <strong className="text-emerald-700">{optionLetters[currentQ.correct]}</strong>
                </div>
              </div>

              {/* Explanation of correct answer */}
              <div className="space-y-1 text-xs">
                <span className="font-black text-[#17133B] block">Giải thích lý do đúng:</span>
                <p className="text-[#77738F] font-medium leading-relaxed pl-1">
                  {currentQ.explanation}
                </p>
              </div>

              {/* Breakdown of other options */}
              {currentQ.optionsAnalysis && (
                <div className="space-y-1 pt-2 border-t border-[#E8E4F3] text-xs">
                  <span className="font-black text-[#17133B] block">Phân tích các phương án còn lại:</span>
                  <div className="space-y-1 pl-1">
                    {currentQ.optionsAnalysis.map((item, idx) => (
                      <div key={idx} className="text-[11px] text-[#77738F]">
                        <strong className="text-[#7C3AED] mr-1">{optionLetters[idx]}:</strong>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Core takeaway */}
              {currentQ.takeaway && (
                <div className="p-3 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] text-xs flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#7C3AED] block mb-0.5">Ghi nhớ cốt lõi:</strong>
                    <span className="text-[#17133B] font-medium leading-relaxed">
                      {currentQ.takeaway}
                    </span>
                  </div>
                </div>
              )}

              {/* Next Question Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9] shadow-md shadow-purple-200 flex items-center gap-1.5 transition-all"
                >
                  <span>{currentQIndex + 1 < questions.length ? "Câu tiếp theo" : "Xem tổng kết buổi học"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ======================================================= */}
        {/* AREA B: RIGHT AREA – TWO PLAYERS & VOICE PANEL (35%)    */}
        {/* ======================================================= */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          {/* TWO PLAYERS PROFILES CARDS */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E4F3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4F3]">
              <div className="flex items-center gap-2 font-black text-xs text-[#17133B]">
                <Users className="w-4 h-4 text-[#7C3AED]" />
                <span>Thành viên trong phòng (2/2)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Voice Live
              </span>
            </div>

            {/* PLAYER 1: BẠN (CURRENT USER) */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition-all space-y-2 ${
                userSubmitted
                  ? "bg-[#FAF8FF] border-[#7C3AED]/70 shadow-xs"
                  : "bg-slate-50/60 border-[#E8E4F3]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs transition-all ${
                        userIsSpeaking ? "ring-4 ring-emerald-400 scale-105" : ""
                      }`}
                    >
                      {currentUser.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        isMicOn ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                      }`}
                    >
                      {isMicOn ? <Mic className="w-2.5 h-2.5" /> : <MicOff className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#17133B]">Bạn ({currentUser.fullName})</h4>
                    <span className="text-[10px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.2 rounded-md">
                      {isHost ? "Chủ phòng" : "Khách mời"}
                    </span>
                  </div>
                </div>

                {/* Animated Waveform if speaking */}
                {userIsSpeaking && isMicOn && (
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-emerald-500 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce delay-150" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-[#77738F] font-medium">
                  {userIsSpeaking
                    ? "Đang nói..."
                    : isMicOn
                    ? "Đang nghe..."
                    : "Đã tắt micro"}
                </span>

                {userSubmitted ? (
                  <span className="font-black text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Đã chốt đáp án</span>
                  </span>
                ) : userSelectedOption !== null ? (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    Đang suy nghĩ ({optionLetters[userSelectedOption]})
                  </span>
                ) : (
                  <span className="text-slate-400">Chưa chọn</span>
                )}
              </div>
            </div>

            {/* PLAYER 2: BẠN CÙNG HỌC */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition-all space-y-2 ${
                peerSubmitted
                  ? "bg-[#FAF8FF] border-[#7C3AED]/70 shadow-xs"
                  : "bg-slate-50/60 border-[#E8E4F3]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs transition-all ${
                        peerIsSpeaking ? "ring-4 ring-emerald-400 scale-105" : ""
                      }`}
                    >
                      {friendAvatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        friendMicOn ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                      }`}
                    >
                      {friendMicOn ? <Mic className="w-2.5 h-2.5" /> : <MicOff className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#17133B]">{friendName}</h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                      {isHost ? "Khách mời" : "Chủ phòng"}
                    </span>
                  </div>
                </div>

                {/* Animated Waveform if peer is speaking */}
                {peerIsSpeaking && friendMicOn && (
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-emerald-500 rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce delay-150" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-[#77738F] font-medium">
                  {peerIsSpeaking
                    ? "Đang nói..."
                    : friendMicOn
                    ? peerSubmitted
                      ? "Đang nghe..."
                      : "Đang suy nghĩ..."
                    : "Đã tắt micro"}
                </span>

                {peerSubmitted ? (
                  <span className="font-black text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Đã chốt đáp án</span>
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Đang suy nghĩ...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AREA C: VOICE CONTROL PANEL WIDGET */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E4F3] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between text-xs font-black text-[#17133B]">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#7C3AED]" />
                <span>Bảng điều khiển thoại</span>
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${
                  voiceConnectionState === "connected"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                    : voiceConnectionState === "connecting"
                    ? "text-amber-800 bg-amber-50 border-amber-300 animate-pulse"
                    : "text-rose-700 bg-rose-50 border-rose-300"
                }`}
              >
                {voiceConnectionState === "connected"
                  ? "Đã kết nối"
                  : voiceConnectionState === "connecting"
                  ? "Đang kết nối..."
                  : "Mất kết nối"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isMicOn
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5 text-emerald-600" /> : <MicOff className="w-5 h-5 text-rose-600" />}
                <span>{isMicOn ? "Micro: Bật" : "Micro: Tắt"}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSpeaker}
                className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSpeakerOn
                    ? "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <span>{isSpeakerOn ? "Loa: Bật" : "Loa: Tắt"}</span>
              </button>
            </div>

            {/* Nhạc nền nhẹ toggle */}
            <div className="p-2.5 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Music className={`w-4 h-4 ${isMusicOn ? "text-[#7C3AED] animate-pulse" : "text-slate-400"}`} />
                <div>
                  <span className="font-bold text-[#17133B] block leading-none">Nhạc nền nhẹ</span>
                  <span className="text-[10px] text-[#77738F]">Lo-fi Study Chords</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMusicOn(!isMusicOn)}
                className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                  isMusicOn
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {isMusicOn ? "Đang bật" : "Tắt"}
              </button>
            </div>

            {/* Live WebRTC Diagnostic Status Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Kênh thoại P2P:</span>
                <span className="font-mono text-[10px] font-black text-[#7C3AED]">
                  {voiceConnectionState === "connected" ? "Live (P2P Mesh)" : "Đang bắt tay ICE..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Âm thanh bạn học:</span>
                <span className="font-bold flex items-center gap-1">
                  {webrtcStats?.remoteAudioPlaying ? (
                    <span className="text-emerald-600">Đang phát loa ✓</span>
                  ) : webrtcStats?.hasRemoteAudio ? (
                    <span className="text-blue-600">Đã nhận track RTP</span>
                  ) : (
                    <span className="text-slate-400">Đang chờ đối tác...</span>
                  )}
                </span>
              </div>

              {/* Nút mở rộng bảng DEBUG thời gian thực */}
              <button
                type="button"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="w-full mt-1.5 py-1.5 px-2.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-[#7C3AED] font-black text-[10px] flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#7C3AED]" />
                  <span>Bảng DEBUG ({currentBrowserName})</span>
                </span>
                <span>{showDebugPanel ? "▲ Ẩn chi tiết" : "▼ Xem thông số getStats()"}</span>
              </button>

              {/* BẢNG DEBUG CHI TIẾT THEO YÊU CẦU KIỂM THỬ (EDGE vs CHROME) */}
              {showDebugPanel && (
                <div className="pt-2 border-t border-slate-200 space-y-2 text-[10px] animate-in fade-in duration-200 font-sans">
                  {/* Tiêu đề & Vai trò */}
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-[#17133B]">{currentBrowserName}</span>
                    <span className="font-black text-[#7C3AED] bg-purple-100 px-1.5 py-0.5 rounded">
                      {isHost ? "Chủ phòng (Host)" : "Khách mời (Guest)"}
                    </span>
                  </div>

                  {/* 1. Micro Input & TX */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>1. Micro Gửi (TX):</span>
                      <span className={webrtcStats?.hasLocalAudio ? "text-emerald-600" : "text-rose-600"}>
                        {webrtcStats?.hasLocalAudio ? "LIVE ✓" : "CHƯA NHẬN"}
                      </span>
                    </div>
                    <div className="truncate text-[9px] text-slate-500 font-mono" title={webrtcStats?.micDeviceLabel}>
                      {webrtcStats?.micDeviceLabel || "Micro mặc định"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Âm lượng mic:</span>
                      <span className="font-mono font-bold text-slate-700">{webrtcStats?.localVolume || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-150"
                        style={{ width: `${Math.min(100, (webrtcStats?.localVolume || 0) * 2)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-0.5">
                      <span>Đã gửi (getStats):</span>
                      <span className="font-mono text-[9px] font-bold text-slate-700">
                        {Math.round((webrtcStats?.bytesSent || 0) / 1024)} KB ({webrtcStats?.packetsSent || 0} pkts)
                      </span>
                    </div>
                  </div>

                  {/* 2. Đường truyền P2P & ICE */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>2. Đường truyền P2P (ICE):</span>
                      <span className="font-mono text-purple-700 font-bold">{webrtcStats?.pcState}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Kiểu kết nối:</span>
                      <span className="font-mono text-[9px] text-slate-700 truncate max-w-[150px]">
                        {webrtcStats?.candidateType || "Đang thiết lập..."}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Độ trễ RTT / Jitter:</span>
                      <span className="font-mono text-slate-700">
                        {webrtcStats?.roundTripTimeMs || 0}ms / {webrtcStats?.jitterMs || 0}ms
                      </span>
                    </div>
                  </div>

                  {/* 3. Luồng nhận từ Bạn học (RX) */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>3. Nhận từ Bạn học (RX):</span>
                      <span className={webrtcStats?.remoteAudioLive ? "text-emerald-600" : "text-amber-600"}>
                        {webrtcStats?.remoteAudioLive ? "LIVE ✓" : "CHỜ PACKETS"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Đã nhận (getStats):</span>
                      <span className="font-mono text-[9px] font-bold text-slate-700">
                        {Math.round((webrtcStats?.bytesReceived || 0) / 1024)} KB ({webrtcStats?.packetsReceived || 0} pkts)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Gói tin rơi (Lost):</span>
                      <span className="font-mono text-slate-700">{webrtcStats?.packetsLost || 0} pkts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Âm lượng đối phương:</span>
                      <span className="font-mono font-bold text-slate-700">{webrtcStats?.remoteVolume || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-150"
                        style={{ width: `${Math.min(100, (webrtcStats?.remoteVolume || 0) * 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Loa & Playback */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>4. Phát ra Loa (Playback):</span>
                      <span className={webrtcStats?.remoteAudioPlaying ? "text-emerald-600" : "text-amber-600"}>
                        {webrtcStats?.remoteAudioPlaying ? "ĐANG PHÁT ✓" : "CHƯA PHÁT"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Thẻ &lt;audio&gt; DOM:</span>
                      <span className="font-mono text-[9px] text-slate-700">
                        paused: {String(webrtcStats?.audioElementPaused)} | mute: {String(webrtcStats?.audioElementMuted)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Thời gian phát thực:</span>
                      <span className="font-mono text-slate-700">
                        {(webrtcStats?.audioElementCurrentTime || 0).toFixed(1)}s (đang tăng)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Autoplay Trình duyệt:</span>
                      <span className={webrtcStats?.autoplayBlocked ? "text-rose-600 font-bold" : "text-emerald-600"}>
                        {webrtcStats?.autoplayBlocked ? "BỊ CHẶN ⚠️" : "CHO PHÉP ✓"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Kênh phát ra loa:</span>
                      <span className="font-bold text-[#7C3AED]">
                        {webrtcStats?.webAudioDirectActive ? "Web Audio (Trực tiếp)" : "HTMLAudioElement"}
                      </span>
                    </div>
                  </div>

                  {/* 3 Nút xử lý chẩn đoán trực tiếp */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => webrtcManagerRef.current?.playTestBeep()}
                      className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>🔊 Test Loa Máy Này (Phát tiếng bíp)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        webrtcManagerRef.current?.toggleWebAudioDirectOutput();
                      }}
                      className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {webrtcStats?.webAudioDirectActive
                          ? "⚡ Chuyển lại Loa Thẻ Audio"
                          : "⚡ Bật Web Audio Direct Play (Dự phòng)"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => webrtcManagerRef.current?.unlockAudio()}
                      className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <VolumeX className="w-3 h-3" />
                      <span>🔓 Buộc Mở Khóa Loa (User Gesture)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowExitModal(true)}
              className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rời phòng Voice học</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 💡 MODAL: GỢI Ý HỌC TẬP (HINT MODAL)                      */}
      {/* ========================================================= */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-[#17133B]">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Gợi ý hướng tư duy</span>
              </div>
              <button onClick={() => setShowHintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
              💡 Hãy chú ý đến phạm vi nghiên cứu: Vi mô tập trung vào các thị trường và quyết định của hộ gia đình, doanh nghiệp; trong khi Vĩ mô phân tích các chỉ số vĩ mô như GDP, lạm phát và thất nghiệp.
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-5 py-2 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9]"
              >
                Đã hiểu, quay lại làm bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📖 MODAL: ÔN LẠI KIẾN THỨC (CHEATSHEET MODAL)              */}
      {/* ========================================================= */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-[#17133B]">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Tóm tắt kiến thức cốt lõi: {subject.name}</span>
              </div>
              <button onClick={() => setShowKnowledgeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs text-[#17133B]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#7C3AED]">1. Đường giới hạn khả năng sản xuất (PPF):</strong>
                <p className="text-[#77738F]">Biểu thị các kết hợp sản lượng tối đa mà nền kinh tế có thể sản xuất khi sử dụng hiệu quả toàn bộ nguồn lực và công nghệ hiện có.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#7C3AED]">2. Chi phí cơ hội (Opportunity Cost):</strong>
                <p className="text-[#77738F]">Giá trị của cơ hội tốt nhất bị bỏ qua khi đưa ra một quyết định lựa chọn.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#7C3AED]">3. Quy luật khan hiếm:</strong>
                <p className="text-[#77738F]">Nguồn lực xã hội luôn hữu hạn trong khi nhu cầu của con người là vô hạn.</p>
              </div>
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="px-5 py-2 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9]"
              >
                Đóng tóm tắt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🏆 FINISHED ALL QUESTIONS MODAL                           */}
      {/* ========================================================= */}
      {isFinishedAll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-4 border-[#EDE9FE] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] mx-auto flex items-center justify-center shadow-lg shadow-purple-100">
              <Trophy className="w-8 h-8 text-[#7C3AED]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#17133B]">
                Hoàn thành buổi Voice Học!
              </h3>
              <p className="text-xs text-[#77738F] mt-1">
                Bạn và {friendName} đã hoàn thành trọn vẹn 5 câu hỏi học phần <strong>{subject.name}</strong> qua đàm thoại trực tiếp.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="p-2 bg-white rounded-xl">
                <div className="text-[#77738F] text-[11px]">Bạn trả lời đúng</div>
                <div className="text-base font-black text-[#7C3AED]">{userScoreCount} / {questions.length}</div>
              </div>
              <div className="p-2 bg-white rounded-xl">
                <div className="text-[#77738F] text-[11px]">{friendName} đúng</div>
                <div className="text-base font-black text-blue-600">{peerScoreCount} / {questions.length}</div>
              </div>
            </div>

            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">
              🌿 Tinh thần học nhóm: Thảo luận kiến thức sâu, ghi nhớ lâu hơn 300% so với tự làm bài!
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setCurrentQIndex(0);
                  setUserScoreCount(0);
                  setPeerScoreCount(0);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17133B] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Học lại bộ đề</span>
              </button>

              <button
                onClick={onLeave}
                className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9] transition-all shadow-md shadow-purple-200"
              >
                Rời phòng học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚪 EXIT CONFIRMATION MODAL                                */}
      {/* ========================================================= */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-[#E8E4F3]">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#17133B]">Rời khỏi phòng Voice học?</h3>
              <p className="text-xs text-[#77738F] mt-1">
                Buổi thảo luận thoại với {friendName} sẽ kết thúc. Bạn có chắc chắn muốn rời phòng không?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#17133B] font-bold text-xs"
              >
                Ở lại phòng
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  voiceRealtimeService.leaveRoom(roomCode, isHost);
                  webrtcManagerRef.current?.destroy();
                  onLeave();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ⚠️ PARTNER LEFT ROOM NOTIFICATION MODAL                   */}
      {/* ========================================================= */}
      {partnerLeft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-amber-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#17133B]">Bạn đồng hành đã rời phòng</h3>
              <p className="text-xs text-[#77738F] mt-1 leading-relaxed">
                {friendName} đã rời khỏi phòng học thoại. Buổi học nhóm hiện đã kết thúc.
              </p>
            </div>
            <button
              onClick={() => {
                webrtcManagerRef.current?.destroy();
                onLeave();
              }}
              className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs cursor-pointer shadow-md shadow-[#7C3AED]/20 transition-all hover:scale-[1.01]"
            >
              Quay lại sảnh chính
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
