"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Gamepad2,
  History,
  Info,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Unlock,
  User,
  Users,
  Zap,
} from "lucide-react";
import {
  BotDifficulty,
  PKHistoryEntry,
  PKMode,
  PKRoom,
  PKSubject,
  PKTabType,
  SoloSubOption,
} from "@/core/domain/pk.types";

interface SchoolGenZPKCentralProps {
  rooms: PKRoom[];
  subjects: PKSubject[];
  history: PKHistoryEntry[];
  myRooms: PKRoom[];
  selectedSubjectId?: string;
  onSelectSubject?: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenJoinCodeModal: () => void;
  onJoinRoom: (room: PKRoom) => void;
  onQuickBattle?: () => void;
  onStartBotPractice?: (difficulty: BotDifficulty, subjectName: string) => void;
}

export function SchoolGenZPKCentral({
  rooms,
  subjects,
  history,
  myRooms,
  selectedSubjectId: propSelectedSubjectId,
  onSelectSubject,
  onOpenCreateModal,
  onOpenJoinCodeModal,
  onJoinRoom,
  onQuickBattle,
  onStartBotPractice,
}: SchoolGenZPKCentralProps) {
  // Modes & Sub-options
  const [selectedMode, setSelectedMode] = useState<PKMode | "all">("all");
  const [soloSubOption, setSoloSubOption] = useState<SoloSubOption>("pvp");
  const [selectedBotDifficulty, setSelectedBotDifficulty] = useState<BotDifficulty>("adaptive");

  // Filter states
  const [internalSubjectId, setInternalSubjectId] = useState<string>("all");
  const selectedSubjectId = propSelectedSubjectId ?? internalSubjectId;
  const setSelectedSubjectId = (id: string) => {
    setInternalSubjectId(id);
    onSelectSubject?.(id);
  };
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<PKTabType>("public");

  // Selected subject name
  const currentSubject = useMemo(() => {
    if (selectedSubjectId === "all") return "Tất cả môn (Tổng hợp)";
    return subjects.find((s) => s.id === selectedSubjectId)?.name || "Môn học chung";
  }, [selectedSubjectId, subjects]);

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (selectedMode !== "all" && r.mode !== selectedMode) return false;
      if (selectedSubjectId !== "all" && r.subjectId !== selectedSubjectId) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchCode = r.roomCode.toLowerCase().includes(query);
        const matchSubject = r.subjectName.toLowerCase().includes(query);
        const matchHost = r.hostName.toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchSubject && !matchHost) return false;
      }
      return true;
    });
  }, [rooms, selectedMode, selectedSubjectId, statusFilter, searchKeyword]);

  const botDifficultyCards: {
    id: BotDifficulty;
    title: string;
    badge: string;
    desc: string;
    delay: string;
    color: string;
  }[] = [
    {
      id: "easy",
      title: "Easy",
      badge: "Người mới",
      desc: "Bot có tốc độ làm bài chậm, tỷ lệ đúng cơ bản. Thích hợp làm quen bộ đề.",
      delay: "5 - 7 giây/câu",
      color: "border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 text-emerald-800",
    },
    {
      id: "medium",
      title: "Medium",
      badge: "Trung bình",
      desc: "Độ khó tiêu chuẩn, phản xạ tương đương sinh viên khá. Thử thách kiến thức vững.",
      delay: "3.5 - 5 giây/câu",
      color: "border-amber-300 hover:border-amber-500 bg-amber-50/50 text-amber-800",
    },
    {
      id: "hard",
      title: "Hard",
      badge: "Thử thách cao",
      desc: "Bot phản xạ chớp nhoáng, tỷ lệ chính xác cao. Dành cho người muốn luyện đỉnh cao.",
      delay: "2 - 3.5 giây/câu",
      color: "border-rose-300 hover:border-rose-500 bg-rose-50/50 text-rose-800",
    },
    {
      id: "adaptive",
      title: "Adaptive Difficulty",
      badge: "Thích ứng thông minh",
      desc: "Tự điều chỉnh theo: Tỷ lệ đúng, Thời gian phản hồi, Chủ đề và Diễn biến bài làm.",
      delay: "Linh hoạt theo tốc độ của bạn",
      color: "border-purple-300 hover:border-purple-500 bg-purple-50/60 text-purple-900 shadow-sm",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ======================================================== */}
      {/* 1. HERO BANNER PK – ĐẤU TRÍ HỌC TẬP                      */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-8 w-32 h-32 bg-amber-300/10 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-[11px] uppercase tracking-wider border border-white/20">
              <Swords className="w-3.5 h-3.5 text-amber-300" />
              <span>ĐẤU TRƯỜNG TRI THỨC</span>
            </span>
            <span className="text-[11px] font-bold text-blue-200">
              {filteredRooms.length} phòng đang online
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            PK – Đấu trí học tập
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            Thi đấu trắc nghiệm kiến thức học phần theo thời gian thực. Hỗ trợ Solo 1 vs 1 kịch tính và lập đội Team 2 vs 2, 3 vs 3 phối hợp đồng đội.
          </p>
        </div>

        {/* 3 & 4. ACTION BUTTONS: TẠO PHÒNG & NHẬP MÃ */}
        <div className="flex items-center gap-2.5 shrink-0 z-10 flex-wrap">
          <button
            onClick={onOpenJoinCodeModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm active:scale-95 transition-all"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Nhập mã phòng</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-[#ff5252] hover:bg-[#e04545] text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phòng</span>
          </button>

          {onQuickBattle && (
            <button
              onClick={onQuickBattle}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md active:scale-95 transition-all"
            >
              <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>Ghép nhanh</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HAI CHẾ ĐỘ SOLO VÀ TEAM (TÍCH HỢP PRACTICE BATTLE)    */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {/* Main Mode Toggle Bar */}
        <div className="bg-white rounded-2xl p-3 border-2 border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Chế độ:</span>

            <button
              onClick={() => setSelectedMode("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "all"
                  ? "bg-[#296ef2] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>

            <button
              onClick={() => setSelectedMode("solo")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "solo"
                  ? "bg-[#296ef2] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Solo 1 vs 1</span>
            </button>

            <button
              onClick={() => setSelectedMode("team")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "team"
                  ? "bg-[#296ef2] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team 2v2 / 3v3</span>
            </button>
          </div>

          {/* Trạng thái phòng (chỉ hiện khi xem phòng PvP) */}
          {(! (selectedMode === "solo" && soloSubOption === "bot_practice")) && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Trạng thái:</span>
              {[
                { id: "all", label: "Tất cả" },
                { id: "waiting", label: "Đang chờ" },
                { id: "in_progress", label: "Đang đấu" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === st.id
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SUB-OPTIONS TRONG KHU VỰC SOLO (OPTION 1 VS OPTION 2)    */}
        {/* ======================================================== */}
        {selectedMode === "solo" && (
          <div className="bg-slate-50 border-2 border-blue-100 rounded-3xl p-4 space-y-4 animate-in fade-in duration-200">
            {/* Solo Sub-Option Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Khu vực Solo 1 vs 1:</span>
                </span>
              </div>

              {/* Toggle Pills between Option 1 (PvP) & Option 2 (Bot Practice) */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-blue-200 shadow-sm">
                <button
                  onClick={() => setSoloSubOption("pvp")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    soloSubOption === "pvp"
                      ? "bg-[#296ef2] text-white shadow-sm"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Option 1: Solo với người chơi</span>
                </button>

                <button
                  onClick={() => setSoloSubOption("bot_practice")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    soloSubOption === "bot_practice"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-purple-600"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Option 2: Luyện tập với Bot</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-extrabold ml-0.5">
                    Mới
                  </span>
                </button>
              </div>
            </div>

            {/* OPTION 1 DETAILS: SOLO VỚI NGƯỜI CHƠI */}
            {soloSubOption === "pvp" && (
              <div className="bg-white rounded-2xl p-3.5 border border-blue-100 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <strong className="text-slate-900 block font-black">
                    ⚔️ Thi đấu 1 vs 1 với Sinh viên / Học sinh
                  </strong>
                  <p className="text-slate-500">
                    Tìm kiếm đối thủ trực tuyến hoặc chọn phòng đấu phù hợp bên dưới. Kết quả trận đấu được ghi nhận vào lịch sử và tính điểm Rating / XP.
                  </p>
                </div>
                <button
                  onClick={onQuickBattle}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 shadow-sm active:scale-95"
                >
                  Tìm đối thủ 1v1
                </button>
              </div>
            )}

            {/* OPTION 2 DETAILS: LUYỆN TẬP VỚI BOT (PRACTICE BATTLE) */}
            {soloSubOption === "bot_practice" && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-purple-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span>Luyện tập với Bot (Practice Battle)</span>
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        1 vs Bot • Tự luyện tập
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Thi đấu 1 vs Bot thông minh không cần chờ người khác. Bot tạo cảm giác thi đấu thực tế với hành vi trả lời theo thời gian.
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 font-medium">
                    [Phase 1: Mô phỏng hành vi thời gian thực]
                  </span>
                </div>

                {/* BOT DIFFICULTY SELECTOR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Cấp độ Bot (Bot Difficulty):</span>
                    </span>
                    <span className="text-[11px] text-purple-600 font-bold">
                      Đang chọn: {selectedBotDifficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {botDifficultyCards.map((bot) => {
                      const isChosen = selectedBotDifficulty === bot.id;
                      return (
                        <div
                          key={bot.id}
                          onClick={() => setSelectedBotDifficulty(bot.id)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                            isChosen
                              ? "border-purple-600 bg-purple-50 shadow-md scale-[1.02]"
                              : "border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">{bot.title}</span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                                  isChosen
                                    ? "bg-purple-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {bot.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{bot.desc}</p>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{bot.delay}</span>
                            </span>
                            {isChosen && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Adaptive Bot Explanatory Note */}
                  {selectedBotDifficulty === "adaptive" && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span>Cơ chế Adaptive Difficulty:</span>
                      </div>
                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        Adaptive Bot theo dõi tốc độ phản hồi, tỷ lệ trả lời đúng và chủ đề bạn đang làm để điều chỉnh độ khó tương ứng (nếu bạn làm nhanh và đúng liên tiếp, Bot sẽ tăng tốc và chuẩn xác hơn; ngược lại nếu gặp câu khó, Bot sẽ nới lỏng thời gian để bạn suy nghĩ).
                      </p>
                    </div>
                  )}
                </div>

                {/* PRACTICE BATTLE REWARD RULES (BẮT BUỘC) */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Quy tắc phần thưởng Practice Battle (Bắt buộc):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Tự luyện an toàn</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400">XP nhận được</div>
                      <div className="font-black text-rose-600">0 XP</div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400">Rating biến động</div>
                      <div className="font-black text-rose-600">±0 Rating</div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400">BXH tổng & môn</div>
                      <div className="font-black text-slate-600">Không ảnh hưởng</div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-400">Thành tích PvP</div>
                      <div className="font-black text-slate-600">Không tính thắng</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    ✓ Kết quả luyện tập được lưu vào Lịch sử Luyện tập • Có đầy đủ báo cáo kết quả và gợi ý ôn tập chuyên sâu sau mỗi trận.
                  </p>
                </div>

                {/* CTA Launch Practice */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Môn thi đấu: <strong className="text-blue-700">{currentSubject}</strong>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartBotPractice) {
                        onStartBotPractice(selectedBotDifficulty, currentSubject);
                      } else if (onQuickBattle) {
                        onQuickBattle();
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-200 active:scale-95 transition-all"
                  >
                    <Bot className="w-4 h-4 text-yellow-300" />
                    <span>Bắt đầu Luyện tập với Bot ({selectedBotDifficulty.toUpperCase()})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7 & 8. TABS & TÌM KIẾM PHÒNG (GIỮ NGUYÊN THỨ TỰ)         */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* 8. TABS (Phòng công khai, Phòng của tôi, Lịch sử PK) */}
        <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-100 shadow-sm">
          <button
            onClick={() => setActiveTab("public")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "public"
                ? "bg-[#296ef2] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Phòng công khai</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "public" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("my_rooms")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "my_rooms"
                ? "bg-[#296ef2] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Phòng của tôi</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "my_rooms" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {myRooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-[#296ef2] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử PK & Luyện Bot</span>
          </button>
        </div>

        {/* 7. Ô TÌM KIẾM PHÒNG */}
        {activeTab === "public" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, mã phòng..."
              className="w-full text-xs bg-white text-slate-800 placeholder-slate-400 rounded-2xl pl-9 pr-3 py-2 border-2 border-slate-100 shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. KHU VỰC DANH SÁCH PHÒNG CÔNG KHAI                     */}
      {/* ======================================================== */}
      {activeTab === "public" && (
        <div className="space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center text-xl font-bold">
                🔍
              </div>
              <h4 className="text-sm font-black text-slate-900">Không tìm thấy phòng phù hợp</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy thử chọn môn học khác, đổi bộ lọc Solo/Team hoặc tự tạo phòng thi đấu mới để mời bạn bè tham gia!
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={onOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#296ef2] text-white shadow-md active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo phòng ngay</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedMode("solo");
                    setSoloSubOption("bot_practice");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-purple-600 text-white shadow-md active:scale-95"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Luyện tập với Bot</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl p-4 border-2 border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#296ef2] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {room.roomCode}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            room.mode === "solo"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {room.mode === "solo" ? "Solo 1v1" : `Team ${room.teamSize}`}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          room.status === "waiting"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            room.status === "waiting"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-400"
                          }`}
                        />
                        <span>{room.status === "waiting" ? "Đang chờ" : "Đang thi đấu"}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {room.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                        📖 {room.subjectName}
                      </span>
                      <span>Chủ phòng: <strong className="text-slate-800">{room.hostName}</strong></span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.durationMinutes} phút • {room.questionsCount} câu</span>
                      </span>

                      <span className="font-black text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {room.currentPlayers}/{room.maxPlayers} người
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onJoinRoom(room)}
                    disabled={room.status !== "waiting"}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      room.status === "waiting"
                        ? "bg-[#296ef2] hover:bg-[#1f5cd1] text-white shadow-blue-200"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{room.status === "waiting" ? "Tham chiến ngay" : "Phòng đang đấu"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PHÒNG CỦA TÔI */}
      {activeTab === "my_rooms" && (
        <div className="space-y-3">
          {myRooms.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-xl font-bold">
                🏠
              </div>
              <h4 className="text-sm font-black text-slate-900">Bạn chưa tạo phòng thi đấu nào</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy tạo ngay một phòng học tập để cùng các bạn trong lớp hoặc nhóm học tập thử thách kiến thức!
              </p>
              <button
                onClick={onOpenCreateModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-[#ff5252] text-white shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo phòng của bạn</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {myRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl p-4 border-2 border-amber-200 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {room.roomCode}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Phòng của bạn
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{room.title}</h4>
                    <div className="text-xs text-slate-500">Môn: {room.subjectName}</div>
                  </div>

                  <button
                    onClick={() => onJoinRoom(room)}
                    className="w-full py-2.5 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Mở phòng đấu</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LỊCH SỬ PK & LUYỆN BOT */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Lịch sử các trận đấu & Luyện tập
            </h4>
            <span className="text-[11px] text-slate-400">Phân định rõ PvP và Luyện Bot</span>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      h.isBotPractice
                        ? "bg-purple-100 text-purple-700"
                        : h.result === "win"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {h.isBotPractice ? "🤖" : h.result === "win" ? "W" : "L"}
                  </div>

                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>{h.subjectName}</span>
                      {h.isBotPractice ? (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                          Luyện Bot {h.botDifficulty ? `(${h.botDifficulty.toUpperCase()})` : ""}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                          {h.mode === "solo" ? "Solo 1v1" : `Team ${h.teamSize}`}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Đối thủ: <strong className="text-slate-700">{h.opponentOrTeam}</strong> • {h.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-slate-900">
                    {h.score}
                  </div>
                  {h.isBotPractice ? (
                    <div className="text-[10px] font-bold text-slate-400">
                      ±0 Rating (0 XP)
                    </div>
                  ) : (
                    <div
                      className={`text-[10px] font-bold ${
                        h.ratingDelta > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {h.ratingDelta > 0 ? `+${h.ratingDelta}` : h.ratingDelta} Rating
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
