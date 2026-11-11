"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Shield,
  Sparkles,
  Swords,
  User,
  Users,
  Zap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";

interface PKStudyModeSelectionScreenProps {
  subject: PKSubject;
  onBack: () => void;
  onSelectMode?: (modeId: "ai" | "friend" | "group") => void;
}

export function PKStudyModeSelectionScreen({
  subject,
  onBack,
  onSelectMode,
}: PKStudyModeSelectionScreenProps) {
  const [selectedMode, setSelectedMode] = useState<"ai" | "friend" | "group" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCardClick = (modeId: "ai" | "friend" | "group", title: string) => {
    setSelectedMode(modeId);
    setToastMessage(`Bạn đã chọn "${title}". (Sẵn sàng cho bước tiếp theo)`);
    if (onSelectMode) {
      onSelectMode(modeId);
    }
  };

  const modeOptions = [
    {
      id: "ai" as const,
      title: "Ôn tập với AI",
      description: "Luyện tập cùng AI, nhận giải thích và gợi ý học tập cá nhân hóa.",
      icon: Sparkles,
      iconColor: "text-[#7C3AED]",
      iconBg: "bg-[#EDE9FE]",
      badge: "Luyện tập cá nhân hóa",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      highlights: [
        "Luyện tập 1 vs 1 với Trợ lý AI",
        "Giải thích chi tiết từng câu hỏi",
        "Tự do điều chỉnh tốc độ & độ khó",
      ],
      actionText: "Bắt đầu ôn với AI",
    },
    {
      id: "friend" as const,
      title: "Ôn tập với bạn bè",
      description: "Kết nối và thử thách kiến thức cùng một người bạn.",
      icon: User,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      badge: "Đấu trí 1 vs 1",
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
      highlights: [
        "Thách đấu thời gian thực 1 vs 1",
        "Tạo phòng riêng hoặc tìm đối thủ",
        "Tích lũy điểm xếp hạng (Rating)",
      ],
      actionText: "Tìm bạn thi đấu 1v1",
    },
    {
      id: "group" as const,
      title: "Ôn tập với nhóm bạn",
      description: "Cùng bạn bè lập đội, phối hợp và chinh phục thử thách kiến thức.",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      badge: "Thi đấu Team 2v2 / 3v3",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      highlights: [
        "Lập đội 2 vs 2 hoặc 3 vs 3 cùng nhóm bạn",
        "Phối hợp trả lời & chia sẻ chiến thuật",
        "Bảng xếp hạng đồng đội sôi động",
      ],
      actionText: "Lập đội thi đấu nhóm",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* TOP HEADER: BRAND, STEP FLOW & BACK TO SUBJECT            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back button to return to subject selection */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại chọn môn học khác"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Đổi môn học</span>
          </button>

          {/* STUDYFLOW AI Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="flex items-baseline">
                <span className="text-sm font-black tracking-tight text-[#17133B]">STUDYFLOW</span>
                <span className="text-sm font-black text-[#7C3AED] ml-1">AI</span>
              </div>
              <span className="text-[10px] text-[#77738F] font-bold tracking-wide">
                PK • Đấu trí học tập
              </span>
            </div>
          </Link>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Step 1: Completed */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
            title="Nhấp để quay lại Bước 1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Bước 1:</span>
            <span>{subject.name}</span>
          </button>

          <div className="w-4 h-0.5 bg-[#E8E4F3] hidden sm:block" />

          {/* Step 2: Active */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
              2
            </span>
            <span className="font-bold">Bước 2: Chọn hình thức</span>
          </div>
        </div>
      </header>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#17133B] text-white px-5 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA: 3 CARDS                                */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* CONTEXT: CURRENTLY SELECTED SUBJECT PILL */}
        <div className="flex justify-center mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E4F3] shadow-sm text-xs text-[#77738F]">
            <span className="text-base">{subject.icon}</span>
            <span className="font-bold text-[#17133B]">Môn học: {subject.name}</span>
            <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md">
              {subject.code}
            </span>
            <button
              onClick={onBack}
              className="text-[#7C3AED] font-bold hover:underline ml-1"
            >
              (Thay đổi)
            </button>
          </div>
        </div>

        {/* HERO TITLE & SUPPORTING DESCRIPTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 animate-in fade-in slide-in-from-top-3 duration-300 delay-75">
          <h1 className="text-3xl sm:text-4xl font-black text-[#17133B] tracking-tight">
            Bạn muốn ôn tập như thế nào?
          </h1>

          <p className="text-sm sm:text-base text-[#77738F] font-medium leading-relaxed">
            Chọn hình thức ôn tập phù hợp với cách học của bạn.
          </p>
        </div>

        {/* THREE STUDY MODE OPTIONS - 3 LARGE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {modeOptions.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedMode === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleCardClick(opt.id, opt.title)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-3 ${
                  isSelected
                    ? "border-[#7C3AED] ring-4 ring-[#EDE9FE] bg-[#FAF8FF] shadow-purple-100"
                    : "border-[#E8E4F3] hover:border-[#7C3AED]/70"
                }`}
              >
                {/* Top: Icon & Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${opt.iconBg}`}
                    >
                      <Icon className={`w-7 h-7 ${opt.iconColor}`} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${opt.badgeColor}`}
                      >
                        {opt.badge}
                      </span>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-[#17133B] group-hover:text-[#7C3AED] transition-colors mb-2.5">
                    {opt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed mb-6">
                    {opt.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-2 pt-4 border-t border-[#E8E4F3]/60 mb-6">
                    {opt.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#17133B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                        <span className="font-medium text-[#77738F]">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-[#7C3AED] text-white shadow-md shadow-purple-200"
                      : "bg-[#F8F7FC] text-[#17133B] group-hover:bg-[#7C3AED] group-hover:text-white border border-[#E8E4F3] group-hover:border-[#7C3AED]"
                  }`}
                >
                  <span>{opt.actionText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HELPER NOTE */}
        <div className="text-center mt-10">
          <p className="text-xs text-[#77738F] font-medium inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>
              Mỗi hình thức đều hỗ trợ hệ thống ngân hàng câu hỏi môn{" "}
              <strong className="text-[#17133B]">{subject.name}</strong>.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
