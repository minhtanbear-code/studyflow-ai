"use client";

import React, { useState, useMemo } from "react";
import {
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  History,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Swords,
  Trophy,
  Unlock,
  User,
  Users,
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
import { PKRoomCard } from "./PKRoomCard";

interface PKCentralAreaProps {
  rooms: PKRoom[];
  subjects: PKSubject[];
  history: PKHistoryEntry[];
  myRooms: PKRoom[];
  onOpenCreateModal: () => void;
  onOpenJoinCodeModal: () => void;
  onJoinRoom: (room: PKRoom) => void;
  onStartBotPractice?: (difficulty: BotDifficulty, subjectName: string) => void;
}

export function PKCentralArea({
  rooms,
  subjects,
  history,
  myRooms,
  onOpenCreateModal,
  onOpenJoinCodeModal,
  onJoinRoom,
  onStartBotPractice,
}: PKCentralAreaProps) {
  // Mode filter: Solo vs Team
  const [selectedMode, setSelectedMode] = useState<PKMode | "all">("all");
  const [soloSubOption, setSoloSubOption] = useState<SoloSubOption>("pvp");
  const [selectedBotDifficulty, setSelectedBotDifficulty] = useState<BotDifficulty>("adaptive");

  // Subject filter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  // Search keyword
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Status filter: All, Waiting, In Progress
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Tab: Public, My Rooms, History
  const [activeTab, setActiveTab] = useState<PKTabType>("public");

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Filter by Mode (Solo / Team)
      if (selectedMode !== "all" && r.mode !== selectedMode) return false;

      // Filter by Subject
      if (selectedSubjectId !== "all" && r.subjectId !== selectedSubjectId) return false;

      // Filter by Status
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // Filter by Keyword (search in roomCode, title, subjectName, hostName)
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

  return (
    <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
      {/* ======================================================== */}
      {/* 1. TIÊU ĐỀ PK – ĐẤU TRÍ HỌC TẬP                           */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E8E4F3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#17133B] tracking-tight">
              PK – Đấu trí học tập
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
              Desktop Arena
            </span>
          </div>
          <p className="text-xs text-[#77738F] mt-1">
            Thi đấu trắc nghiệm kiến thức học phần theo thời gian thực, ôn luyện hiệu quả qua cạnh tranh lành mạnh.
          </p>
        </div>

        {/* 3 & 4: NÚT TẠO PHÒNG & NÚT NHẬP MÃ PHÒNG (Action Buttons) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 4. Nút Nhập mã phòng */}
          <button
            onClick={onOpenJoinCodeModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] border border-purple-200 shadow-sm active:scale-95 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Nhập mã phòng</span>
          </button>

          {/* 3. Nút Tạo phòng */}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md shadow-purple-200 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phòng</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HAI CHẾ ĐỘ SOLO VÀ TEAM (TÍCH HỢP PRACTICE BATTLE)    */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl p-2 border border-[#E8E4F3] shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#77738F] px-2">Chế độ thi đấu:</span>

            {/* All Modes */}
            <button
              onClick={() => setSelectedMode("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "all"
                  ? "bg-[#17133B] text-white shadow-sm"
                  : "text-[#77738F] hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>

            {/* Solo Mode (1 vs 1) */}
            <button
              onClick={() => setSelectedMode("solo")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedMode === "solo"
                  ? "bg-[#7C3AED] text-white shadow-sm shadow-purple-200"
                  : "bg-[#F8F7FC] text-[#17133B] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Solo 1 vs 1</span>
            </button>

            {/* Team Mode (2 vs 2, 3 vs 3) */}
            <button
              onClick={() => setSelectedMode("team")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedMode === "team"
                  ? "bg-[#7C3AED] text-white shadow-sm shadow-purple-200"
                  : "bg-[#F8F7FC] text-[#17133B] hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Đồng đội Team (2v2 / 3v3)</span>
            </button>
          </div>

          <div className="text-[11px] text-[#77738F] px-2 font-medium">
            Đang có <strong>{rooms.length} phòng</strong> hoạt động
          </div>
        </div>

        {/* Solo Sub-Option (Option 1 vs Option 2) */}
        {selectedMode === "solo" && (
          <div className="bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E4F3]">
              <span className="text-xs font-bold text-[#17133B]">
                Lựa chọn hình thức Solo 1 vs 1:
              </span>

              <div className="flex items-center bg-white p-1 rounded-xl border border-[#E8E4F3]">
                <button
                  onClick={() => setSoloSubOption("pvp")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    soloSubOption === "pvp"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#77738F] hover:text-[#17133B]"
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Option 1: Solo với người chơi</span>
                </button>

                <button
                  onClick={() => setSoloSubOption("bot_practice")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    soloSubOption === "bot_practice"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#77738F] hover:text-[#7C3AED]"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Option 2: Luyện tập với Bot (Practice Battle)</span>
                </button>
              </div>
            </div>

            {/* Option 2: Practice Battle Card */}
            {soloSubOption === "bot_practice" && (
              <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#17133B]">
                      🤖 Luyện tập 1 vs Bot (Practice Battle)
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                      Tự luyện an toàn
                    </span>
                  </div>
                  <span className="text-[10px] text-[#77738F]">
                    [Mô phỏng Phase 1: Hành vi trả lời theo thời gian]
                  </span>
                </div>

                {/* BOT DIFFICULTY */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#77738F]">
                    Cấp độ Bot (Bot Difficulty):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "easy", title: "Easy", desc: "Dành cho người mới • 5-7s/câu" },
                      { id: "medium", title: "Medium", desc: "Độ khó trung bình • 3.5-5s/câu" },
                      { id: "hard", title: "Hard", desc: "Thử thách cao • 2-3.5s/câu" },
                      { id: "adaptive", title: "Adaptive Difficulty", desc: "Thích ứng theo tốc độ & tỷ lệ đúng" },
                    ].map((bot) => (
                      <div
                        key={bot.id}
                        onClick={() => setSelectedBotDifficulty(bot.id as BotDifficulty)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedBotDifficulty === bot.id
                            ? "border-[#7C3AED] bg-[#EDE9FE]/50 text-[#7C3AED] font-bold"
                            : "border-[#E8E4F3] hover:border-purple-300 text-[#17133B]"
                        }`}
                      >
                        <div className="font-black">{bot.title}</div>
                        <div className="text-[10px] text-[#77738F] mt-0.5">{bot.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRACTICE REWARD RULES */}
                <div className="p-2.5 rounded-xl bg-[#F8F7FC] border border-[#E8E4F3] text-[11px] space-y-1">
                  <div className="font-bold text-[#17133B] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Quy tắc phần thưởng Practice Battle (Bắt buộc):</span>
                  </div>
                  <div className="text-[#77738F] grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px]">
                    <div>• Không nhận XP (0 XP)</div>
                    <div>• Rating ±0 (Không đổi)</div>
                    <div>• Không ảnh hưởng BXH</div>
                    <div>• Không tính thắng PvP</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (onStartBotPractice) {
                        onStartBotPractice(selectedBotDifficulty, "Môn học chung");
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Bắt đầu Luyện tập ({selectedBotDifficulty.toUpperCase()})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7 & 8: TABS & BỘ LỌC TÌM KIẾM                             */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {/* 8. Các tab: Phòng công khai, Phòng của tôi, Lịch sử PK */}
        <div className="flex items-center justify-between border-b border-[#E8E4F3] pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("public")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "public"
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-[#77738F] hover:text-[#17133B] hover:bg-slate-100"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Phòng công khai ({rooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("my_rooms")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "my_rooms"
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-[#77738F] hover:text-[#17133B] hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phòng của tôi ({myRooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-[#77738F] hover:text-[#17133B] hover:bg-slate-100"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử PK ({history.length})</span>
            </button>
          </div>
        </div>

        {/* 7. Bộ lọc và tìm kiếm phòng */}
        {activeTab !== "history" && (
          <div className="bg-white rounded-2xl p-3 border border-[#E8E4F3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#77738F] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm mã phòng, tên phòng, host..."
                className="w-full text-xs bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl pl-9 pr-3 py-2 text-[#17133B] placeholder-[#77738F] focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-[#77738F] font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Trạng thái:</span>
              </span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl px-3 py-1.5 text-[#17133B] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="waiting">Đang chờ đối thủ</option>
                <option value="in_progress">Đang thi đấu</option>
              </select>

              {(searchKeyword || statusFilter !== "all" || selectedSubjectId !== "all" || selectedMode !== "all") && (
                <button
                  onClick={() => {
                    setSearchKeyword("");
                    setStatusFilter("all");
                    setSelectedSubjectId("all");
                    setSelectedMode("all");
                  }}
                  className="text-[11px] font-bold text-[#7C3AED] hover:underline px-2"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. KHU VỰC DANH SÁCH PHÒNG CÔNG KHAI                       */}
      {/* ======================================================== */}
      {activeTab === "public" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#77738F]">
            <span>
              Hiển thị <strong>{filteredRooms.length}</strong> phòng công khai
            </span>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E8E4F3] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#17133B]">Không tìm thấy phòng phù hợp</h4>
                <p className="text-xs text-[#77738F] mt-0.5">
                  Hãy thử đổi bộ lọc hoặc bấm nút <strong>"Tạo phòng"</strong> để mở trận đấu mới!
                </p>
              </div>
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo phòng ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <PKRoomCard key={room.id} room={room} onJoin={onJoinRoom} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PHÒNG CỦA TÔI */}
      {activeTab === "my_rooms" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#77738F]">
            <span>Phòng do bạn tạo hoặc tham gia gần đây ({myRooms.length})</span>
          </div>

          {myRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E8E4F3] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto text-xl">
                🏠
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#17133B]">Bạn chưa tạo phòng thi đấu nào</h4>
                <p className="text-xs text-[#77738F] mt-0.5">
                  Bấm nút <strong>"Tạo phòng"</strong> ở góc trên để tạo phòng Solo 1v1 hoặc Team 2v2/3v3!
                </p>
              </div>
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo phòng đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <PKRoomCard key={room.id} room={room} onJoin={onJoinRoom} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LỊCH SỬ PK */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#E8E4F3] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-black text-[#17133B] uppercase tracking-wider">
                Lịch sử các trận đấu PK gần đây
              </h4>
              <span className="text-[10px] text-[#77738F]">Dữ liệu giả lập (Mock History)</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 flex items-center justify-between hover:bg-[#F8F7FC] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        h.result === "win"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {h.result === "win" ? "W" : "L"}
                    </span>

                    <div>
                      <div className="font-bold text-[#17133B] flex items-center gap-2">
                        <span>{h.subjectName}</span>
                        <span className="text-[10px] font-mono px-1.5 rounded bg-slate-100 text-[#77738F]">
                          {h.roomCode}
                        </span>
                        <span className="text-[10px] text-[#7C3AED] font-semibold">
                          ({h.teamSize})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#77738F] mt-0.5">
                        {h.opponentOrTeam} • {h.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-[#17133B]">{h.score}</div>
                    <div
                      className={`text-[11px] font-extrabold ${
                        h.ratingDelta > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {h.ratingDelta > 0 ? `+${h.ratingDelta}` : h.ratingDelta} Rating
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
