"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { createClient } from "@/core/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E8E4F3] shadow-xl shadow-purple-900/5 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#17133B]">
              Khôi phục mật khẩu
            </h1>
            <p className="text-xs text-[#77738F] font-medium">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi một liên kết bảo mật để bạn thiết lập lại mật khẩu mới.
            </p>
          </div>

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-black text-emerald-900">Đã gửi email khôi phục!</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục Spam/Rác) và nhấn vào liên kết để đổi mật khẩu.
              </p>
              <Link
                href="/login"
                className="inline-block mt-2 text-xs font-bold text-[#7C3AED] hover:underline"
              >
                Quay lại Đăng nhập &rarr;
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                  Địa chỉ Email tài khoản
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@sinhvien.edu.vn"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Đang gửi liên kết..." : "Gửi liên kết đặt lại mật khẩu"}</span>
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-[#77738F] hover:text-[#7C3AED] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại trang Đăng nhập</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
