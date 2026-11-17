"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Layers,
  BookOpen,
} from "lucide-react";
import { UploadedDocumentFile } from "@/core/domain/documentLearning.types";

interface PKDocumentUploadScreenProps {
  onAnalyzeFiles?: (files: UploadedDocumentFile[]) => void;
  onOpenJoinCode?: () => void;
  onFallbackSelectSubject?: () => void;
}

export function PKDocumentUploadScreen({
  onAnalyzeFiles,
  onOpenJoinCode,
  onFallbackSelectSubject,
}: PKDocumentUploadScreenProps) {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedDocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatBadge = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
    if (ext === "PDF") {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
          PDF
        </span>
      );
    }
    if (ext === "DOCX" || ext === "DOC") {
      return (
        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
          DOCX
        </span>
      );
    }
    if (ext === "PPTX" || ext === "PPT") {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
          PPTX
        </span>
      );
    }
    if (["JPG", "JPEG", "PNG"].includes(ext)) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
          {ext}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black">
        {ext}
      </span>
    );
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-rose-500" />;
    if (ext === "docx" || ext === "doc") return <FileText className="w-5 h-5 text-blue-500" />;
    if (ext === "pptx" || ext === "ppt") return <FileText className="w-5 h-5 text-amber-500" />;
    if (["jpg", "jpeg", "png"].includes(ext || "")) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    return <FileCode className="w-5 h-5 text-purple-500" />;
  };

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setUploadError(null);
    const newItems: UploadedDocumentFile[] = [];
    const allowedExtensions = ["pdf", "docx", "doc", "pptx", "ppt", "jpg", "jpeg", "png"];
    const maxSizeBytes = 30 * 1024 * 1024; // 30 MB

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      // Kiểm tra định dạng hợp lệ
      if (!allowedExtensions.includes(ext)) {
        setUploadError(`File "${file.name}" không hợp lệ. Hệ thống chỉ hỗ trợ PDF, DOCX, PPTX, JPG, PNG.`);
        continue;
      }

      // Kiểm tra dung lượng
      if (file.size > maxSizeBytes) {
        setUploadError(`File "${file.name}" (${formatFileSize(file.size)}) vượt quá dung lượng tối đa 30MB.`);
        continue;
      }

      // Kiểm tra trùng lặp
      const isDuplicate = files.some((existing) => existing.name === file.name && existing.size === file.size);
      if (isDuplicate) {
        continue;
      }

      const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      newItems.push({
        id,
        name: file.name,
        size: file.size,
        type: ext,
        rawFile: file,
        uploadedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        status: "ready",
      });
    }

    if (newItems.length > 0) {
      setFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset value để có thể chọn lại cùng một file nếu vừa xóa
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyzeClick = () => {
    if (files.length === 0) return;
    if (onAnalyzeFiles) {
      onAnalyzeFiles(files);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: BRAND, NAVIGATION & STATUS                 */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          {/* STUDYFLOW AI Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline">
                <span className="text-sm font-black tracking-tight text-[#17133B]">STUDYFLOW</span>
                <span className="text-sm font-black text-[#7C3AED] ml-1">AI</span>
              </div>
              <span className="text-[10px] text-[#77738F] font-bold tracking-wide hidden md:block">
                PK • Đấu trí học tập
              </span>
            </div>
          </Link>
        </div>

        {/* STEP PROGRESS INDICATOR & JOIN CODE */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {onOpenJoinCode && (
            <button
              type="button"
              onClick={onOpenJoinCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#EDE9FE] text-[#7C3AED] border border-[#7C3AED]/30 font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Nhập mã phòng bạn bè chia sẻ"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nhập mã phòng</span>
              <span className="sm:hidden">Mã phòng</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
              1
            </span>
            <span className="font-bold">Bước 1: Tải tài liệu</span>
          </div>

          <div className="w-4 h-0.5 bg-[#E8E4F3] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-400 font-bold border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-slate-300 text-white text-[11px] flex items-center justify-center">
              2
            </span>
            <span>Bước 2: Chọn chế độ</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CONTAINER: HERO & UPLOAD AREA                     */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* HERO TITLE & SUPPORTING DESCRIPTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black border border-[#7C3AED]/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI LEARNING FLOW</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#17133B] tracking-tight">
            Tài liệu của bạn, câu hỏi của AI
          </h1>

          <p className="text-sm sm:text-base text-[#77738F] font-medium leading-relaxed">
            Tải tài liệu học tập lên và để AI biến kiến thức thành những thử thách thú vị.
          </p>
        </div>

        {/* ERROR NOTIFICATION ALERT */}
        {uploadError && (
          <div className="w-full max-w-2xl mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* PROMINENT CENTRAL UPLOAD AREA */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-2xl p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
            isDragging
              ? "border-[#7C3AED] bg-purple-50/80 scale-[1.01] shadow-lg shadow-purple-100"
              : "border-[#D1CDE0] bg-white hover:border-[#7C3AED] hover:bg-[#FAF8FF] shadow-sm"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#DDD6FE] transition-all shadow-xs">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#17133B] mb-1">
            Kéo thả tài liệu vào đây hoặc <span className="text-[#7C3AED] underline decoration-[#7C3AED]/40 underline-offset-4 group-hover:decoration-[#7C3AED]">chọn file từ thiết bị</span>
          </h3>

          <p className="text-xs sm:text-sm text-[#77738F] font-medium max-w-md mb-5">
            Hỗ trợ slide bài giảng, giáo trình, đề cương ôn tập hoặc ảnh chụp trang sách
          </p>

          {/* SUPPORTED FORMAT PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">PDF</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">DOCX</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">PPTX</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">JPG • PNG</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">Tối đa 30MB/file</span>
          </div>
        </div>

        {/* UPLOADED FILE LIST */}
        {files.length > 0 && (
          <div className="w-full max-w-2xl mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-[#77738F] px-1">
              <span>Đã tải lên {files.length} tài liệu:</span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-white rounded-2xl border border-[#E8E4F3] flex items-center justify-between gap-3 shadow-xs hover:border-[#7C3AED] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {getFileIcon(file.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-[#17133B] truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#77738F] font-medium mt-0.5">
                        {getFormatBadge(file.name)}
                        <span>•</span>
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sẵn sàng phân tích</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Xóa tài liệu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* PRIMARY CTA: PHÂN TÍCH TÀI LIỆU */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleAnalyzeClick}
                className="w-full py-4 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
              >
                <span>Phân tích tài liệu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* FALLBACK: CHỌN MÔN TRUYỀN THỐNG */}
        {onFallbackSelectSubject && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onFallbackSelectSubject}
              className="text-xs font-bold text-[#77738F] hover:text-[#7C3AED] transition-colors cursor-pointer underline underline-offset-4"
            >
              Hoặc chọn trực tiếp môn học từ danh sách có sẵn &rarr;
            </button>
          </div>
        )}

        {/* SECURITY & PRIVACY PROMISE */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#77738F] font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tài liệu cá nhân của bạn được bảo mật riêng tư 100%, không công khai cho người khác.</span>
        </div>
      </main>
    </div>
  );
}
