"use client";

import React, { useState } from "react";
import {
  KeyRound,
  LogIn,
  ClipboardPaste,
  Sparkles,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export interface RoomDetails {
  roomCode: string;
  roomName: string;
  subjectId: string;
  subjectName: string;
  hostName: string;
  questionCount?: number;
  difficulty?: string;
  mode?: "voice" | "competition";
}

interface PKJoinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCode: (code: string) => Promise<boolean | RoomDetails> | boolean | RoomDetails;
}

export function PKJoinCodeModal({ isOpen, onClose, onJoinCode }: PKJoinCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          // If user pasted a full URL like .../pk?room=VH-1234
          const match = text.match(/room=([A-Z0-9-]+)/i) || text.match(/[A-Z0-9-]{4,15}/i);
          const cleanCode = (match ? match[1] || match[0] : text).trim().toUpperCase();
          setCode(cleanCode);
          setError("");
          setPasteNotice(true);
          setTimeout(() => setPasteNotice(false), 2000);
        }
      }
    } catch {
      setError("Không thể đọc từ bộ nhớ tạm, vui lòng nhập thủ công.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError("Vui lòng nhập mã phòng.");
      return;
    }

    if (clean.length < 4) {
      setError("Mã phòng hợp lệ cần tối thiểu 4 ký tự (VD: VH-1024, PK-2048).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onJoinCode(clean);
      if (!result) {
        setError(`Không tìm thấy phòng "${clean}". Vui lòng kiểm tra lại mã hoặc tạo phòng mới.`);
      } else {
        setError("");
        setCode("");
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi tìm phòng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E8E4F3] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Vào Phòng Bạn Bè</h3>
              <p className="text-xs text-purple-200 font-medium">Nhập mã phòng do bạn bè chia sẻ để học chung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Feature Hint */}
        <div className="bg-[#FAF8FF] border-b border-[#E8E4F3] px-5 py-3 flex items-center gap-2.5 text-xs text-[#7C3AED]">
          <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span className="font-semibold">
            Hỗ trợ mã phòng <strong>Voice học (VH-xxxx)</strong> và <strong>Thi đấu (PK-xxxx)</strong>
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#17133B] uppercase tracking-wider">
                Mã phòng thi đấu / Voice
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] hover:underline transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>{pasteNotice ? "Đã dán!" : "Dán mã"}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="VD: VH-4821 hoặc PK-1024"
                className="w-full text-center font-mono font-black text-xl tracking-widest px-4 py-3.5 bg-[#F8F7FC] border-2 border-[#E8E4F3] rounded-2xl focus:outline-none focus:border-[#7C3AED] focus:bg-white uppercase transition-all shadow-inner placeholder:text-slate-300 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:font-medium"
              />
              {code && (
                <button
                  type="button"
                  onClick={() => setCode("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick sample codes for testing */}
          <div className="pt-1">
            <p className="text-[11px] text-[#77738F] font-medium mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Gợi ý mã phòng thử nghiệm:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["VH-1024", "VH-2048", "PK-3096"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCode(sample);
                    setError("");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#EDE9FE]/70 hover:bg-[#EDE9FE] text-[#7C3AED] text-xs font-mono font-bold transition-all border border-[#7C3AED]/20 active:scale-95"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#77738F] hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm phòng...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Vào phòng ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
