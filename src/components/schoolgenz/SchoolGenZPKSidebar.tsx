"use client";

import React, { useState } from "react";
import {
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  LineChart,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  PKLeaderboardEntry,
  PKStudyRecommendation,
  PKSubject,
  PKSubjectProgress,
  PKUserStats,
} from "@/core/domain/pk.types";

interface SchoolGenZPKSidebarProps {
  userStats: PKUserStats;
  leaderboard: PKLeaderboardEntry[];
  progress: PKSubjectProgress[];
  recommendations: PKStudyRecommendation[];
  subjects?: PKSubject[];
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string) => void;
  onSelectRecommendation?: (rec: PKStudyRecommendation) => void;
}

export function SchoolGenZPKSidebar({
  userStats,
  leaderboard,
  progress,
  recommendations,
  subjects = [],
  selectedSubjectId = "all",
  onSelectSubject,
  onSelectRecommendation,
}: SchoolGenZPKSidebarProps) {
  // Tab to switch between "Môn cần học" (Default) and "Bảng xếp hạng"
  const [topTab, setTopTab] = useState<"subjects" | "leaderboard">("subjects");

  return (
    <aside className="space-y-3.5">
      {/* ======================================================== */}
      {/* 1. NƠI LỰA CHỌN CÁC MÔN CẦN HỌC (THAY THẾ XẾP HẠNG PK)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-3">
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full">
            <button
              onClick={() => setTopTab("subjects")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                topTab === "subjects"
                  ? "bg-[#296ef2] text-white shadow-sm"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Môn cần học</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  topTab === "subjects"
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {subjects.length}
              </span>
            </button>

            <button
              onClick={() => setTopTab("leaderboard")}
              className={`py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                topTab === "leaderboard"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-amber-600"
              }`}
              title="Xem Bảng xếp hạng tuần"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>BXH</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: NƠI LỰA CHỌN CÁC MÔN CẦN HỌC (ACTIVE CHÍNH) */}
        {topTab === "subjects" && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
              <span>Bấm chọn môn để lọc phòng & luyện đề:</span>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5 no-scrollbar">
              {subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubject?.(sub.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-black transition-all border text-left ${
                      isSelected
                        ? "bg-[#296ef2] text-white border-blue-600 shadow-md shadow-blue-200 scale-[1.01]"
                        : "bg-slate-50/70 hover:bg-blue-50 text-slate-800 border-slate-100 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-1">
                      <span className="text-base shrink-0">{sub.icon}</span>
                      <span className="truncate">{sub.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-white text-blue-700 border border-blue-100"
                        }`}
                      >
                        {sub.activeRoomsCount} phòng
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: BẢNG XẾP HẠNG TUẦN (KHI CHUYỂN TAB) */}
        {topTab === "leaderboard" && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            {leaderboard.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded-2xl transition-colors ${
                  item.rank === 1
                    ? "bg-amber-50/70 border border-amber-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      item.rank === 1
                        ? "bg-amber-400 text-slate-900 shadow-sm"
                        : item.rank === 2
                        ? "bg-slate-300 text-slate-800"
                        : item.rank === 3
                        ? "bg-amber-600 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item.rank}
                  </span>

                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                    {item.avatar}
                  </div>

                  <div className="leading-tight">
                    <div className="text-xs font-black text-slate-900 truncate max-w-[95px]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[95px]">
                      {item.university}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#296ef2]">
                    {item.rating}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. THÀNH TÍCH CỦA BẠN (User Stats)                       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Thành tích của bạn
            </h4>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {userStats.tier}
          </span>
        </div>

        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#296ef2] via-[#2563eb] to-[#1e40af] text-white space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 border-2 border-white flex items-center justify-center font-black text-xs shadow-sm">
                ĐL
              </div>
              <div>
                <div className="text-xs font-black">{userStats.name}</div>
                <div className="text-[10px] text-blue-100 font-medium">Lớp 5 • Lv 1 • Gà con</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-blue-200">Điểm Rating</div>
              <div className="text-lg font-black leading-none">{userStats.rating}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 grid grid-cols-3 gap-1 text-center text-xs">
            <div>
              <div className="text-[10px] text-blue-200">Số trận</div>
              <div className="font-bold">{userStats.totalMatches}</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-200">Tỷ lệ thắng</div>
              <div className="font-bold">{userStats.winRate}%</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-200 flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Chuỗi</span>
              </div>
              <div className="font-bold text-amber-300">{userStats.currentStreak} trận</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TIẾN ĐỘ HỌC TẬP QUA PK (Learning Progress)            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <LineChart className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Tiến độ học qua PK
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Độ làm chủ</span>
        </div>

        <div className="space-y-2.5">
          {progress.map((item) => (
            <div key={item.subjectId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 truncate max-w-[170px]">
                  {item.subjectName}
                </span>
                <span className="font-black text-[#296ef2]">{item.masteredPercentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#296ef2] rounded-full transition-all duration-300"
                  style={{ width: `${item.masteredPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{item.matchesPlayed} trận đấu</span>
                <span>Chính xác: {item.accuracyRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
