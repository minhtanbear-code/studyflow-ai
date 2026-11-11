"use client";

import { X, FileText, CheckCircle2, Download, ExternalLink, Calendar, Building, ShieldCheck } from "lucide-react";
import { CitationDetail } from "@/core/services/assistant.service";

interface CitationDrawerProps {
  citation: CitationDetail | null;
  onClose: () => void;
}

export function CitationDrawer({ citation, onClose }: CitationDrawerProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Căn cứ pháp quy đã duyệt
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {citation.docCode}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Thông tin văn bản */}
            <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
              <h4 className="font-bold text-slate-900 leading-snug">
                {citation.docTitle}
              </h4>

              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{citation.issuingOrg}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{citation.signDate}</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trạng thái: Đã kiểm duyệt (Status: Approved)</span>
                </div>
              </div>
            </div>

            {/* Trích đoạn điều khoản gốc */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {citation.article} • {citation.clause}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bản sao mộc đỏ</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif bg-opacity-80">
                <p className="italic mb-2 text-slate-500 font-sans text-[11px]">
                  &quot;Trích nguyên văn quyết định ban hành có hiệu lực:&quot;
                </p>
                <p>
                  {citation.fullExcerpt}
                </p>
              </div>
            </div>

            {/* Từ khóa trọng tâm */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Các điểm mấu chốt bạn cần lưu ý:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {citation.highlightWords.map((word, i) => (
                  <span
                    key={i}
                    className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-medium"
                  >
                    ★ {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Drawer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Knowledge Provenance Record</span>
            <button
              type="button"
              onClick={() => alert(`Đang tải bản PDF văn bản gốc: ${citation.docCode}`)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file PDF mộc đỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
