"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  User,
  Users,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  X,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { GeneratedQuestionWithSource } from "@/core/domain/documentLearning.types";
import { GameplayModeId } from "./PKGameplaySelectionScreen";
import { QuizSessionSummaryData } from "./PKGamificationSummaryScreen";

interface PKActiveGameplayQuizProps {
  subject: PKSubject;
  mode: GameplayModeId;
  questions: GeneratedQuestionWithSource[];
  sourceFileName: string;
  onFinish: (summary: QuizSessionSummaryData) => void;
  onLeave: () => void;
}

export function PKActiveGameplayQuiz({
  subject,
  mode,
  questions,
  sourceFileName,
  onFinish,
  onLeave,
}: PKActiveGameplayQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mode === "solo" ? 90 : 35);
  const [startTime] = useState(Date.now());

  // Track answers for gamification
  const [recordedAnswers, setRecordedAnswers] = useState<
    {
      questionId: string;
      isCorrect: boolean;
      selectedOption: number;
      correctOption: number;
      topic: string;
    }[]
  >([]);

  // Simulated AI/Peer state for competitive feel
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentScore, setOpponentScore] = useState(0);

  const currentQ = questions[currentIdx] || questions[0];
  const correctOptionIdx = currentQ.correctAnswers[0] ?? 0;

  // Countdown timer
  useEffect(() => {
    if (isAnswerSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit timeout
          handleSubmitAnswer(selectedOption ?? -1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isAnswerSubmitted, selectedOption]);

  // Simulated Opponent effect in AI/PVP
  useEffect(() => {
    setOpponentAnswered(false);
    if (mode === "solo") return;

    const delay = 4000 + Math.random() * 8000;
    const timer = setTimeout(() => {
      setOpponentAnswered(true);
      // 70% chance opponent gets it right
      if (Math.random() > 0.3) {
        setOpponentScore((s) => s + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIdx, mode]);

  const handleSubmitAnswer = (chosenIdx: number) => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = chosenIdx === correctOptionIdx;
    setRecordedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        isCorrect,
        selectedOption: chosenIdx,
        correctOption: correctOptionIdx,
        topic: currentQ.topic,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(mode === "solo" ? 90 : 35);
    } else {
      // Finished all questions
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      const correctTotal = recordedAnswers.filter((a) => a.isCorrect).length + (selectedOption === correctOptionIdx ? 1 : 0);

      onFinish({
        mode,
        totalQuestions: questions.length,
        correctCount: correctTotal,
        timeSpentSeconds: totalTime,
        answers: recordedAnswers,
      });
    }
  };

  const getModeBadge = () => {
    switch (mode) {
      case "solo":
        return { label: "Ôn tập cá nhân", icon: User, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "ai_bot":
        return { label: "Đấu với AI Bot", icon: Bot, color: "bg-purple-50 text-[#7C3AED] border-purple-200" };
      case "pvp_1v1":
        return { label: "PK 1vs1 Xếp hạng", icon: Flame, color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "team_pk":
        return { label: "Đấu nhóm 2v2", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "voice_study":
        return { label: "Voice học 1v1", icon: Sparkles, color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
  };

  const modeBadge = getModeBadge();
  const ModeIcon = modeBadge.icon;
  const userScore = recordedAnswers.filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: TIMER, SCORE & QUIT BUTTON                 */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#17133B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời phòng</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${modeBadge.color}`}>
              <ModeIcon className="w-3.5 h-3.5" />
              <span>{modeBadge.label}</span>
            </span>
            <span className="text-xs font-bold text-[#77738F] hidden md:inline">
              Môn: {subject.name}
            </span>
          </div>
        </div>

        {/* TIMER & PROGRESS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
            <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className={timeLeft <= 10 ? "text-rose-600 animate-pulse" : ""}>
              {timeLeft}s
            </span>
          </div>

          <div className="text-xs font-black text-[#17133B]">
            Câu <span className="text-[#7C3AED]">{currentIdx + 1}</span> / {questions.length}
          </div>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="w-full bg-[#EDE9FE]/50 h-1.5">
        <div
          className="bg-[#7C3AED] h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* COMPETITIVE SCORE HUD (If AI or PVP) */}
      {mode !== "solo" && (
        <section className="bg-white border-b border-[#E8E4F3] px-4 sm:px-8 py-2">
          <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center text-[10px]">
                Bạn
              </span>
              <span>Điểm của bạn: <strong className="text-[#7C3AED]">{userScore}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span>{mode === "ai_bot" ? "AI Bot" : "Đối thủ"}: <strong className="text-blue-600">{opponentScore}</strong></span>
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px]">
                {mode === "ai_bot" ? "AI" : "VS"}
              </span>
              {opponentAnswered && (
                <span className="text-[10px] text-emerald-600 font-bold hidden sm:inline">
                  (Đã trả lời)
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 2. QUESTION ACTIVE AREA                                   */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex flex-col justify-center">
        <article className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4F3] shadow-sm space-y-6">
          {/* TOP TOPIC & CITATION META */}
          <div className="flex items-center justify-between text-xs text-[#77738F] font-bold border-b border-[#F0EDF9] pb-3">
            <span className="text-[#7C3AED] flex items-center gap-1.5 font-black">
              <BookOpen className="w-4 h-4" />
              <span>Chủ đề: {currentQ.topic}</span>
            </span>
            <span className="truncate max-w-[200px]">
              {currentQ.sourceReference.chapterOrSection || "Nội dung bài học"}
            </span>
          </div>

          {/* QUESTION TEXT */}
          <h2 className="text-base sm:text-lg font-black text-[#17133B] leading-relaxed">
            {currentQ.questionText}
          </h2>

          {/* 4 OPTIONS (A, B, C, D) */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const prefix = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === correctOptionIdx;

              let style = "bg-[#FAF8FF] border-[#E8E4F3] text-slate-800 hover:border-[#7C3AED] hover:bg-purple-50/50";
              if (isSelected && !isAnswerSubmitted) {
                style = "bg-[#EDE9FE] border-[#7C3AED] text-[#7C3AED] font-black shadow-xs";
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  style = "bg-emerald-50 border-emerald-400 text-emerald-950 font-black shadow-xs";
                } else if (isSelected && !isCorrect) {
                  style = "bg-rose-50 border-rose-300 text-rose-950 font-bold";
                } else {
                  style = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => {
                    if (!isAnswerSubmitted) {
                      setSelectedOption(optIdx);
                    }
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${style}`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected && !isAnswerSubmitted
                        ? "bg-[#7C3AED] text-white"
                        : isAnswerSubmitted && isCorrect
                        ? "bg-emerald-600 text-white"
                        : isAnswerSubmitted && isSelected && !isCorrect
                        ? "bg-rose-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {prefix}
                  </span>

                  <span className="flex-1 leading-snug">{opt}</span>

                  {isAnswerSubmitted && isCorrect && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* EXPLANATION & SOURCE QUOTE REVEAL (AFTER SUBMIT) */}
          {isAnswerSubmitted && (
            <div className="space-y-3 pt-3 border-t border-[#F0EDF9] animate-in fade-in duration-200">
              {/* EXPLANATION */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs text-purple-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-[#7C3AED]">
                  <Sparkles className="w-4 h-4" />
                  <span>Giải thích đáp án:</span>
                </div>
                <p className="text-[#322F55] leading-relaxed font-medium pl-5">
                  {currentQ.explanation}
                </p>
              </div>

              {/* SOURCE REFERENCE */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#77738F]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Trích dẫn từ tài liệu: {currentQ.sourceReference.fileName}</span>
                  </span>
                  <span>{currentQ.sourceReference.chapterOrSection}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/80">
                  &ldquo;{currentQ.sourceReference.excerpt}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="pt-2">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  if (selectedOption !== null) {
                    handleSubmitAnswer(selectedOption);
                  }
                }}
                disabled={selectedOption === null}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedOption !== null
                    ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xl shadow-purple-200 hover:scale-[1.01]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Xác nhận câu trả lời</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>{currentIdx + 1 < questions.length ? "Câu tiếp theo" : "Xem tổng kết buổi học"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
