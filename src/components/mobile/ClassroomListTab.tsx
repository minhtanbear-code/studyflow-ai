"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  KeyRound,
  Layers,
  LogIn,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { ClassroomRoom, RoomType } from "@/core/domain/classroom.types";
import { StudentProfile } from "@/core/domain/academic.types";

interface ClassroomListTabProps {
  rooms: ClassroomRoom[];
  currentUser: StudentProfile;
  onSelectRoom: (room: ClassroomRoom) => void;
  onCreateRoom: (newRoom: ClassroomRoom) => void;
  onJoinByCode: (code: string) => boolean;
}

export function ClassroomListTab({
  rooms,
  currentUser,
  onSelectRoom,
  onCreateRoom,
  onJoinByCode,
}: ClassroomListTabProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");

  // Create Room Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("MATH101");
  const [newCourseName, setNewCourseName] = useState("Giải tích 1");
  const [newRoomType, setNewRoomType] = useState<RoomType>("peer_tutoring");
  const [newRole, setNewRole] = useState<"Giảng viên" | "Trợ giảng Mentor" | "Nhóm trưởng">("Nhóm trưởng");
  const [newDescription, setNewDescription] = useState("");

  const handleJoinSubmit = () => {
    if (!joinCodeInput.trim()) return;
    const success = onJoinByCode(joinCodeInput.trim().toUpperCase());
    if (!success) {
      setJoinError("Không tìm thấy mã phòng này. Vui lòng kiểm tra lại!");
    } else {
      setShowJoinModal(false);
      setJoinCodeInput("");
      setJoinError("");
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = newCourseCode.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "ROOM";
    const generatedCode = `${prefix}-${randomSuffix}`;

    const createdRoom: ClassroomRoom = {
      id: `room_${Date.now()}`,
      code: generatedCode,
      title: newTitle.trim(),
      courseCode: newCourseCode.trim().toUpperCase(),
      courseName: newCourseName.trim(),
      hostName: currentUser.name,
      hostRole: newRole,
      roomType: newRoomType,
      description: newDescription.trim() || "Phòng học tập chung kết nối sinh viên.",
      totalMembers: 1,
      onlineCount: 1,
      isPrivate: false,
      attendanceChecked: false,
      pomodoroMinutesLeft: 25,
      isPomodoroRunning: false,
      createdAt: "Vừa xong",
      activeMembers: [
        {
          id: currentUser.id,
          name: currentUser.name,
          role: "host",
          status: "focusing",
          goal: "Chủ trì phòng học",
          joinedAt: "Vừa xong",
          isCurrentUser: true,
        },
      ],
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: "StudyFlow Hệ Thống",
          senderId: "system",
          text: `🎉 Phòng học "${newTitle}" đã được tạo thành công! Chia sẻ mã phòng [${generatedCode}] để mời bạn bè tham gia nhé!`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          isAi: true,
        },
      ],
      resources: [],
    };

    onCreateRoom(createdRoom);
    setShowCreateModal(false);
    onSelectRoom(createdRoom);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFilter = filterType === "all" || r.roomType === filterType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20">
              Không gian Học tập Cộng đồng
            </span>
            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang trực tuyến</span>
            </span>
          </div>

          <h3 className="text-base font-black mt-1 leading-snug">
            Phòng Lớp Học & Tự Học Chung Số
          </h3>

          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Tham gia phòng trợ giảng, ôn thi cấp tốc cùng bạn học hoặc mở phòng Pomodoro tự học tập trung để tích lũy chỉ số tương tác số.
          </p>

          {/* Action Buttons inside Banner */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-indigo-950 py-2 px-3 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tạo phòng mới</span>
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-700/80 text-white py-2 px-3 rounded-xl text-xs font-bold border border-indigo-400/40 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Nhập mã phòng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo môn (MATH101, Giải tích, Pomodoro...)"
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterType === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Tất cả ({rooms.length})
          </button>
          <button
            onClick={() => setFilterType("peer_tutoring")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterType === "peer_tutoring"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Trợ giảng Mentor
          </button>
          <button
            onClick={() => setFilterType("pomodoro")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterType === "pomodoro"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pomodoro tự học
          </button>
          <button
            onClick={() => setFilterType("lecture")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterType === "lecture"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Lớp Giảng viên
          </button>
        </div>
      </div>

      {/* Classroom List */}
      <div className="space-y-3">
        {filteredRooms.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">Chưa tìm thấy phòng học phù hợp</div>
            <p className="text-[11px] text-slate-500">
              Hãy bấm <strong>"Tạo phòng mới"</strong> để mở phòng học đầu tiên cho nhóm của bạn!
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-300 transition-all space-y-2.5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                      {room.courseCode}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Mã: {room.code}
                    </span>
                    {room.roomType === "peer_tutoring" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Kèm cặp 1-1
                      </span>
                    )}
                    {room.roomType === "pomodoro" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Pomodoro 25p
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                    {room.title}
                  </h4>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{room.activeMembers.length} bạn</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {room.description}
              </p>

              {/* Host & Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Chủ phòng: <strong className="text-slate-700">{room.hostName}</strong>
                </div>

                <button
                  onClick={() => onSelectRoom(room)}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                >
                  <span>Tham gia</span>
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: TẠO PHÒNG LỚP HỌC MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3.5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900">Tạo Phòng Lớp Học Mới</h4>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tên phòng lớp học *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Lớp Ôn tập Giải tích 1 - Nhóm K68"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Mã môn học</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="VD: MATH101"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Tên môn học</label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="VD: Giải tích 1"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Hình thức phòng</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="peer_tutoring">Trợ giảng Mentor</option>
                    <option value="pomodoro">Pomodoro tự học</option>
                    <option value="exam_prep">Ôn thi cấp tốc</option>
                    <option value="lecture">Lớp Giảng viên</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Vai trò của bạn</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Nhóm trưởng">Nhóm trưởng</option>
                    <option value="Trợ giảng Mentor">Trợ giảng Mentor</option>
                    <option value="Giảng viên">Giảng viên</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mô tả / Mục tiêu học tập
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả nội dung bài học, deadline bài tập..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                >
                  Tạo phòng & Tham gia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THAM GIA BẰNG MÃ PHÒNG */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3.5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900">Tham Gia Bằng Mã Phòng</h4>
              </div>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Nhập mã phòng 6 ký tự do bạn học hoặc Giảng viên chia sẻ (Ví dụ: <strong>MATH-88</strong>, <strong>CODE-99</strong>).
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value.toUpperCase());
                  setJoinError("");
                }}
                placeholder="VD: MATH-88"
                className="w-full text-center font-mono font-black text-base tracking-widest px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 uppercase"
              />

              {joinError && (
                <div className="text-[11px] text-rose-600 font-semibold text-center">
                  {joinError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError("");
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleJoinSubmit}
                disabled={!joinCodeInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all disabled:opacity-40"
              >
                Vào phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
