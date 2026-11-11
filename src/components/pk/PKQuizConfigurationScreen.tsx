"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Mic,
  Radio,
  Sliders,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";

export interface QuizConfigData {
  questionCount: number;
  isCustomCount: boolean;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionTypes: string[];
  includeImages: boolean;
}

interface PKQuizConfigurationScreenProps {
  subject: PKSubject;
  onBack: () => void;
  onConfirmConfig: (config: QuizConfigData) => void;
}

export function PKQuizConfigurationScreen({
  subject,
  onBack,
  onConfirmConfig,
}: PKQuizConfigurationScreenProps) {
  // A. Số lượng câu hỏi state
  const [selectedPresetCount, setSelectedPresetCount] = useState<number | "custom">(10);
  const [customCountInput, setCustomCountInput] = useState<string>("12");

  // B. Độ khó state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");

  // C. Loại câu hỏi state (Trắc nghiệm 1 đáp án là loại hoạt động chính, các loại khác đánh dấu Sắp ra mắt)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["single_choice"]);

  // D. Bao gồm hình ảnh state
  const [includeImages, setIncludeImages] = useState<boolean>(true);

  // Compute actual question count
  const finalQuestionCount =
    selectedPresetCount === "custom"
      ? Math.max(1, Math.min(50, parseInt(customCountInput) || 10))
      : selectedPresetCount;

  const handleToggleType = (typeId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== typeId));
      }
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleProceed = () => {
    onConfirmConfig({
      questionCount: finalQuestionCount,
      isCustomCount: selectedPresetCount === "custom",
      difficulty,
      questionTypes: selectedTypes,
      includeImages,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: TITLE & 3-STEP PROGRESS                    */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại chọn chế độ"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-[#17133B]">
                Tạo phòng Voice học (1 vs 1)
              </span>
              <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md hidden sm:inline">
                {subject.code}
              </span>
            </div>
            <span className="text-[11px] text-[#77738F] font-medium hidden md:block">
              Môn học: <strong>{subject.name}</strong>
            </span>
          </div>
        </div>

        {/* THREE-STEP PROGRESS INDICATOR */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
          {/* Step 1: Active */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span className="font-bold">Bước 1: Thiết lập nội dung</span>
          </div>

          <div className="w-3 h-0.5 bg-[#E8E4F3] hidden sm:block" />

          {/* Step 2: Upcoming */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-bold border border-slate-200">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center">
              2
            </span>
            <span>Mời bạn tham gia</span>
          </div>

          <div className="w-3 h-0.5 bg-[#E8E4F3] hidden md:block" />

          {/* Step 3: Upcoming */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-bold border border-slate-200">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center">
              3
            </span>
            <span>Bắt đầu ôn tập</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CONFIGURATION CARD                                */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-8 animate-in fade-in duration-300">
          {/* CARD HEADER & ILLUSTRATION */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E8E4F3]">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#7C3AED]/30 text-xs text-[#7C3AED] font-black">
                <Sliders className="w-3.5 h-3.5" />
                <span>CẤU HÌNH PHÒNG HỌC 1 VS 1</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#17133B] tracking-tight">
                Thiết lập nội dung ôn tập
              </h1>

              <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed">
                Tùy chỉnh bộ câu hỏi để có buổi ôn tập phù hợp với bạn và người đồng hành.
              </p>
            </div>

            {/* Illustration: Two students learning together through voice communication */}
            <div className="w-48 h-32 rounded-2xl bg-gradient-to-tr from-[#FAF8FF] via-[#EDE9FE]/50 to-indigo-50 border border-[#EDE9FE] flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
              <svg className="w-full h-full max-h-28" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Audio Waves in center */}
                <g className="animate-pulse">
                  <rect x="94" y="55" width="2.5" height="15" rx="1.25" fill="#7C3AED" />
                  <rect x="99" y="47" width="2.5" height="30" rx="1.25" fill="#10B981" />
                  <rect x="104" y="42" width="2.5" height="40" rx="1.25" fill="#7C3AED" />
                  <rect x="109" y="48" width="2.5" height="28" rx="1.25" fill="#6366F1" />
                  <rect x="114" y="55" width="2.5" height="15" rx="1.25" fill="#10B981" />
                </g>

                {/* Left Student with Headset */}
                <g>
                  <circle cx="45" cy="50" r="16" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
                  <circle cx="45" cy="46" r="10" fill="#FDE68A" />
                  <path d="M32 46 C32 34, 58 34, 58 46" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <rect x="30" y="44" width="4" height="8" rx="2" fill="#7C3AED" />
                  <rect x="56" y="44" width="4" height="8" rx="2" fill="#7C3AED" />
                  <path d="M56 50 L50 56" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="49" cy="57" r="2" fill="#10B981" />
                  <path d="M30 95 C30 75, 60 75, 60 95 Z" fill="#7C3AED" />
                </g>

                {/* Right Student with Headset */}
                <g>
                  <circle cx="155" cy="50" r="16" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5" />
                  <circle cx="155" cy="46" r="10" fill="#FDE68A" />
                  <path d="M142 46 C142 34, 168 34, 168 46" stroke="#10B981" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <rect x="140" y="44" width="4" height="8" rx="2" fill="#10B981" />
                  <rect x="166" y="44" width="4" height="8" rx="2" fill="#10B981" />
                  <path d="M144 50 L150 56" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="151" cy="57" r="2" fill="#7C3AED" />
                  <path d="M140 95 C140 75, 170 75, 170 95 Z" fill="#10B981" />
                </g>

                {/* Question bubble */}
                <rect x="75" y="10" width="50" height="18" rx="9" fill="#FFFFFF" stroke="#E8E4F3" />
                <text x="100" y="22" textAnchor="middle" fill="#7C3AED" fontSize="8" fontWeight="bold">
                  Voice 1v1
                </text>
              </svg>
            </div>
          </div>

          {/* ======================================================= */}
          {/* SECTION A: SỐ LƯỢNG CÂU HỎI                              */}
          {/* ======================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-[#17133B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#7C3AED] font-black text-xs flex items-center justify-center">
                  A
                </span>
                <span>Số lượng câu hỏi:</span>
              </label>

              <span className="text-xs font-bold text-[#7C3AED]">
                Đã chọn: {finalQuestionCount} câu
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[5, 10, 15, 20].map((count) => {
                const isSelected = selectedPresetCount === count;
                const isDefault = count === 10;

                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedPresetCount(count)}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs transition-all relative flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "border-[#7C3AED] bg-[#FAF8FF] text-[#7C3AED] ring-2 ring-[#EDE9FE] shadow-xs"
                        : "border-[#E8E4F3] bg-white text-[#17133B] hover:border-[#7C3AED]/60"
                    }`}
                  >
                    <span className="text-base font-black">{count} câu</span>
                    {isDefault && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-purple-100 text-[#7C3AED]">
                        Mặc định
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Count Option */}
              <button
                type="button"
                onClick={() => setSelectedPresetCount("custom")}
                className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedPresetCount === "custom"
                    ? "border-[#7C3AED] bg-[#FAF8FF] text-[#7C3AED] ring-2 ring-[#EDE9FE] shadow-xs"
                    : "border-[#E8E4F3] bg-white text-[#17133B] hover:border-[#7C3AED]/60"
                }`}
              >
                <span className="text-xs font-black">Tùy chọn khác</span>
                <span className="text-[10px] text-[#77738F]">Tự nhập số</span>
              </button>
            </div>

            {/* Custom count input field if selected */}
            {selectedPresetCount === "custom" && (
              <div className="p-3 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] flex items-center gap-3 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-[#17133B]">Nhập số lượng câu hỏi mong muốn (1 - 50):</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customCountInput}
                  onChange={(e) => setCustomCountInput(e.target.value)}
                  className="w-20 px-3 py-1.5 rounded-xl border border-[#7C3AED] bg-white font-black text-center text-sm text-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#EDE9FE]"
                />
                <span className="text-xs text-[#77738F]">câu</span>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION B: ĐỘ KHÓ                                       */}
          {/* ======================================================= */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-black text-[#17133B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#7C3AED] font-black text-xs flex items-center justify-center">
                B
              </span>
              <span>Độ khó bộ đề:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: "easy" as const, title: "Dễ", desc: "Củng cố kiến thức nền tảng", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { id: "medium" as const, title: "Trung bình", desc: "Độ khó tương đương đề thi", color: "text-purple-700 bg-purple-50 border-purple-200", isDefault: true },
                { id: "hard" as const, title: "Khó", desc: "Câu hỏi phân hóa nâng cao", color: "text-rose-700 bg-rose-50 border-rose-200" },
                { id: "mixed" as const, title: "Hỗn hợp", desc: "Đa dạng các mức độ", color: "text-blue-700 bg-blue-50 border-blue-200" },
              ].map((item) => {
                const isSelected = difficulty === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setDifficulty(item.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE] shadow-xs"
                        : "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-[#17133B]">{item.title}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : item.isDefault ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                          Mặc định
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#77738F] font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* SECTION C: LOẠI CÂU HỎI                                 */}
          {/* ======================================================= */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-[#17133B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#7C3AED] font-black text-xs flex items-center justify-center">
                  C
                </span>
                <span>Loại câu hỏi (Chọn nhiều):</span>
              </label>
              <span className="text-[11px] text-[#77738F]">Tối ưu cho hình thức đàm thoại 1v1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "single_choice",
                  title: "Trắc nghiệm (1 đáp án)",
                  desc: "Mô hình chuẩn 4 phương án A, B, C, D phù hợp nhất cho Voice học.",
                  isAvailable: true,
                },
                {
                  id: "multi_choice",
                  title: "Trắc nghiệm (nhiều đáp án)",
                  desc: "Chọn nhiều hơn một đáp án đúng.",
                  isAvailable: false,
                },
                {
                  id: "fill_blank",
                  title: "Điền vào chỗ trống",
                  desc: "Điền thuật ngữ hoặc công thức vào chỗ trống.",
                  isAvailable: false,
                },
                {
                  id: "short_answer",
                  title: "Câu trả lời ngắn",
                  desc: "Tự nhập câu trả lời ngắn theo lý thuyết.",
                  isAvailable: false,
                },
              ].map((item) => {
                const isChecked = selectedTypes.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleType(item.id, item.isAvailable)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                      !item.isAvailable
                        ? "opacity-60 bg-slate-50/70 border-slate-200 cursor-not-allowed"
                        : isChecked
                        ? "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE] cursor-pointer"
                        : "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/60 cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${
                        isChecked
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-black text-[#17133B]">
                          {item.title}
                        </span>
                        {!item.isAvailable && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            Sắp ra mắt
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#77738F] font-medium mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* SECTION D: BAO GỒM HÌNH ẢNH                             */}
          {/* ======================================================= */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-black text-[#17133B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#7C3AED] font-black text-xs flex items-center justify-center">
                D
              </span>
              <span>Bao gồm hình ảnh / sơ đồ:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIncludeImages(true)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  includeImages
                    ? "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE]"
                    : "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-[#17133B]">Bao gồm (Mặc định)</h5>
                    <p className="text-[11px] text-[#77738F]">Kèm đồ thị PPF, đường cung cầu trực quan.</p>
                  </div>
                </div>
                {includeImages && <Check className="w-4 h-4 text-[#7C3AED]" />}
              </div>

              <div
                onClick={() => setIncludeImages(false)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  !includeImages
                    ? "border-[#7C3AED] bg-[#FAF8FF] ring-2 ring-[#EDE9FE]"
                    : "border-[#E8E4F3] bg-white hover:border-[#7C3AED]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-[#17133B]">Chỉ văn bản</h5>
                    <p className="text-[11px] text-[#77738F]">Chỉ hiển thị các câu hỏi câu chữ thuần túy.</p>
                  </div>
                </div>
                {!includeImages && <Check className="w-4 h-4 text-[#7C3AED]" />}
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* BOTTOM CONFIRMATION BUTTON                              */}
          {/* ======================================================= */}
          <div className="pt-6 border-t border-[#E8E4F3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#77738F] font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>
                Bộ đề đã chọn: <strong>{finalQuestionCount} câu</strong> • Độ khó:{" "}
                <strong>{difficulty.toUpperCase()}</strong> • Hình ảnh:{" "}
                <strong>{includeImages ? "Bật" : "Tắt"}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Tạo phòng và mời bạn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
