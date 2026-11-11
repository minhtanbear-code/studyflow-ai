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
  ChevronRight,
  HelpCircle,
  Info,
  Lightbulb,
  Lock,
  Mic,
  MicOff,
  Radio,
  RotateCcw,
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

interface PKVoiceLearningRoomProps {
  subject: PKSubject;
  onLeave: () => void;
}

export function PKVoiceLearningRoom({ subject, onLeave }: PKVoiceLearningRoomProps) {
  // Questions list (5 questions for the selected subject)
  const questions: QuizQuestion[] = useMemo(() => {
    return getQuestionsBySubject(subject.id || subject.name, 5);
  }, [subject]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ = questions[currentQIndex] || questions[0];

  // =========================================================
  // 1. PLAYER 1 (USER) STATE
  // =========================================================
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [userSubmitted, setUserSubmitted] = useState<boolean>(false);
  const [userScoreCount, setUserScoreCount] = useState(0);

  // =========================================================
  // 2. PLAYER 2 (LÊ HOÀNG MAI - PEER) STATE
  // =========================================================
  const [peerStatus, setPeerStatus] = useState<"chua_chon" | "dang_suy_nghi" | "da_chot">("chua_chon");
  const [peerSelectedOption, setPeerSelectedOption] = useState<number | null>(null);
  const [peerSubmitted, setPeerSubmitted] = useState<boolean>(false);
  const [peerScoreCount, setPeerScoreCount] = useState(0);

  // =========================================================
  // 3. VOICE & AUDIO CONNECTION STATE
  // =========================================================
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [peerIsSpeaking, setPeerIsSpeaking] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  // Web Audio Context for real mic capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Both submitted => Reveal stage
  const isBothSubmitted = userSubmitted && peerSubmitted;
  const isFinishedAll = currentQIndex >= questions.length - 1 && isBothSubmitted;

  // =========================================================
  // RESET STATE ON QUESTION CHANGE
  // =========================================================
  useEffect(() => {
    setUserSelectedOption(null);
    setUserSubmitted(false);
    setPeerSelectedOption(null);
    setPeerSubmitted(false);
    setPeerStatus("dang_suy_nghi");

    // Peer simulated discussion & answer timeline
    // Peer thinks, speaks occasionally, then locks answer
    const peerThinkTimer = setTimeout(() => {
      setPeerIsSpeaking(true);
      setTimeout(() => {
        setPeerIsSpeaking(false);
      }, 3500);

      // Peer selects realistic answer (75% picks correct, 25% picks another)
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
      }, 4000);

      return () => clearTimeout(peerConfirmTimer);
    }, 2500);

    return () => clearTimeout(peerThinkTimer);
  }, [currentQIndex, currentQ]);

  // =========================================================
  // REAL MICROPHONE PERMISSION & VOICE DETECTION
  // =========================================================
  useEffect(() => {
    let active = true;

    async function initMicrophone() {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) return;
        micStreamRef.current = stream;
        setHasMicPermission(true);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkSpeaking = () => {
          if (!active) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          // If volume threshold is crossed and mic is active
          if (isMicOn && avg > 18) {
            setUserIsSpeaking(true);
          } else {
            setUserIsSpeaking(false);
          }

          animFrameRef.current = requestAnimationFrame(checkSpeaking);
        };

        checkSpeaking();
      } catch (err) {
        if (!active) return;
        setHasMicPermission(false);
        // Fallback: silent mock mode
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
  }, []);

  // Handle Mute Toggle
  const handleToggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
  };

  // User submits answer
  const handleConfirmAnswer = () => {
    if (userSelectedOption === null || userSubmitted) return;
    setUserSubmitted(true);
    if (userSelectedOption === currentQ.correct) {
      setUserScoreCount((prev) => prev + 1);
    }
  };

  // Next question handler
  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: BRAND, VOICE STATUS & CONTROLS             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Leave Button & Brand */}
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
            <div className="w-7 h-7 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#EDE9FE]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-[#17133B]">VOICE HỌC 1v1</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang đàm thoại
                </span>
              </div>
              <div className="text-[11px] text-[#77738F] font-medium hidden md:block">
                Học phần: <strong>{subject.name}</strong> ({subject.code})
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Voice Room Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#7C3AED]/30 text-xs">
          <Radio className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
          <span className="font-bold text-[#7C3AED]">Phòng Voice: Sẵn sàng</span>
          <span className="text-[#77738F]">• 2/2 bạn đang kết nối</span>
        </div>

        {/* Right: Audio / Mic Controls (AREA C) */}
        <div className="flex items-center gap-2">
          {/* Mic Toggle Button */}
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

          {/* Speaker Toggle Button */}
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
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. AREA B – TWO-PLAYER PROFILES (SIDE-BY-SIDE CARDS)      */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-center">
          {/* PLAYER 1: BẠN (CURRENT USER) */}
          <div
            className={`rounded-2xl p-3 border-2 transition-all flex items-center justify-between ${
              userSubmitted
                ? "bg-[#FAF8FF] border-[#7C3AED]/60 shadow-xs"
                : "bg-slate-50/60 border-[#E8E4F3]"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with speaking wave */}
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-sm flex items-center justify-center shadow-xs transition-all ${
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
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-[#17133B]">Bạn (Đô La)</h4>
                  <span className="text-[10px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.2 rounded-md">
                    Player 1
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#77738F] flex items-center gap-1 mt-0.5">
                  {userIsSpeaking ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Đang nói qua Mic...
                    </span>
                  ) : isMicOn ? (
                    <span className="text-slate-500">Mic đang bật</span>
                  ) : (
                    <span className="text-rose-500">Đã tắt micro</span>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Status Badge */}
            <div>
              {userSubmitted ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black border border-[#7C3AED]/30">
                  <Lock className="w-3 h-3 text-[#7C3AED]" />
                  <span>Đã chốt đáp án</span>
                </div>
              ) : userSelectedOption !== null ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Đã chọn tạm ({optionLetters[userSelectedOption]})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                  <span>Chưa chọn đáp án</span>
                </div>
              )}
            </div>
          </div>

          {/* PLAYER 2: LÊ HOÀNG MAI (PEER LEARNER) */}
          <div
            className={`rounded-2xl p-3 border-2 transition-all flex items-center justify-between ${
              peerSubmitted
                ? "bg-[#FAF8FF] border-[#7C3AED]/60 shadow-xs"
                : "bg-slate-50/60 border-[#E8E4F3]"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with speaking wave */}
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs transition-all ${
                    peerIsSpeaking ? "ring-4 ring-emerald-400 scale-105" : ""
                  }`}
                >
                  HM
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center">
                  <Mic className="w-2.5 h-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-[#17133B]">Lê Hoàng Mai</h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                    Bạn cùng học
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#77738F] flex items-center gap-1 mt-0.5">
                  {peerIsSpeaking ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Hoàng Mai đang nói...
                    </span>
                  ) : (
                    <span className="text-slate-500">Mic đang bật</span>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Status Badge */}
            <div>
              {peerSubmitted ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black border border-[#7C3AED]/30">
                  <Lock className="w-3 h-3 text-[#7C3AED]" />
                  <span>Đã chốt đáp án</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Đang suy nghĩ...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. AREA A – QUESTION & ANSWER SECTION                      */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between">
        {/* PROGRESS BAR & TOPIC META */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#77738F]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#EDE9FE] text-[#7C3AED] font-black text-xs">
                Câu hỏi {currentQIndex + 1} / {questions.length}
              </span>
              <span className="text-[#17133B] hidden sm:inline">•</span>
              <span className="text-[#17133B] font-bold hidden sm:inline">Chủ đề: {currentQ.topic}</span>
            </div>

            <div className="text-[11px] font-medium text-[#77738F]">
              Mục tiêu: Thảo luận & Hiểu bản chất
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#E8E4F3] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8E4F3] shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
              Q{currentQIndex + 1}
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#17133B] leading-relaxed">
              {currentQ.q}
            </h2>
          </div>
        </div>

        {/* FOUR LARGE ANSWER CARDS: A, B, C, D */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((optionText, optIdx) => {
            const letter = optionLetters[optIdx];
            const isUserSelected = userSelectedOption === optIdx;
            const isCorrect = isBothSubmitted && optIdx === currentQ.correct;
            const isUserWrong = isBothSubmitted && isUserSelected && !isCorrect;
            const isPeerPicked = isBothSubmitted && peerSelectedOption === optIdx;

            let cardStyles = "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/60 hover:bg-[#FAF8FF]";
            let letterStyles = "bg-[#F8F7FC] text-[#77738F] border-[#E8E4F3]";

            // Before Reveal: show user selection only
            if (!isBothSubmitted) {
              if (isUserSelected) {
                cardStyles = "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE] shadow-sm";
                letterStyles = "bg-[#7C3AED] text-white border-[#7C3AED]";
              }
            } else {
              // After Reveal
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
                className={`w-full rounded-2xl p-4 sm:p-4.5 border-2 transition-all flex items-start justify-between gap-3 ${
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

                {/* Right Badges & Indicators */}
                <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                  {/* Before Reveal: Selection status */}
                  {!isBothSubmitted && isUserSelected && (
                    <span className="text-[11px] font-black text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Bạn đã chọn</span>
                    </span>
                  )}

                  {/* After Reveal: Outcome Tags */}
                  {isBothSubmitted && (
                    <div className="flex flex-wrap items-center gap-1 justify-end">
                      {isCorrect && (
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
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
                          Hoàng Mai chọn
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* SUBMIT BUTTON BAR (BEFORE REVEAL)                         */}
        {/* ========================================================= */}
        {!isBothSubmitted && (
          <div className="bg-white rounded-2xl p-4 border border-[#E8E4F3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#77738F]">
              <Info className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>
                {userSubmitted
                  ? "Bạn đã chốt đáp án! Hãy bật mic thảo luận cùng Hoàng Mai trong khi chờ bạn ấy chốt."
                  : userSelectedOption !== null
                  ? "Bạn có thể đổi đáp án tùy thích trước khi bấm chốt."
                  : "Nhấp chọn 1 đáp án A, B, C hoặc D để chốt."}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
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
                  <span>Đang đợi Hoàng Mai chốt đáp án...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. LEARNING EXPERIENCE & EXPLANATION (AFTER REVEAL)       */}
        {/* ========================================================= */}
        {isBothSubmitted && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#7C3AED]/40 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Outcome Announcement */}
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
                    <span>💡 Hai bạn có góc nhìn khác nhau. Hãy bật Mic cùng phân tích nhé!</span>
                  </>
                )}
              </div>

              <div className="text-[11px] font-bold text-[#77738F] hidden sm:block">
                Đáp án chuẩn: <strong className="text-emerald-700">{optionLetters[currentQ.correct]}</strong>
              </div>
            </div>

            {/* Why Correct Explanation */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-black text-[#17133B] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Giải thích vì sao đáp án đúng:</span>
              </div>
              <p className="text-[#77738F] font-medium leading-relaxed pl-5">
                {currentQ.explanation}
              </p>
            </div>

            {/* Breakdown of other options */}
            {currentQ.optionsAnalysis && (
              <div className="space-y-1.5 pt-2 border-t border-[#E8E4F3] text-xs">
                <div className="font-black text-[#17133B]">Phân tích từng phương án:</div>
                <div className="grid grid-cols-1 gap-1.5 pl-1">
                  {currentQ.optionsAnalysis.map((analysis, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-2 text-[11px] text-[#77738F]">
                      <span className="font-extrabold text-[#7C3AED]">{optionLetters[aIdx]}:</span>
                      <span>{analysis}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Takeaway (💡 Ghi nhớ cốt lõi) */}
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

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E4F3]">
              <div className="text-xs text-[#77738F] font-medium flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Bạn có câu hỏi nào chưa rõ không? Hãy trao đổi qua Mic với Hoàng Mai nhé.</span>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200"
              >
                <span>{currentQIndex + 1 < questions.length ? "Câu hỏi tiếp theo" : "Xem tổng kết buổi học"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 5. FINISHED ALL QUESTIONS MODAL                           */}
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
                Hai bạn đã hoàn thành trọn vẹn 5 câu hỏi học phần <strong>{subject.name}</strong> qua đàm thoại trực tiếp.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="p-2 bg-white rounded-xl">
                <div className="text-[#77738F] text-[11px]">Bạn trả lời đúng</div>
                <div className="text-base font-black text-[#7C3AED]">{userScoreCount} / {questions.length}</div>
              </div>
              <div className="p-2 bg-white rounded-xl">
                <div className="text-[#77738F] text-[11px]">Hoàng Mai đúng</div>
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
      {/* 6. EXIT CONFIRMATION MODAL                                */}
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
                Buổi thảo luận với Lê Hoàng Mai sẽ kết thúc. Bạn có chắc chắn muốn rời phòng không?
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
