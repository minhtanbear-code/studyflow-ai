"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  Flame,
  GraduationCap,
  Heart,
  MessageSquare,
  Play,
  Pause,
  Plus,
  Send,
  Share2,
  Sparkles,
  User,
  UserCheck,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { ClassroomRoom, ClassroomMember, ClassroomMessage } from "@/core/domain/classroom.types";
import { StudentProfile } from "@/core/domain/academic.types";

interface ClassroomDetailViewProps {
  room: ClassroomRoom;
  currentUser: StudentProfile;
  onBack: () => void;
  onUpdateRoom: (updatedRoom: ClassroomRoom) => void;
  onAttendanceChecked: () => void;
}

export function ClassroomDetailView({
  room,
  currentUser,
  onBack,
  onUpdateRoom,
  onAttendanceChecked,
}: ClassroomDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "resources">("chat");
  const [inputText, setInputText] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [userGoal, setUserGoal] = useState("Hoàn thành bài tập tuần này");
  const [isGoalEditing, setIsGoalEditing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(room.pomodoroMinutesLeft * 60);
  const [isTimerActive, setIsTimerActive] = useState(room.isPomodoroRunning);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ClassroomMessage = {
      id: `msg_${Date.now()}`,
      sender: currentUser.name,
      senderId: currentUser.id,
      text: inputText,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...room.messages, newMsg];
    const updatedRoom = { ...room, messages: updatedMessages };
    onUpdateRoom(updatedRoom);
    setInputText("");

    // Simulate smart peer bot response if asking a question
    if (inputText.includes("?") || inputText.toLowerCase().includes("hỏi") || inputText.toLowerCase().includes("giúp")) {
      setTimeout(() => {
        const botReply: ClassroomMessage = {
          id: `bot_${Date.now()}`,
          sender: "StudyFlow Mentor Bot",
          senderId: "bot",
          text: `Câu hỏi hay đấy ${currentUser.name}! Mentor và các bạn trong phòng đang xem xét. Bạn nhớ kiểm tra thêm tài liệu ở tab "Tài liệu" nhé!`,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          isAi: true,
        };
        onUpdateRoom({ ...updatedRoom, messages: [...updatedMessages, botReply] });
      }, 1200);
    }
  };

  const handleCheckAttendance = () => {
    if (room.attendanceChecked) return;
    const updatedRoom: ClassroomRoom = {
      ...room,
      attendanceChecked: true,
    };
    onUpdateRoom(updatedRoom);
    onAttendanceChecked();
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Room Header */}
      <div className="bg-white border-b border-slate-100 p-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Rời phòng</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Copy Room Code Button */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Sao chép mã phòng để mời bạn bè"
            >
              <Copy className="w-3 h-3" />
              <span>{room.code}</span>
              {copiedCode && <span className="text-[10px] text-emerald-600 font-sans font-bold">✓ Đã chép</span>}
            </button>

            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{room.activeMembers.length} online</span>
            </span>
          </div>
        </div>

        {/* Room Title & Host */}
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
              {room.courseCode}
            </span>
            <span className="text-xs text-slate-500 font-medium truncate">
              Chủ phòng: {room.hostName} ({room.hostRole})
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mt-0.5 truncate">{room.title}</h3>
        </div>

        {/* Top Feature Bar: Attendance + Pomodoro Timer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Attendance Button */}
          <button
            onClick={handleCheckAttendance}
            disabled={room.attendanceChecked}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              room.attendanceChecked
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{room.attendanceChecked ? "✓ Đã điểm danh LMS" : "Điểm danh vào lớp (+5%)"}</span>
          </button>

          {/* Pomodoro Timer Mini Bar */}
          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-black text-amber-300">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className="p-0.5 hover:text-indigo-300 transition-colors ml-1"
            >
              {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Chat, Members, Resources */}
      <div className="flex items-center border-b border-slate-200 bg-white px-3">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "chat"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Thảo luận ({room.messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "members"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Bạn học ({room.activeMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "resources"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Tài liệu ({room.resources.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {/* TAB 1: LIVE CHAT */}
        {activeTab === "chat" && (
          <div className="space-y-3">
            {room.messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${
                  m.senderId === currentUser.id ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    m.isAi
                      ? "bg-violet-600 text-white shadow-sm"
                      : m.isMentor
                      ? "bg-amber-500 text-white shadow-sm"
                      : m.senderId === currentUser.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {m.isAi ? "AI" : m.sender.charAt(0)}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-2.5 text-xs leading-relaxed shadow-sm ${
                    m.senderId === currentUser.id
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : m.isAi
                      ? "bg-violet-50 text-violet-950 border border-violet-200 rounded-tl-none"
                      : m.isMentor
                      ? "bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={`font-bold text-[10px] ${
                        m.senderId === currentUser.id ? "text-indigo-200" : "text-slate-500"
                      }`}
                    >
                      {m.sender}
                    </span>
                    <span
                      className={`text-[9px] ${
                        m.senderId === currentUser.id ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                  <div>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: ACTIVE MEMBERS & GOALS */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {/* User's Goal Card */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mục tiêu của bạn trong buổi học:</span>
                </span>
                <button
                  onClick={() => setIsGoalEditing(!isGoalEditing)}
                  className="text-[11px] font-bold text-indigo-700 underline"
                >
                  {isGoalEditing ? "Lưu" : "Sửa"}
                </button>
              </div>

              {isGoalEditing ? (
                <input
                  type="text"
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-indigo-300 bg-white focus:outline-none"
                  placeholder="Nhập mục tiêu học hôm nay..."
                />
              ) : (
                <div className="text-xs font-semibold text-indigo-900 bg-white/80 p-2 rounded-xl border border-indigo-100">
                  🎯 {userGoal}
                </div>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 px-1">
                Thành viên cùng phòng ({room.activeMembers.length})
              </div>
              {room.activeMembers.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {mem.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{mem.name}</span>
                        {mem.role === "mentor" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Trợ giảng
                          </span>
                        )}
                        {mem.role === "host" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[190px]">
                        🎯 {mem.goal || "Đang tập trung học"}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mem.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : mem.status === "asking"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {mem.status === "completed"
                      ? "Đã xong"
                      : mem.status === "asking"
                      ? "Đang hỏi"
                      : "Tập trung"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SHARED RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">Đề cương & Tài liệu môn</span>
              <span className="text-[11px] text-slate-400">{room.resources.length} tệp</span>
            </div>

            {room.resources.map((res) => (
              <div
                key={res.id}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {res.title}
                    </h5>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {res.size} • Chia sẻ bởi {res.author}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Đang tải: ${res.title}`)}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Message Input (Only visible in chat tab) */}
      {activeTab === "chat" && (
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Hỏi bài tập, gửi tin nhắn tới cả lớp..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
