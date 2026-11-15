"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Mail, Lock, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/core/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Form fields strictly: Email, Password, Confirm Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Vui lòng nhập định dạng email hợp lệ (VD: ten@sinhvien.edu.vn).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);

    try {
      const siteUrl = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          setErrorMessage("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      // Nếu Supabase yêu cầu xác minh email -> chuyển sang màn hình verify-email
      if (data.user && !data.session) {
        router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
      } else if (data.session) {
        // Vào thẳng trang đích được yêu cầu (hoặc Dashboard)
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi trong quá trình đăng ký.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Không thể khởi động đăng nhập Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black shadow-xs border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>CHIẾN LƯỢC ĐĂNG KÝ NHANH • 30 GIÂY</span>
        </div>
        <h1 className="text-3xl font-black text-[#17133B] tracking-tight">
          Tạo tài khoản mới
        </h1>
        <p className="text-xs sm:text-sm text-[#77738F] font-medium">
          Chỉ cần email và mật khẩu. Bạn có thể cập nhật hồ sơ, trường học và username sau bất cứ lúc nào!
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E8E4F3] shadow-xl shadow-purple-900/5 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google 1-Click Signup Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 rounded-2xl border-2 border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] font-black text-xs text-[#17133B] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Đang kết nối Google..." : "Đăng ký nhanh bằng tài khoản Google"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E4F3] w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-[#77738F] uppercase tracking-wider absolute">
              hoặc điền thông tin
            </span>
          </div>

          {/* Quick Registration Form */}
          <form onSubmit={handleQuickRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                Địa chỉ Email sinh viên
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

            <div>
              <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                Mật khẩu (Tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#77738F] leading-relaxed italic">
              ✨ Sau khi đăng ký, bạn có thể tự do đặt Username và trường học bất kỳ lúc nào tại trang cá nhân.
            </p>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Đang xử lý đăng ký..." : "Hoàn tất đăng ký ngay"}</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-2 text-center text-xs text-[#77738F] font-medium border-t border-[#F0EDF9]">
            <span>Đã có tài khoản? </span>
            <Link
              href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="font-black text-[#7C3AED] hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-bold text-[#7C3AED]">Đang tải...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
