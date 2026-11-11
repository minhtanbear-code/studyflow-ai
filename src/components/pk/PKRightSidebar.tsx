"use client";

import React from "react";
import {
  Award,
  ChevronRight,
  Flame,
  LineChart,
  ShieldAlert,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import {
  PKLeaderboardEntry,
  PKStudyRecommendation,
  PKSubjectProgress,
  PKUserStats,
} from "@/core/domain/pk.types";

interface PKRightSidebarProps {
  userStats: PKUserStats;
  leaderboard: PKLeaderboardEntry[];
  progress: PKSubjectProgress[];
  recommendations?: PKStudyRecommendation[];
  onSelectRecommendation?: (rec: PKStudyRecommendation) => void;
}

export function PKRightSidebar({
  userStats,
  leaderboard,
  progress,
}: PKRightSidebarProps) {
  return (
    <aside className="w-80 shrink-0 bg-[#F8F7FC] border-l border-[#E8E4F3] p-4 space-y-4 overflow-y-auto no-scrollbar">
      {/* ======================================================== */}
      {/* 1. XẾP HẠNG PK (Leaderboard)                             */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl p-4 border border-[#E8E4F3] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#17133B] uppercase tracking-wider">
              Xếp hạng PK tuần
            </h3>
          </div>
          <span className="text-[10px] text-[#77738F] font-semibold">Top 5</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                item.rank === 1
                  ? "bg-[#EDE9FE]/50 border border-[#EDE9FE]"
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
                      : "text-[#77738F]"
                  }`}
                >
                  {item.rank}
                </span>

                <div className="w-7 h-7 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-[10px] font-bold">
                  {item.avatar}
                </div>

                <div className="leading-tight">
                  <div className="text-xs font-bold text-[#17133B] truncate max-w-[105px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#77738F] truncate max-w-[105px]">
                    {item.university}
                  </div>
                </div>
              </div>

              <div className="text-right leading-none">
                <div className="text-xs font-extrabold text-[#7C3AED]">{item.rating}</div>
                <div className="text-[10px] text-[#77738F] font-medium mt-0.5">
                  {item.winRate}% W
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. THÀNH TÍCH CỦA BẠN (User Stats)                       */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl p-4 border border-[#E8E4F3] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#17133B] uppercase tracking-wider">
              Thành tích của bạn
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
            {userStats.tier}
          </span>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white">
                {userStats.avatar}
              </div>
              <div>
                <div className="text-xs font-black">{userStats.name}</div>
                <div className="text-[10px] text-purple-200">MSSV: {userStats.studentId}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-200">Điểm Rating</div>
              <div className="text-lg font-black">{userStats.rating}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 grid grid-cols-3 gap-1 text-center text-xs">
            <div>
              <div className="text-[10px] text-purple-200">Số trận</div>
              <div className="font-bold">{userStats.totalMatches}</div>
            </div>
            <div>
              <div className="text-[10px] text-purple-200">Tỷ lệ thắng</div>
              <div className="font-bold">{userStats.winRate}%</div>
            </div>
            <div>
              <div className="text-[10px] text-purple-200 flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Chuỗi</span>
              </div>
              <div className="font-bold text-amber-300">{userStats.currentStreak} trận</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. TIẾN ĐỘ HỌC TẬP QUA PK (Learning Progress)            */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl p-4 border border-[#E8E4F3] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold">
              <LineChart className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-[#17133B] uppercase tracking-wider">
              Tiến độ học tập qua PK
            </h3>
          </div>
          <span className="text-[10px] text-[#77738F] font-semibold">Độ làm chủ</span>
        </div>

        <div className="space-y-2.5">
          {progress.map((item) => (
            <div key={item.subjectId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17133B] truncate max-w-[180px]">
                  {item.subjectName}
                </span>
                <span className="font-extrabold text-[#7C3AED]">{item.masteredPercentage}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                  style={{ width: `${item.masteredPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#77738F]">
                <span>{item.matchesPlayed} trận đấu</span>
                <span>Chính xác: {item.accuracyRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
