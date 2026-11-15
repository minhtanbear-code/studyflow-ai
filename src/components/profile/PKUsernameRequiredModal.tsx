"use client";

import React, { useState } from "react";
import { User, Check, AlertCircle, Sparkles, X } from "lucide-react";
import { createClient } from "@/core/supabase/client";

interface PKUsernameRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export function PKUsernameRequiredModal({
  isOpen,
  onClose,
  onSuccess,
}: PKUsernameRequiredModalProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = username.trim().toLowerCase();
    if (clean.length < 3) {
      setErrorMessage("Username cần tối thiểu 3 ký tự.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setErrorMessage("Username chỉ được chứa chữ cái, số và dấu gạch dưới (_).");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // 1. Kiểm tra tính duy nhất của Username
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUser) {
        setErrorMessage(`Username "@${clean}" đã có người sử dụng. Vui lòng chọn tên khác.`);
        setLoading(false);
        return;
      }

      // 2. Cập nhật hồ sơ
      const { error } = await supabase
        .from("profiles")
        .update({
          username: clean,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setErrorMessage(error.message);
      } else {
        onSuccess(clean);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi khi lưu username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#7C3AED]/30 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>YÊU CẦU ĐỊNH DANH SINH VIÊN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#17133B]">
            Thiết lập Username của bạn
          </h3>
          <p className="text-xs text-[#77738F] font-medium leading-relaxed">
            Để tìm kiếm bạn học, gửi lời mời và thi đấu Voice 1v1, hệ thống cần một Username duy nhất để bạn bè dễ dàng nhận diện bạn.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17133B] mb-1.5">
              Username cá nhân (Duy nhất trong hệ thống):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="minhtan_ueh"
                className="w-full pl-8 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
              />
            </div>
            <p className="text-[10px] text-[#77738F] mt-1 pl-1">
              Chỉ dùng chữ cái thường, số và dấu gạch dưới (VD: minhtan_ueh, thuha2005)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Để sau
            </button>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Đang lưu..." : "Xác nhận Username"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
