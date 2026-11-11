"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
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
import { QuizConfigData } from "./PKQuizConfigurationScreen";

interface PKActiveVoiceQuizProps {
  subject: PKSubject;
  roomName: string;
  roomCode: string;
  friendName: string;
  friendAvatar: string;
  config?: QuizConfigData;
  onLeave: () => void;
}

export function PKActiveVoiceQuiz({
  subject,
  roomName,
  roomCode,
  friendName,
  friendAvatar,
  config,
  onLeave,
}: PKActiveVoiceQuizProps) {
  // Questions list based on configured count
  const questions: QuizQuestion[] = useMemo(() => {
    return getQuestionsBySubject(subject.id || subject.name, config?.questionCount || 5);
  }, [subject, config]);

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

  // =========================================================
  // 3. VOICE & AUDIO CONNECTION STATE
  // =========================================================
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [voiceConnectionState, setVoiceConnectionState] = useState<
    "connected" | "connecting" | "reconnecting"
  >("connected");
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [peerIsSpeaking, setPeerIsSpeaking] = useState(false);

  // Web Audio Context for real microphone detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

    // Peer simulated voice discussion timeline
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
  }, [currentQIndex, currentQ]);

  // Real Microphone Capture Effect
  useEffect(() => {
    let active = true;

    async function initMicrophone() {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) return;
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectVoice = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          if (isMicOn && avg > 16) {
            setUserIsSpeaking(true);
          } else {
            setUserIsSpeaking(false);
          }

          animFrameRef.current = requestAnimationFrame(detectVoice);
        };

        detectVoice();
      } catch (err) {
        // Fallback gracefully without throwing
      }
    }

    initMicrophone();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [isMicOn]);

  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
  };

  const handleConfirmAnswer = () => {
    if (userSelectedOption === null || userSubmitted) return;
    setUserSubmitted(true);
    if (userSelectedOption === currentQ.correct) {
      setUserScoreCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
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

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#7C3AED]/30 text-xs">
            <Radio className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
            <span className="font-bold text-[#7C3AED]">
              {voiceConnectionState === "connected" ? "WebRTC Voice Live" : "Đang kết nối lại..."}
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
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
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
                      setUserSelectedOption(optIdx);
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
                      ĐL
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
                    <h4 className="text-xs font-black text-[#17133B]">Bạn (Đô La)</h4>
                    <span className="text-[10px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.2 rounded-md">
                      Chủ phòng
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
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center">
                      <Mic className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#17133B]">{friendName}</h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                      Bạn cùng học
                    </span>
                  </div>
                </div>

                {/* Animated Waveform if peer is speaking */}
                {peerIsSpeaking && (
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
                    : peerSubmitted
                    ? "Đang nghe..."
                    : "Đang suy nghĩ..."}
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
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Đã kết nối
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
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
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
                  onLeave();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
