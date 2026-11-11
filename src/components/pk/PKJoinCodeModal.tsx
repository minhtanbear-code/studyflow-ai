"use client";

import React, { useState } from "react";
import { KeyRound, LogIn, Swords, X } from "lucide-react";

interface PKJoinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCode: (code: string) => boolean;
}

export function PKJoinCodeModal({ isOpen, onClose, onJoinCode }: PKJoinCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const success = onJoinCode(code.trim().toUpperCase());
    if (!success) {
      setError("Không tìm thấy mã phòng này trong danh sách mock! Hãy thử: PK-1024, PK-2048, PK-3096...");
    } else {
      setError("");
      setCode("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E8E4F3] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#7C3AED] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div>
              <h3 className="text-sm font-black">Nhập Mã Phòng PK</h3>
              <p className="text-[11px] text-purple-200">Gia nhập trận đấu của bạn bè</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mock Notice */}
        <div className="bg-[#EDE9FE]/70 border-b border-[#E8E4F3] px-4 py-2 text-[11px] text-[#7C3AED] font-bold">
          ⚡ Mock Interaction: Hỗ trợ mã phòng mẫu như PK-1024, PK-2048.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17133B] block">Mã phòng thi đấu</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="VD: PK-1024"
              className="w-full text-center font-mono font-black text-base tracking-widest px-3 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl focus:outline-none focus:border-[#7C3AED] focus:bg-white uppercase transition-colors"
            />
            {error && (
              <p className="text-[11px] text-rose-600 font-semibold leading-tight">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77738F] hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm shadow-purple-200 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Gia nhập</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
