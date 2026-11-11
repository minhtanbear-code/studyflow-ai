"use client";

import React, { useState } from "react";
import { Lock, Plus, Sparkles, Swords, Unlock, Users, X } from "lucide-react";
import { PKMode, PKRoom, PKSubject, PKTeamSize } from "@/core/domain/pk.types";

interface PKCreateRoomModalProps {
  isOpen: boolean;
  subjects: PKSubject[];
  onClose: () => void;
  onCreateRoom: (room: PKRoom) => void;
}

export function PKCreateRoomModal({
  isOpen,
  subjects,
  onClose,
  onCreateRoom,
}: PKCreateRoomModalProps) {
  const [title, setTitle] = useState("Ôn thi Giải tích K68 - Quyết tâm điểm A");
  const [subjectId, setSubjectId] = useState(subjects[1]?.id || "math101");
  const [mode, setMode] = useState<PKMode>("solo");
  const [teamSize, setTeamSize] = useState<PKTeamSize>("1v1");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [questionsCount, setQuestionsCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSub = subjects.find((s) => s.id === subjectId) || subjects[1];
    const maxPlayers = teamSize === "1v1" ? 2 : teamSize === "2v2" ? 4 : 6;
    const randomCode = `PK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRoom: PKRoom = {
      id: `r_${Date.now()}`,
      roomCode: randomCode,
      title: title.trim(),
      subjectId: selectedSub.id,
      subjectName: selectedSub.name,
      mode,
      teamSize,
      currentPlayers: 1,
      maxPlayers,
      isPrivate,
      status: "waiting",
      hostName: "Nguyễn Văn Tuấn (Bạn)",
      durationMinutes,
      questionsCount,
      createdAt: "Vừa xong",
    };

    onCreateRoom(newRoom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E4F3] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#7C3AED] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Swords className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div>
              <h3 className="text-sm font-black">Tạo Phòng Đấu Trí PK</h3>
              <p className="text-[11px] text-purple-200">
                Thiết lập luật thi đấu & mời bạn bè tham gia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mock Notice Banner */}
        <div className="bg-[#EDE9FE]/70 border-b border-[#E8E4F3] px-4 py-2 text-[11px] text-[#7C3AED] font-bold flex items-center justify-between">
          <span>⚡ Chế độ Mock Interaction: Phòng tạo sẽ xuất hiện ngay trong danh sách!</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#7C3AED] text-white">
            Phase 1 UI
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Room Name */}
          <div className="space-y-1">
            <label className="font-bold text-[#17133B] block">Tên phòng thi đấu *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn tập Tích phân chuỗi số..."
              className="w-full text-xs font-semibold px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-1">
            <label className="font-bold text-[#17133B] block">Môn học thi đấu</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-colors"
            >
              {subjects
                .filter((s) => s.id !== "all")
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.name} ({sub.code})
                  </option>
                ))}
            </select>
          </div>

          {/* Mode & Team Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17133B] block">Hình thức thi đấu</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode("solo");
                    setTeamSize("1v1");
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "solo"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#77738F] hover:text-[#17133B]"
                  }`}
                >
                  Solo 1v1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("team");
                    setTeamSize("2v2");
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "team"
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-[#77738F] hover:text-[#17133B]"
                  }`}
                >
                  Đồng đội Team
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17133B] block">Quy mô trận đấu</label>
              {mode === "solo" ? (
                <div className="p-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl text-center font-bold text-[#7C3AED]">
                  Solo 1 vs 1 (2 người)
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTeamSize("2v2")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teamSize === "2v2"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-[#77738F] hover:text-[#17133B]"
                    }`}
                  >
                    2 vs 2 (4 người)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamSize("3v3")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      teamSize === "3v3"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-[#77738F] hover:text-[#17133B]"
                    }`}
                  >
                    3 vs 3 (6 người)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#17133B] block">Số lượng câu hỏi</label>
              <select
                value={questionsCount}
                onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl focus:outline-none focus:border-[#7C3AED]"
              >
                <option value={5}>5 câu (Đấu nhanh 5 phút)</option>
                <option value={10}>10 câu (Chuẩn thi 10 phút)</option>
                <option value={15}>15 câu (Chuyên sâu 15 phút)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17133B] block">Chế độ phòng</label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isPrivate
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-[#F8F7FC] border-[#E8E4F3] text-[#77738F] hover:bg-slate-100"
                }`}
              >
                {isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isPrivate ? "Phòng Riêng tư (Có mã)" : "Phòng Công khai"}</span>
              </button>
            </div>
          </div>

          {isPrivate && (
            <div className="space-y-1">
              <label className="font-bold text-[#17133B] block">Mật khẩu phòng (4 số)</label>
              <input
                type="password"
                maxLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (VD: 1234)"
                className="w-full text-xs font-semibold px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77738F] hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm shadow-purple-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo phòng ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
