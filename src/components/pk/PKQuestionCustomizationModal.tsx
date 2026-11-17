"use client";

import React, { useState } from "react";
import {
  X,
  Sliders,
  Check,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import {
  DocumentAnalysisResult,
  DocumentQuizCustomConfig,
} from "@/core/domain/documentLearning.types";

interface PKQuestionCustomizationModalProps {
  analysis: DocumentAnalysisResult;
  initialCount?: number;
  initialDifficulty?: "easy" | "medium" | "hard" | "expert" | "adaptive";
  onConfirm: (config: DocumentQuizCustomConfig) => void;
  onClose: () => void;
}

export function PKQuestionCustomizationModal({
  analysis,
  initialCount = 10,
  initialDifficulty = "medium",
  onConfirm,
  onClose,
}: PKQuestionCustomizationModalProps) {
  // 1. Knowledge Scope
  const [isAllDocument, setIsAllDocument] = useState(true);
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    analysis.chapters.map((c) => c.id)
  );

  // 2. Question Quantity: 5 | 10 | 15 | 20 | "custom"
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(
    [5, 10, 15, 20].includes(initialCount) ? initialCount : "custom"
  );
  const [customInput, setCustomInput] = useState<string>(
    [5, 10, 15, 20].includes(initialCount) ? "12" : String(initialCount)
  );

  // 3. Difficulty: Dễ | Trung bình | Khó | Chuyên gia | Adaptive
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert" | "adaptive">(
    initialDifficulty
  );

  // 4. Question Types: Single | Multiple | Image/Chart
  const [selectedTypes, setSelectedTypes] = useState<
    ("single_choice" | "multiple_choice" | "image_chart")[]
  >(["single_choice"]);

  const toggleChapter = (chapterId: string) => {
    setIsAllDocument(false);
    if (selectedChapters.includes(chapterId)) {
      if (selectedChapters.length > 1) {
        setSelectedChapters(selectedChapters.filter((id) => id !== chapterId));
      }
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };

  const handleSelectAllDocument = () => {
    setIsAllDocument(true);
    setSelectedChapters(analysis.chapters.map((c) => c.id));
  };

  const toggleType = (t: "single_choice" | "multiple_choice" | "image_chart") => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((item) => item !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const finalCount =
    selectedPreset === "custom"
      ? Math.max(3, Math.min(40, parseInt(customInput) || 10))
      : selectedPreset;

  const handleSave = () => {
    onConfirm({
      selectedChapterIds: selectedChapters,
      selectedTopics: [],
      isAllDocument,
      questionCount: finalCount,
      difficulty,
      questionTypes: selectedTypes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200 my-8">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#F0EDF9] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#17133B]">Tùy chỉnh bộ câu hỏi</h3>
              <p className="text-[11px] text-[#77738F] font-medium">Thiết lập theo nhu cầu ôn tập của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. KNOWLEDGE SCOPE */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-[#17133B] block">
            1. Phạm vi kiến thức từ tài liệu:
          </label>

          <div className="space-y-2">
            <div
              onClick={handleSelectAllDocument}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                isAllDocument
                  ? "bg-purple-50 text-[#7C3AED] border-[#7C3AED]"
                  : "bg-[#FAF8FF] text-slate-700 border-[#EDE9FE] hover:border-[#7C3AED]"
              }`}
            >
              <span>Toàn bộ tài liệu ({analysis.chapters.length} chương)</span>
              {isAllDocument && <Check className="w-4 h-4 text-[#7C3AED]" />}
            </div>

            <div className="pl-2 space-y-1.5">
              {analysis.chapters.map((c) => {
                const isSelected = selectedChapters.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleChapter(c.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                      isSelected && !isAllDocument
                        ? "bg-purple-50 text-[#7C3AED] border-[#7C3AED] font-bold"
                        : "bg-white text-slate-600 border-[#E8E4F3] hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate max-w-[280px]">{c.title}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-[#7C3AED] focus:ring-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. QUESTION QUANTITY */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-black text-[#17133B]">2. Số lượng câu hỏi:</label>
            <span className="font-black text-[#7C3AED]">{finalCount} câu</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedPreset(num)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  selectedPreset === num
                    ? "bg-[#7C3AED] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-[#EDE9FE]"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedPreset("custom")}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                selectedPreset === "custom"
                  ? "bg-[#7C3AED] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-[#EDE9FE]"
              }`}
            >
              Tùy chọn
            </button>
          </div>

          {selectedPreset === "custom" && (
            <div className="pt-1 flex items-center gap-2">
              <input
                type="number"
                min="3"
                max="40"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Nhập số câu (3 - 40)"
                className="w-full px-3 py-2 rounded-xl border border-[#7C3AED] text-xs font-bold text-[#17133B] focus:outline-none"
              />
              <span className="text-xs text-[#77738F] shrink-0 font-medium">(tối đa 40 câu)</span>
            </div>
          )}
        </div>

        {/* 3. DIFFICULTY */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-[#17133B] block">3. Mức độ thử thách:</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs font-bold">
            {[
              { id: "easy", label: "Dễ" },
              { id: "medium", label: "Trung bình" },
              { id: "hard", label: "Khó" },
              { id: "expert", label: "Chuyên gia" },
              { id: "adaptive", label: "Adaptive" },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as any)}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all truncate ${
                  difficulty === d.id
                    ? "bg-[#7C3AED] text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. QUESTION TYPES */}
        <div className="space-y-2.5">
          <label className="text-xs font-black text-[#17133B] block">4. Dạng câu hỏi:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
            <div
              onClick={() => toggleType("single_choice")}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedTypes.includes("single_choice")
                  ? "bg-purple-50 text-[#7C3AED] border-[#7C3AED]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span>1 đáp án đúng</span>
              {selectedTypes.includes("single_choice") && <Check className="w-3.5 h-3.5" />}
            </div>

            <div
              onClick={() => toggleType("multiple_choice")}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedTypes.includes("multiple_choice")
                  ? "bg-purple-50 text-[#7C3AED] border-[#7C3AED]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span>Nhiều đáp án</span>
              {selectedTypes.includes("multiple_choice") && <Check className="w-3.5 h-3.5" />}
            </div>

            <div
              onClick={() => toggleType("image_chart")}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedTypes.includes("image_chart")
                  ? "bg-purple-50 text-[#7C3AED] border-[#7C3AED]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span>Hình ảnh/biểu đồ</span>
              {selectedTypes.includes("image_chart") && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Tạo bộ câu hỏi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
