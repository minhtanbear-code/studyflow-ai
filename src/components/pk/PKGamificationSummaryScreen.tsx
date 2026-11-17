"use client";

import React from "react";
import {
  Trophy,
  Sparkles,
  Flame,
  Award,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Share2,
  TrendingUp,
  Shield,
  FileText,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { GeneratedQuestionWithSource } from "@/core/domain/documentLearning.types";
import { GameplayModeId } from "./PKGameplaySelectionScreen";

export interface QuizSessionSummaryData {
  mode: GameplayModeId;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    isCorrect: boolean;
    selectedOption: number;
    correctOption: number;
    topic: string;
  }[];
}

interface PKGamificationSummaryScreenProps {
  subject: PKSubject;
  sourceFileName: string;
  questions: GeneratedQuestionWithSource[];
  summaryData: QuizSessionSummaryData;
  onPlayAgain: () => void;
  onNewDocument: () => void;
  onBackToModes: () => void;
}

export function PKGamificationSummaryScreen({
  subject,
  sourceFileName,
  questions,
  summaryData,
  onPlayAgain,
  onNewDocument,
  onBackToModes,
}: PKGamificationSummaryScreenProps) {
  const accuracy = Math.round((summaryData.correctCount / summaryData.totalQuestions) * 100) || 0;

  // Gamification formulas
  const isCompetitive = summaryData.mode === "pvp_1v1" || summaryData.mode === "team_pk";
  const xpEarned = summaryData.correctCount * 15 + (accuracy >= 80 ? 30 : 10);
  const ratingDelta = isCompetitive
    ? summaryData.correctCount >= summaryData.totalQuestions / 2
      ? +24
      : -14
    : 0;

  // Time format
  const minutes = Math.floor(summaryData.timeSpentSeconds / 60);
  const seconds = summaryData.timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;

  // Topic Performance Grouping
  const topicMap: Record<string, { total: number; correct: number }> = {};
  summaryData.answers.forEach((ans) => {
    if (!topicMap[ans.topic]) {
      topicMap[ans.topic] = { total: 0, correct: 0 };
    }
    topicMap[ans.topic].total += 1;
    if (ans.isCorrect) {
      topicMap[ans.topic].correct += 1;
    }
  });

  const topicList = Object.entries(topicMap).map(([topic, stats]) => ({
    topic,
    accuracy: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total,
  }));

  const getModeTitle = (m: GameplayModeId) => {
    switch (m) {
      case "solo":
        return "Ôn tập cá nhân";
      case "ai_bot":
        return "Đấu với AI";
      case "pvp_1v1":
        return "PK 1vs1 Xếp hạng";
      case "team_pk":
        return "Đấu nhóm (Team PK)";
      case "voice_study":
        return "Voice học (1vs1)";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
            <Trophy className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="text-sm font-black text-[#17133B]">Tổng kết kết quả học tập</span>
            <span className="text-[11px] text-[#77738F] block font-medium">
              Chế độ: <strong>{getModeTitle(summaryData.mode)}</strong> • {subject.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewDocument}
          className="text-xs font-bold text-[#77738F] hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          Tải tài liệu khác
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
        {/* HERO CELEBRATION BOX */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C3AED] to-purple-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-200">
            <Trophy className="w-10 h-10 text-yellow-300 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-black border border-purple-200 inline-block">
              HOÀN THÀNH BUỔI HỌC
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17133B]">
              {accuracy >= 80 ? "Xuất sắc! Bạn đã nắm rất vững tài liệu!" : "Tốt lắm! Tiếp tục luyện tập để đạt điểm cao hơn!"}
            </h1>
            <p className="text-xs sm:text-sm text-[#77738F] font-medium">
              Bộ câu hỏi tạo từ: <strong>{sourceFileName}</strong>
            </p>
          </div>

          {/* 4 PRIMARY METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-left">
            {/* SCORE */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#77738F] font-bold">
                <Target className="w-4 h-4 text-[#7C3AED]" />
                <span>Số câu đúng</span>
              </div>
              <div className="text-2xl font-black text-[#17133B]">
                {summaryData.correctCount} <span className="text-xs text-[#77738F]">/ {summaryData.totalQuestions}</span>
              </div>
            </div>

            {/* ACCURACY */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#77738F] font-bold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Độ chính xác</span>
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {accuracy}%
              </div>
            </div>

            {/* XP EARNED */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#77738F] font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Kinh nghiệm</span>
              </div>
              <div className="text-2xl font-black text-[#7C3AED]">
                +{xpEarned} <span className="text-xs font-bold text-amber-700">XP</span>
              </div>
            </div>

            {/* TIME */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#77738F] font-bold">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Thời gian</span>
              </div>
              <div className="text-xl font-black text-slate-800">
                {timeFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* GAMIFICATION COMPARISON: XP VS RATING */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E4F3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EDF9] pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="font-black text-sm text-[#17133B]">Điểm số Xếp hạng & Tiến độ môn học</h3>
            </div>
            <span className="text-[11px] font-bold text-[#77738F]">Hệ thống phân định XP ≠ Rating</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* COMPETITIVE RATING */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Điểm xếp hạng mùa giải (Rating)</span>
                </span>
                {isCompetitive ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      ratingDelta >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {ratingDelta >= 0 ? `+${ratingDelta}` : ratingDelta} Rating
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    Không đổi (Chế độ tập luyện)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-purple-900 leading-relaxed font-medium">
                {isCompetitive
                  ? "Điểm Rating được cập nhật trực tiếp vào bảng vàng thành tích PK toàn quốc của bạn!"
                  : "Chế độ Solo/AI/Voice bảo toàn điểm Rating để bạn thoải mái luyện tập mà không lo tụt hạng."}
              </p>
            </div>

            {/* SUBJECT PROGRESS MASTERY */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Tiến độ thông thạo môn học:</span>
                </span>
                <span className="text-xs font-black text-[#7C3AED]">+{Math.round(accuracy * 0.1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7C3AED] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, 65 + Math.round(accuracy * 0.1))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Bạn đã hoàn thành <strong>{questions.length} thử thách</strong> từ tài liệu của mình.
              </p>
            </div>
          </div>
        </div>

        {/* TOPIC PERFORMANCE BREAKDOWN */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E4F3] shadow-xs space-y-4">
          <h3 className="font-black text-sm text-[#17133B] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#7C3AED]" />
            <span>Phân tích hiệu suất theo từng chủ đề trong tài liệu:</span>
          </h3>

          <div className="space-y-2.5">
            {topicList.map((top, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-[#17133B] block">{top.topic}</span>
                  <span className="text-[11px] text-[#77738F]">
                    Đúng {top.correct} / {top.total} câu
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        top.accuracy >= 70 ? "bg-emerald-500" : top.accuracy >= 40 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${top.accuracy}%` }}
                    />
                  </div>
                  <span
                    className={`font-black text-xs min-w-[36px] text-right ${
                      top.accuracy >= 70 ? "text-emerald-700" : top.accuracy >= 40 ? "text-amber-700" : "text-rose-700"
                    }`}
                  >
                    {top.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ôn tập lại bộ đề này</span>
          </button>

          <button
            type="button"
            onClick={onBackToModes}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-[#E8E4F3] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Đổi hình thức học khác</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNewDocument}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl border border-dashed border-purple-300 text-[#7C3AED] font-bold text-xs hover:bg-[#EDE9FE]/40 transition-colors cursor-pointer"
          >
            + Tải tài liệu mới
          </button>
        </div>
      </main>
    </div>
  );
}
