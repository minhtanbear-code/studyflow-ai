"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  LogOut,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/core/supabase/client";

interface UserProfileData {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  university: string;
  major: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    id: "",
    email: "",
    username: "",
    full_name: "",
    avatar_url: "",
    university: "",
    major: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/profile");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          id: user.id,
          email: user.email || "",
          username: data.username || "",
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          university: data.university || "",
          major: data.major || "",
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          id: user.id,
          email: user.email || "",
        }));
      }
      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanUsername = profile.username.trim().toLowerCase();
    if (cleanUsername) {
      if (cleanUsername.length < 3) {
        setMessage({ type: "error", text: "Username phải có ít nhất 3 ký tự." });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        setMessage({ type: "error", text: "Username chỉ được gồm chữ cái, số và dấu gạch dưới (_)." });
        return;
      }

      // Check unique
      const { data: dup } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", profile.id)
        .maybeSingle();

      if (dup) {
        setMessage({ type: "error", text: `Username "@${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.` });
        return;
      }
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: cleanUsername || null,
          full_name: profile.full_name.trim(),
          university: profile.university.trim(),
          major: profile.major.trim(),
          profile_completed: Boolean(cleanUsername && profile.full_name),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Đã cập nhật hồ sơ cá nhân thành công!" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Đã xảy ra lỗi khi lưu." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FC] text-xs font-bold text-[#7C3AED]">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] bg-white text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E8E4F3] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-[#F0EDF9] pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-purple-600/20">
              {profile.full_name
                ? profile.full_name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase()
                : "SV"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#17133B]">
                  {profile.full_name || "Sinh viên StudyFlow"}
                </h1>
                {profile.username && (
                  <span className="text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md">
                    @{profile.username}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#77738F] mt-0.5">{profile.email}</p>
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
                message.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                  Họ và tên hiển thị:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="VD: Nguyễn Văn Tân"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                  Username định danh (Duy nhất):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s+/g, "") })
                    }
                    placeholder="minhtan_ueh"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                  Trường Đại học (Tùy chọn):
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    placeholder="VD: UEH, NEU, FTU, Bách Khoa..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17133B] mb-1.5">
                  Chuyên ngành học (Tùy chọn):
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.major}
                    onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                    placeholder="VD: Kinh tế đối ngoại, Kế toán..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#77738F] mb-1.5">
                Email tài khoản (Không thể thay đổi):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  disabled
                  value={profile.email}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? "Đang lưu thay đổi..." : "Lưu thông tin hồ sơ"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
