"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  User,
  Users,
  Mic,
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  FileText,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { GeneratedQuestionWithSource } from "@/core/domain/documentLearning.types";

export type GameplayModeId = "solo" | "ai_bot" | "pvp_1v1" | "team_pk" | "voice_study";

interface PKGameplaySelectionScreenProps {
  subject: PKSubject;
  questions: GeneratedQuestionWithSource[];
  sourceFileName: string;
  onSelectMode: (modeId: GameplayModeId) => void;
  onBackToReview: () => void;
}

export function PKGameplaySelectionScreen({
  subject,
  questions,
  sourceFileName,
  onSelectMode,
  onBackToReview,
}: PKGameplaySelectionScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameplayModeId>("solo");

  const modes: {
    id: GameplayModeId;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    badge: string;
    badgeStyle: string;
    colorScheme: string;
    gamificationTag: string;
    features: string[];
  }[] = [
    {
      id: "solo",
      title: "Ôn tập cá nhân",
      subtitle: "Solo Self-Practice",
      description: "Tự rèn luyện theo tốc độ của bạn, xem giải thích và nguồn trích dẫn sau mỗi câu trả lời.",
      icon: User,
      badge: "Luyện tập tự do",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      colorScheme: "hover:border-emerald-400 group-hover:text-emerald-600",
      gamificationTag: "+XP • Không ảnh hưởng Rating",
      features: [
        "Không giới hạn thời gian trả lời",
        "Xem ngay giải thích & đoạn trích từ tài liệu",
        "Tích lũy XP thăng cấp kiến thức",
      ],
    },
    {
      id: "ai_bot",
      title: "Đấu với AI",
      subtitle: "AI Bot Battle",
      description: "Thử thách phản xạ và độ chính xác trước bot AI thông minh mô phỏng đối thủ thực.",
      icon: Bot,
      badge: "Đấu trí cùng AI",
      badgeStyle: "bg-purple-50 text-[#7C3AED] border-purple-200",
      colorScheme: "hover:border-[#7C3AED] group-hover:text-[#7C3AED]",
      gamificationTag: "+XP • Không ảnh hưởng Rating",
      features: [
        "AI trả lời theo độ khó tự thích ứng",
        "Có tính giờ đếm ngược từng câu",
        "Phân tích điểm mạnh & điểm yếu sau trận",
      ],
    },
    {
      id: "pvp_1v1",
      title: "PK 1vs1 (Xếp hạng)",
      subtitle: "Competitive 1v1",
      description: "Thách đấu trực tiếp 1vs1 với bạn bè hoặc sinh viên cùng môn trên bảng xếp hạng toàn quốc.",
      icon: Flame,
      badge: "Thi đấu Ranked",
      badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
      colorScheme: "hover:border-rose-400 group-hover:text-rose-600",
      gamificationTag: "Rating Ranked + / - • Tích lũy XP",
      features: [
        "Đấu trí thời gian thực cùng đối thủ",
        "Cộng / Trừ điểm bậc xếp hạng (Rating)",
        "Vinh danh trên Bảng xếp hạng mùa giải",
      ],
    },
    {
      id: "team_pk",
      title: "Đấu nhóm (Team PK)",
      subtitle: "Team 2v2 / 3v3",
      description: "Lập đội cùng bạn bè, phối hợp trả lời để giành chiến thắng trước nhóm đối thủ khác.",
      icon: Users,
      badge: "Đồng đội 2v2 / 3v3",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
      colorScheme: "hover:border-blue-400 group-hover:text-blue-600",
      gamificationTag: "Team Rating + / - • Tích lũy XP",
      features: [
        "Chung sức trả lời câu hỏi tài liệu",
        "Cơ chế tính điểm tổng hợp nhóm",
        "Bảng vàng vinh danh câu lạc bộ / khoa",
      ],
    },
    {
      id: "voice_study",
      title: "Voice học (1vs1 / Room)",
      subtitle: "Voice Interactive Study",
      description: "Bật Microphone đàm thoại trực tiếp qua WebRTC, vừa trao đổi vừa giải bộ câu hỏi tài liệu.",
      icon: Mic,
      badge: "Realtime Voice Room",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
      colorScheme: "hover:border-indigo-400 group-hover:text-indigo-600",
      gamificationTag: "+XP Tương tác • Kết nối bạn bè",
      features: [
        "Đàm thoại âm thanh hai chiều không độ trễ",
        "Cùng xem và phản hồi câu hỏi đồng thời",
        "Mã phòng chia sẻ cho bạn bè dễ dàng",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: BREADCRUMB & METRICS                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToReview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Xem lại câu hỏi</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#17133B]">Chọn chế độ học tập</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black">
                {questions.length} câu đã sẵn sàng
              </span>
            </div>
            <p className="text-[11px] text-[#77738F] font-medium hidden sm:block">
              Môn: <strong>{subject.name}</strong> • Tài liệu: <strong>{sourceFileName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#77738F]">
          <span className="hidden md:inline">Gamification Engine:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
            XP & Rating chuẩn
          </span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION: TITLE & PHILOSOPHY                       */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAMEPLAY SELECTION • SỬ DỤNG BỘ CÂU HỎI VỪA TẠO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#17133B] tracking-tight">
            Bạn muốn học như thế nào?
          </h1>
          <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed">
            Chọn một trong 5 hình thức dưới đây để bắt đầu biến tài liệu của bạn thành buổi thi đấu hấp dẫn và hiệu quả.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 3. 5 GAMEPLAY MODE CARDS GRID                             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`group bg-white rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-5 relative ${
                  isSelected
                    ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xl shadow-purple-100 -translate-y-1"
                    : "border-[#E8E4F3] hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${m.badgeStyle}`}>
                      {m.badge}
                    </span>
                  </div>

                  {/* TITLE & DESCRIPTION */}
                  <div>
                    <h3 className="text-base font-black text-[#17133B]">{m.title}</h3>
                    <span className="text-[10px] font-bold text-[#77738F] block uppercase tracking-wider mt-0.5">
                      {m.subtitle}
                    </span>
                    <p className="text-xs text-[#77738F] font-medium leading-relaxed mt-2">
                      {m.description}
                    </p>
                  </div>

                  {/* FEATURES LIST */}
                  <ul className="space-y-1.5 pt-2 border-t border-[#F0EDF9]">
                    {m.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-[11px] font-medium text-slate-600 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CARD FOOTER */}
                <div className="space-y-3 pt-2">
                  <div className="p-2 rounded-xl bg-[#FAF8FF] border border-[#EDE9FE] text-[10px] font-bold text-[#7C3AED] text-center">
                    {m.gamificationTag}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMode(m.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7C3AED] text-white shadow-md shadow-purple-200"
                        : "bg-slate-100 hover:bg-[#EDE9FE] text-slate-700 hover:text-[#7C3AED]"
                    }`}
                  >
                    <span>Vào phòng học ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* NOTICE: RATING POLICY */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Quy tắc công bằng Gamification (XP ≠ Rating):</span>
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Chế độ <strong>Ôn tập cá nhân, Đấu với AI và Voice học</strong> luôn tích lũy đầy đủ <strong>XP kinh nghiệm</strong> nhưng không làm thay đổi điểm xếp hạng thi đấu (<strong>Rating</strong>) nhằm đảm bảo tính minh bạch cho bảng vàng mùa giải.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
