"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, RotateCw, ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/core/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "email của bạn";

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleResend = async () => {
    if (!email || email === "email của bạn") return;
    setResending(true);
    setErrorMsg(null);
    setResendSuccess(false);

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể gửi lại email xác minh.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-3xl border border-[#E8E4F3] shadow-xl shadow-purple-900/5 text-center space-y-6 animate-in zoom-in-95 duration-200">
          {/* Animated Mail Icon */}
          <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] mx-auto flex items-center justify-center shadow-lg shadow-purple-200/50">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#17133B]">
              Xác minh hộp thư Email
            </h1>
            <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed">
              Hệ thống đã gửi một liên kết xác nhận tới địa chỉ:
            </p>
            <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#EDE9FE] text-xs font-black text-[#7C3AED] break-all">
              {email}
            </div>
            <p className="text-xs text-[#77738F] leading-relaxed pt-1">
              Vui lòng mở hộp thư và nhấn vào liên kết xác nhận để kích hoạt tài khoản của bạn.
            </p>
          </div>

          {resendSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã gửi lại email xác minh thành công!</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 px-4 rounded-2xl border-2 border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] font-black text-xs text-[#17133B] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>{resending ? "Đang gửi..." : "Gửi lại email xác minh"}</span>
            </button>

            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-bold text-[#7C3AED]">Đang tải...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
