"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  ArrowRight,
  BookOpen,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
} from "lucide-react";
import {
  DocumentAnalysisResult,
  AIQuestionRecommendation,
  DocumentQuizCustomConfig,
} from "@/core/domain/documentLearning.types";
import { PKQuestionCustomizationModal } from "./PKQuestionCustomizationModal";

interface PKQuestionRecommendationProps {
  analysis: DocumentAnalysisResult;
  recommendation: AIQuestionRecommendation;
  onGenerate: (config: DocumentQuizCustomConfig) => void;
  onBack: () => void;
}

export function PKQuestionRecommendation({
  analysis,
  recommendation,
  onGenerate,
  onBack,
}: PKQuestionRecommendationProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Fast-start with default recommendation
  const handleQuickStart = () => {
    onGenerate({
      selectedChapterIds: recommendation.targetChapterIds,
      selectedTopics: [],
      isAllDocument: true,
      questionCount: recommendation.questionCount,
      difficulty: recommendation.difficulty,
      questionTypes: ["single_choice"],
    });
  };

  const handleCustomConfirm = (customConfig: DocumentQuizCustomConfig) => {
    setShowCustomModal(false);
    onGenerate(customConfig);
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div>
              <span className="text-sm font-black text-[#17133B]">Đề xuất bộ câu hỏi</span>
              <span className="text-[11px] text-[#77738F] block font-medium">
                Môn: <strong>{analysis.identifiedSubjectName}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#77738F] hover:text-[#17133B] transition-colors cursor-pointer"
          >
            Quay lại phân tích
          </button>
        </header>

        {/* MAIN CONTAINER */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 animate-in fade-in duration-200">
            {/* HERO BADGE & TITLE */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-black border border-purple-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI ĐỀ XUẤT BỘ CÂU HỎI TIÊU CHUẨN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17133B] tracking-tight">
                Bắt đầu học ngay với cấu hình tối ưu
              </h2>
              <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed">
                {recommendation.description}
              </p>
            </div>

            {/* RECOMMENDATION DETAILS CARD */}
            <div className="p-5 rounded-2xl bg-[#FAF8FF] border border-[#EDE9FE] space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#F0EDF9]">
                  <span className="text-[#77738F] text-[11px] block font-medium">Số lượng câu:</span>
                  <span className="text-base font-black text-[#7C3AED] mt-0.5 block">
                    {recommendation.questionCount} câu
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#F0EDF9]">
                  <span className="text-[#77738F] text-[11px] block font-medium">Mức độ thử thách:</span>
                  <span className="text-base font-black text-amber-700 mt-0.5 block">
                    Trung bình
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#F0EDF9]">
                  <span className="text-[#77738F] text-[11px] block font-medium">Phạm vi kiến thức:</span>
                  <span className="text-xs font-black text-[#17133B] mt-0.5 block truncate">
                    {recommendation.scopeDescription}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#F0EDF9]">
                  <span className="text-[#77738F] text-[11px] block font-medium">Dạng câu hỏi:</span>
                  <span className="text-xs font-black text-[#17133B] mt-0.5 block">
                    Trắc nghiệm chuẩn
                  </span>
                </div>
              </div>

              {/* FOCUS NOTES */}
              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-950 font-medium flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <span>
                  <strong>Đặc điểm đề xuất:</strong> {recommendation.focusNotes}
                </span>
              </div>
            </div>

            {/* TWO PRIMARY BUTTONS: QUICK START VS CUSTOMIZE */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleQuickStart}
                className="w-full py-4 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
              >
                <span>Tạo ngay (Bắt đầu nhanh)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-[#E8E4F3] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#7C3AED]" />
                <span>Tùy chỉnh phạm vi, số lượng & độ khó &rarr;</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* CUSTOMIZATION MODAL */}
      {showCustomModal && (
        <PKQuestionCustomizationModal
          analysis={analysis}
          initialCount={recommendation.questionCount}
          initialDifficulty={recommendation.difficulty}
          onConfirm={handleCustomConfirm}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </>
  );
}
