"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  FileText,
  Search,
} from "lucide-react";
import {
  UploadedDocumentFile,
  DocumentAnalysisResult,
} from "@/core/domain/documentLearning.types";
import { documentAnalysisService } from "@/core/services/documentAnalysisService";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";

interface PKDocumentAnalysisScreenProps {
  files: UploadedDocumentFile[];
  onAnalysisComplete: (result: DocumentAnalysisResult) => void;
  onCancel: () => void;
}

export function PKDocumentAnalysisScreen({
  files,
  onAnalysisComplete,
  onCancel,
}: PKDocumentAnalysisScreenProps) {
  // 4 Processing Steps
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [isDoneProcessing, setIsDoneProcessing] = useState(false);

  // Fallback: Manual Subject Selection
  const [manualSubjectId, setManualSubjectId] = useState<string>("");
  const [manualSubjectSearch, setManualSubjectSearch] = useState<string>("");

  const steps = [
    { title: "Đọc và trích xuất nội dung tài liệu", desc: "Đọc cấu trúc văn bản, bảng biểu và thuật ngữ" },
    { title: "Xác định môn học & bối cảnh đào tạo", desc: "So khớp ngân hàng môn học đại học" },
    { title: "Nhận diện chương và chủ đề trọng tâm", desc: "Phân bổ cấu trúc bài giảng và phân đoạn kiến thức" },
    { title: "Chuẩn bị ma trận câu hỏi học tập", desc: "Sẵn sàng sinh thử thách trắc nghiệm" },
  ];

  useEffect(() => {
    let active = true;

    async function runPipeline() {
      // Step 0: Đọc tài liệu
      setCurrentStepIndex(0);
      await new Promise((r) => setTimeout(r, 600));
      if (!active) return;

      // Step 1: Phân tích và nhận diện môn
      setCurrentStepIndex(1);
      const result = await documentAnalysisService.analyzeDocument(files);
      await new Promise((r) => setTimeout(r, 700));
      if (!active) return;

      // Step 2: Nhận diện chương & chủ đề
      setCurrentStepIndex(2);
      await new Promise((r) => setTimeout(r, 600));
      if (!active) return;

      // Step 3: Chuẩn bị ma trận
      setCurrentStepIndex(3);
      await new Promise((r) => setTimeout(r, 500));
      if (!active) return;

      setAnalysisResult(result);
      setIsDoneProcessing(true);
    }

    runPipeline();

    return () => {
      active = false;
    };
  }, [files]);

  const filteredSubjects = MOCK_PK_SUBJECTS.filter((s) =>
    s.name.toLowerCase().includes(manualSubjectSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(manualSubjectSearch.toLowerCase())
  );

  const handleManualSubjectSelect = (subj: PKSubject) => {
    setManualSubjectId(subj.id);
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        identifiedSubjectName: subj.name,
        identifiedSubjectId: subj.id,
      });
    }
  };

  const handleProceed = () => {
    if (!analysisResult) return;
    onAnalysisComplete(analysisResult);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
            <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
          </div>
          <span className="text-sm font-black text-[#17133B]">Phân tích tài liệu học tập</span>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-[#77738F] hover:text-[#17133B] transition-colors cursor-pointer"
        >
          Hủy & chọn file khác
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* PROCESSING ANIMATION BOX */}
        {!isDoneProcessing && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#17133B]">
                AI đang phân tích tài liệu...
              </h2>
              <p className="text-xs sm:text-sm text-[#77738F] font-medium">
                Đang trích xuất nội dung từ {files.length} file tài liệu bạn đã tải lên.
              </p>
            </div>

            {/* 4 STEPS PROGRESS LIST */}
            <div className="space-y-3 text-left pt-2 max-w-md mx-auto">
              {steps.map((st, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCompleted
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : isCurrent
                        ? "bg-purple-50/80 border-[#7C3AED] text-[#17133B] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black">{st.title}</h4>
                      <p className="text-[11px] text-[#77738F]">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYSIS RESULT BOX */}
        {isDoneProcessing && analysisResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 animate-in zoom-in-95 duration-200">
            {/* SUBJECT IDENTIFIED BANNER */}
            {analysisResult.identifiedSubjectName ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác thực thành công</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#17133B]">
                  Môn học được nhận diện: <span className="text-[#7C3AED]">{analysisResult.identifiedSubjectName}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#77738F]">
                  <span className="flex items-center gap-1 text-[#17133B]">
                    <Layers className="w-4 h-4 text-[#7C3AED]" />
                    <span>{analysisResult.chapters.length} chương</span>
                  </span>
                  <span>•</span>
                  <span>{analysisResult.totalTopicsCount} chủ đề</span>
                  <span>•</span>
                  <span>{analysisResult.extractedWordCount.toLocaleString()} từ ngữ</span>
                </div>
              </div>
            ) : (
              /* UNIDENTIFIED SUBJECT FALLBACK */
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>AI chưa xác định được môn học chính xác</span>
                </div>
                <p className="text-xs text-amber-700">
                  Tài liệu của bạn chứa kiến thức chuyên biệt. Hãy chọn môn học tương ứng bên dưới để AI cấu hình đề thi chuẩn xác nhất:
                </p>

                {/* SEARCH & SELECT SUBJECT MANUALLY */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên môn học (Kinh tế vi mô, Kế toán, Luật...)"
                    value={manualSubjectSearch}
                    onChange={(e) => setManualSubjectSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {filteredSubjects.map((subj) => (
                    <div
                      key={subj.id}
                      onClick={() => handleManualSubjectSelect(subj)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        manualSubjectId === subj.id
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-white hover:bg-amber-100 text-slate-700 border-amber-200"
                      }`}
                    >
                      <span>{subj.name} ({subj.code})</span>
                      {manualSubjectId === subj.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IDENTIFIED CHAPTERS & TOPICS PREVIEW */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#17133B] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#7C3AED]" />
                <span>Cấu trúc nội dung trích xuất từ tài liệu:</span>
              </h4>

              <div className="space-y-2">
                {analysisResult.chapters.map((chap, i) => (
                  <div
                    key={chap.id}
                    className="p-3 bg-[#FAF8FF] rounded-xl border border-[#EDE9FE] text-xs space-y-1"
                  >
                    <div className="font-black text-[#17133B] flex items-center justify-between">
                      <span>{chap.title}</span>
                      <span className="text-[10px] text-[#7C3AED] bg-white px-2 py-0.5 rounded-md border border-[#EDE9FE]">
                        {chap.topics.length} chủ đề
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77738F]">
                      Chủ đề: {chap.topics.join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION CTA */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-4 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tải lại file khác
              </button>

              <button
                type="button"
                onClick={handleProceed}
                disabled={!analysisResult.identifiedSubjectName}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  analysisResult.identifiedSubjectName
                    ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xl shadow-purple-200 hover:scale-[1.01]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Xem đề xuất câu hỏi của AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
