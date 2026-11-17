"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit3,
  RotateCcw,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  BookOpen,
  Info,
  Sliders,
  HelpCircle,
  ShieldCheck,
  Flame,
} from "lucide-react";
import {
  GeneratedQuestionWithSource,
  DocumentAnalysisResult,
  DocumentQuizCustomConfig,
} from "@/core/domain/documentLearning.types";
import { PKSubject } from "@/core/domain/pk.types";

interface PKQuestionReviewScreenProps {
  subject: PKSubject;
  analysis: DocumentAnalysisResult;
  config: DocumentQuizCustomConfig;
  sourceFileName: string;
  questions: GeneratedQuestionWithSource[];
  onUpdateQuestions: (questions: GeneratedQuestionWithSource[]) => void;
  onRegenerateSingle: (questionId: string, index: number) => void;
  onRegenerateAll: () => void;
  onConfirmSet: (questions: GeneratedQuestionWithSource[]) => void;
  onBackToConfig: () => void;
}

export function PKQuestionReviewScreen({
  subject,
  analysis,
  config,
  sourceFileName,
  questions,
  onUpdateQuestions,
  onRegenerateSingle,
  onRegenerateAll,
  onConfirmSet,
  onBackToConfig,
}: PKQuestionReviewScreenProps) {
  // Editing state
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestionWithSource | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>(["", "", "", ""]);
  const [editCorrectIdx, setEditCorrectIdx] = useState(0);
  const [editExplanation, setEditExplanation] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<"easy" | "medium" | "hard" | "expert" | "adaptive">("medium");

  // Deletion feedback
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  // Stats
  const verifiedCount = questions.filter((q) => q.validationStatus === "user_verified").length;

  // Toggle verify a single question
  const handleToggleVerify = (id: string) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          validationStatus:
            q.validationStatus === "user_verified"
              ? ("ai_generated_unverified" as const)
              : ("user_verified" as const),
        };
      }
      return q;
    });
    onUpdateQuestions(updated);
  };

  // Verify all
  const handleVerifyAll = () => {
    const updated = questions.map((q) => ({
      ...q,
      validationStatus: "user_verified" as const,
    }));
    onUpdateQuestions(updated);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (questions.length <= 3) {
      alert("Bộ câu hỏi cần tối thiểu 3 câu để bắt đầu học tập.");
      return;
    }
    const updated = questions.filter((q) => q.id !== id);
    onUpdateQuestions(updated);
    setDeletedToast("Đã xóa câu hỏi khỏi bộ đề.");
    setTimeout(() => setDeletedToast(null), 3000);
  };

  // Open Edit Modal
  const handleOpenEdit = (q: GeneratedQuestionWithSource) => {
    setEditingQuestion(q);
    setEditText(q.questionText);
    setEditOptions([...q.options]);
    setEditCorrectIdx(q.correctAnswers[0] ?? 0);
    setEditExplanation(q.explanation);
    setEditTopic(q.topic);
    setEditDifficulty(q.difficulty);
  };

  // Save Edit
  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    if (!editText.trim()) {
      alert("Nội dung câu hỏi không được để trống.");
      return;
    }

    const updated = questions.map((q) => {
      if (q.id === editingQuestion.id) {
        return {
          ...q,
          questionText: editText.trim(),
          options: editOptions.map((opt, i) => opt.trim() || `Phương án ${i + 1}`),
          correctAnswers: [editCorrectIdx],
          explanation: editExplanation.trim(),
          topic: editTopic.trim() || q.topic,
          difficulty: editDifficulty,
          validationStatus: "user_verified" as const, // Tự động đánh dấu đã người dùng xác minh khi sửa
        };
      }
      return q;
    });

    onUpdateQuestions(updated);
    setEditingQuestion(null);
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy":
        return { label: "Dễ", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "medium":
        return { label: "Trung bình", color: "bg-purple-50 text-[#7C3AED] border-purple-200" };
      case "hard":
        return { label: "Khó", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "expert":
        return { label: "Chuyên gia", color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: "Adaptive", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: BREADCRUMB & STATUS                        */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại cấu hình</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#17133B]">Bộ câu hỏi đã sẵn sàng</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black">
                {questions.length} câu hỏi
              </span>
            </div>
            <p className="text-[11px] text-[#77738F] font-medium hidden sm:block">
              Tạo từ tài liệu: <strong>{sourceFileName}</strong> • Môn: <strong>{subject.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerateAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tạo lại toàn bộ câu hỏi từ tài liệu"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="hidden md:inline">Tạo lại tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirmSet(questions)}
            className="py-2 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <span>Xác nhận bộ câu hỏi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. SUB-BAR: VERIFICATION STATUS & BULK ACTIONS            */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-[#E8E4F3] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* AI Generated Default Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>AI tạo – chưa xác minh ({questions.length - verifiedCount})</span>
            </div>

            {verifiedCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Người học đã xác nhận ({verifiedCount}/{questions.length})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerifyAll}
              className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xác nhận tất cả</span>
            </button>
          </div>
        </div>
      </section>

      {/* QUICK JUMP QUESTION STRIP */}
      <div className="bg-[#FAF8FF] border-b border-[#EDE9FE] px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#77738F] mr-2 shrink-0">Nhảy nhanh:</span>
          {questions.map((q, idx) => {
            const isVerified = q.validationStatus === "user_verified";
            return (
              <a
                key={q.id}
                href={`#question-card-${idx}`}
                className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                  isVerified
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#7C3AED]"
                }`}
                title={`Câu ${idx + 1}: ${q.topic}`}
              >
                {idx + 1}
              </a>
            );
          })}
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {deletedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#17133B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {deletedToast}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN CONTENT: LIST OF QUESTION CARDS                   */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {questions.map((q, idx) => {
          const diffMeta = getDifficultyLabel(q.difficulty);
          const isVerified = q.validationStatus === "user_verified";

          return (
            <article
              key={q.id}
              id={`question-card-${idx}`}
              className={`bg-white rounded-3xl p-5 sm:p-7 border transition-all shadow-xs space-y-5 scroll-mt-24 ${
                isVerified ? "border-emerald-200 ring-1 ring-emerald-100" : "border-[#E8E4F3]"
              }`}
            >
              {/* CARD TOP META */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EDF9] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] font-black text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-[#17133B]">{q.topic}</h3>
                    <span className="text-[10px] text-[#77738F] font-medium block">
                      {q.sourceReference.chapterOrSection || "Nội dung bài học"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Difficulty Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${diffMeta.color}`}>
                    {diffMeta.label}
                  </span>

                  {/* Validation Status Badge */}
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Đã xác nhận</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>AI tạo – chưa xác minh</span>
                    </span>
                  )}
                </div>
              </div>

              {/* QUESTION CONTENT */}
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-bold text-[#17133B] leading-relaxed">
                  {q.questionText}
                </p>

                {/* OPTIONS (A, B, C, D) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctAnswers.includes(optIdx);
                    const prefix = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                          isCorrect
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-xs"
                            : "bg-[#FAF8FF] border-[#E8E4F3] text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-500 border border-slate-200"
                          }`}
                        >
                          {prefix}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EXPLANATION BOX */}
              {q.explanation && (
                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs text-purple-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-[#7C3AED]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Giải thích đáp án:</span>
                  </div>
                  <p className="text-[#322F55] leading-relaxed pl-5 font-medium">{q.explanation}</p>
                </div>
              )}

              {/* STRICT SOURCE CITATION REFERENCE */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#77738F]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Nguồn tài liệu: {q.sourceReference.fileName}</span>
                  </span>
                  <span>{q.sourceReference.chapterOrSection || "Nội dung trích đoạn"}</span>
                </div>
                {q.sourceReference.excerpt ? (
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/80">
                    &ldquo;{q.sourceReference.excerpt}&rdquo;
                  </p>
                ) : (
                  <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Tài liệu nguồn đoạn này chưa đủ trích dẫn chi tiết.</span>
                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR: EDIT, REGENERATE, DELETE, VERIFY */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EDF9]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="py-1.5 px-3 rounded-xl border border-[#E8E4F3] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Chỉnh sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRegenerateSingle(q.id, idx)}
                    className="py-1.5 px-3 rounded-xl border border-[#E8E4F3] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Tạo lại riêng câu này từ tài liệu"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tạo lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="py-1.5 px-3 rounded-xl border border-[#E8E4F3] text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleVerify(q.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isVerified
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-purple-50 text-[#7C3AED] hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isVerified ? "Bỏ xác nhận" : "Xác nhận câu này"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* ========================================================= */}
      {/* 4. BOTTOM FLOATING ACTION BAR                             */}
      {/* ========================================================= */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4F3] px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#77738F] font-medium text-center sm:text-left">
            <span className="font-black text-[#17133B]">{questions.length} câu hỏi</span> đã sẵn sàng • Môn:{" "}
            <strong className="text-[#7C3AED]">{subject.name}</strong> • Đã duyệt:{" "}
            <strong>
              {verifiedCount}/{questions.length}
            </strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToConfig}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-[#E8E4F3] text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Cấu hình lại
            </button>

            <button
              type="button"
              onClick={() => onConfirmSet(questions)}
              className="flex-2 sm:flex-none py-2.5 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Xác nhận bộ câu hỏi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 5. EDIT QUESTION MODAL                                    */}
      {/* ========================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-[#E8E4F3] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[#F0EDF9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-[#17133B]">Chỉnh sửa câu hỏi</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QUESTION TEXT INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#17133B] block">Nội dung câu hỏi:</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-[#17133B] focus:outline-none focus:border-[#7C3AED]"
                placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
              />
            </div>

            {/* 4 OPTIONS WITH RADIO CORRECT PICK */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#17133B] flex items-center justify-between">
                <span>Các phương án lựa chọn:</span>
                <span className="text-[11px] text-[#77738F] font-medium">(Chọn tròn để đặt đáp án đúng)</span>
              </label>

              {editOptions.map((opt, i) => {
                const prefix = String.fromCharCode(65 + i);
                const isSelectedCorrect = editCorrectIdx === i;

                return (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditCorrectIdx(i)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all cursor-pointer ${
                        isSelectedCorrect
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border-2 border-slate-300 text-slate-500 hover:border-slate-400"
                      }`}
                      title="Chọn phương án này làm đáp án đúng"
                    >
                      {isSelectedCorrect ? <Check className="w-3.5 h-3.5" /> : prefix}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...editOptions];
                        copy[i] = e.target.value;
                        setEditOptions(copy);
                      }}
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs text-[#17133B] focus:outline-none ${
                        isSelectedCorrect
                          ? "border-emerald-400 bg-emerald-50/40"
                          : "border-slate-300 focus:border-[#7C3AED]"
                      }`}
                      placeholder={`Phương án ${prefix}...`}
                    />
                  </div>
                );
              })}
            </div>

            {/* EXPLANATION INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#17133B] block">Giải thích đáp án:</label>
              <textarea
                value={editExplanation}
                onChange={(e) => setEditExplanation(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-[#17133B] focus:outline-none focus:border-[#7C3AED]"
                placeholder="Giải thích lý do đáp án được chọn..."
              />
            </div>

            {/* TOPIC & DIFFICULTY */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-black text-[#17133B] block">Chủ đề:</label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-[#17133B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-[#17133B] block">Độ khó:</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-[#17133B] bg-white"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                  <option value="expert">Chuyên gia</option>
                  <option value="adaptive">Adaptive</option>
                </select>
              </div>
            </div>

            {/* MODAL ACTION BUTTONS */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#F0EDF9]">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="py-2.5 px-4 rounded-xl border border-[#E8E4F3] text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="py-2.5 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
