"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Bot,
  Compass,
  GraduationCap,
  Home,
  LineChart,
  Sparkles,
  Swords,
  User,
  Users,
} from "lucide-react";

interface PKLeftSidebarProps {
  activeNav?: string;
  onNavigate?: (id: string) => void;
}

export function PKLeftSidebar({ activeNav = "pk", onNavigate }: PKLeftSidebarProps) {
  const navItems = [
    { id: "home", label: "Trang chủ", icon: Home, href: "/" },
    { id: "study", label: "Học tập", icon: BookOpen, href: "/" },
    { id: "pk", label: "PK – Đấu trí", icon: Swords, href: "/pk", isActive: true, badge: "Live" },
    { id: "assistant", label: "Trợ lý AI", icon: Bot, href: "/assistant" },
    { id: "progress", label: "Tiến độ học tập", icon: LineChart, href: "/progress" },
    { id: "community", label: "Cộng đồng", icon: Users, href: "/" },
    { id: "notifications", label: "Thông báo", icon: Bell, href: "/", badgeCount: 3 },
    { id: "profile", label: "Cá nhân", icon: User, href: "/" },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E8E4F3] flex flex-col justify-between p-4 h-full">
      <div className="space-y-6">
        {/* Logo STUDYFLOW AI */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1 group">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#EDE9FE]" />
          </div>
          <div>
            <div className="flex items-baseline leading-none">
              <span className="text-base font-black tracking-tight text-[#17133B]">STUDYFLOW</span>
              <span className="text-base font-extrabold text-[#7C3AED] ml-1">AI</span>
            </div>
            <span className="text-[10px] text-[#77738F] font-medium tracking-wide">
              Đấu trí & Học tập Sinh viên
            </span>
          </div>
        </Link>

        {/* Navigation Items List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = item.id === activeNav || item.isActive;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isCurrent
                    ? "bg-[#7C3AED] text-white shadow-sm shadow-purple-200"
                    : "text-[#77738F] hover:bg-[#EDE9FE]/60 hover:text-[#7C3AED]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-[#77738F]"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : "bg-[#EDE9FE] text-[#7C3AED]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.badgeCount && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isCurrent
                        ? "bg-white text-[#7C3AED]"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box in Sidebar */}
      <div className="bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl p-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#17133B]">
          <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
          <span>Study Tips PK 1.0</span>
        </div>
        <p className="text-[11px] text-[#77738F] leading-snug">
          Môi trường thi đấu học thuật lành mạnh cho sinh viên.
        </p>
      </div>
    </aside>
  );
}
