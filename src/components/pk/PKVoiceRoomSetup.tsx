"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Flame,
  Globe,
  Key,
  Mic,
  MicOff,
  Radio,
  Search,
  Share2,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { QuizConfigData } from "./PKQuizConfigurationScreen";
import { supabaseService } from "@/core/services/supabaseClient";

interface PKVoiceRoomSetupProps {
  subject: PKSubject;
  config?: QuizConfigData;
  onBack: () => void;
  onStartSession: (roomData: {
    roomName: string;
    roomCode: string;
    friendName: string;
    friendAvatar: string;
  }) => void;
}

export function PKVoiceRoomSetup({ subject, config, onBack, onStartSession }: PKVoiceRoomSetupProps) {
  // Setup steps: "config" | "waiting" | "friend_reviewing" | "ready"
  const [setupStep, setSetupStep] = useState<"config" | "waiting" | "friend_reviewing" | "ready">("config");

  // Readied status for both players before starting
  const [hostReady, setHostReady] = useState(true);
  const [friendReady, setFriendReady] = useState(true);
  const [friendDeclinedMsg, setFriendDeclinedMsg] = useState<string | null>(null);

  // Room metadata
  const [roomName, setRoomName] = useState(`Phòng Voice Ôn Thi: ${subject.name}`);
  const [roomCode] = useState(() => "VH-" + Math.floor(1000 + Math.random() * 9000));
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pk?room=${roomCode}`
    : `https://studyflow.ai/pk?room=${roomCode}`;

  // Copied toast
  const [copiedType, setCopiedType] = useState<"link" | "code" | null>(null);

  // Friend list modal & friends
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [invitedFriendId, setInvitedFriendId] = useState<string | null>(null);

  // Friend joining state
  const [joinedFriend, setJoinedFriend] = useState<{
    name: string;
    avatar: string;
    major: string;
  } | null>(null);

  const difficultyText = (d?: string) => {
    switch (d) {
      case "easy": return "Dễ";
      case "hard": return "Khó";
      case "mixed": return "Hỗn hợp";
      default: return "Trung bình";
    }
  };

  // Registered mock students for friend invitation
  const mockFriends = [
    { id: "f1", name: "Lê Hoàng Mai", avatar: "HM", major: "Kinh tế đối ngoại (K68)", online: true },
    { id: "f2", name: "Trần Bảo Ngọc", avatar: "BN", major: "Tài chính ngân hàng (K67)", online: true },
    { id: "f3", name: "Nguyễn Văn Tuấn", avatar: "VT", major: "Kinh tế quốc tế (K68)", online: true },
    { id: "f4", name: "Lê Thu Hà", avatar: "TH", major: "Kế toán kiểm toán (K68)", online: true },
    { id: "f5", name: "Phạm Hải Đăng", avatar: "HĐ", major: "Quản trị kinh doanh (K67)", online: false },
  ];

  const filteredFriends = mockFriends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.major.toLowerCase().includes(friendSearch.toLowerCase())
  );

  // Copy helper
  const handleCopy = (text: string, type: "link" | "code") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Creator proceeds to Waiting Room
  const handleCreateRoom = () => {
    setSetupStep("waiting");
    setFriendDeclinedMsg(null);

    // Lưu thông tin phòng thực tế lên Database Supabase để bạn bè nhập mã là tìm thấy ngay
    supabaseService.createPKRoom({
      room_code: roomCode,
      room_name: roomName,
      subject_id: subject.id,
      host_name: "Chủ phòng (Bạn)",
      question_count: config?.questionCount || 10,
      difficulty: config?.difficulty || "medium",
      include_images: config?.includeImages ?? true,
    });
  };

  // Simulate friend joining after invitation
  const handleInviteFriend = (friend: typeof mockFriends[0]) => {
    setInvitedFriendId(friend.id);
    setShowFriendModal(false);
    setFriendDeclinedMsg(null);
    setSetupStep("waiting");

    // Realistic join delay (1.8 seconds)
    setTimeout(() => {
      setJoinedFriend({
        name: friend.name,
        avatar: friend.avatar,
        major: friend.major,
      });
      // Proceed to review phase (Step 7: Invited friend reviews config)
      setSetupStep("friend_reviewing");
    }, 1800);
  };

  // Friend accepts quiz configuration
  const handleFriendAcceptConfig = () => {
    setFriendReady(true);
    setSetupStep("ready");
  };

  // Friend declines quiz configuration
  const handleFriendDeclineConfig = () => {
    setFriendDeclinedMsg(
      `${joinedFriend?.name || "Bạn của bạn"} chưa đồng ý với cấu hình này. Bạn có thể quay lại điều chỉnh số lượng hoặc độ khó để cùng học!`
    );
    setJoinedFriend(null);
    setInvitedFriendId(null);
    setSetupStep("config");
  };

  // Start the actual Voice Learning session
  const handleStartActiveSession = () => {
    if (!joinedFriend || !hostReady || !friendReady) return;
    onStartSession({
      roomName,
      roomCode,
      friendName: joinedFriend.name,
      friendAvatar: joinedFriend.avatar,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* TOP HEADER: BRAND & 3-STEP PROGRESS                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại thiết lập nội dung"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Quay lại thiết lập</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-[#17133B]">
                Tạo phòng Voice học (1 vs 1)
              </span>
              <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md hidden sm:inline">
                {subject.code}
              </span>
            </div>
            <span className="text-[11px] text-[#77738F] font-medium hidden md:block">
              Môn học: <strong>{subject.name}</strong>
            </span>
          </div>
        </div>

        {/* THREE-STEP PROGRESS INDICATOR */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
          {/* Step 1: Completed */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
            title="Bấm để chỉnh sửa cấu hình đề"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Bước 1: Thiết lập xong ({config?.questionCount || 10} câu)</span>
            <span className="sm:hidden">B1 xong</span>
          </button>

          <div className="w-3 h-0.5 bg-emerald-200 hidden sm:block" />

          {/* Step 2: Active */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span className="font-bold">Bước 2: Mời bạn tham gia</span>
          </div>

          <div className="w-3 h-0.5 bg-[#E8E4F3] hidden md:block" />

          {/* Step 3: Upcoming */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-bold border border-slate-200">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center">
              3
            </span>
            <span>Bắt đầu ôn tập</span>
          </div>
        </div>
      </header>

      {/* Copy notification toast */}
      {copiedType && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#17133B] text-white px-4 py-2 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {copiedType === "link" ? "Đã sao chép link mời phòng!" : "Đã sao chép mã phòng!"}
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTAINER                                            */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        {/* Rejection Notification if friend declined previously */}
        {friendDeclinedMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{friendDeclinedMsg}</span>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900 shrink-0"
            >
              Chỉnh sửa cấu hình &rarr;
            </button>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 1: ROOM CONFIGURATION & INVITATION SETUP          */}
        {/* ======================================================= */}
        {setupStep === "config" && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black mb-3">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>BƯỚC 2: MỜI BẠN THAM GIA PHÒNG HỌC</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#17133B]">
                Tạo phòng & Mời bạn học 1 vs 1
              </h1>
              <p className="text-xs sm:text-sm text-[#77738F] font-medium mt-1">
                Gửi mã hoặc link cho một người bạn. Khi bạn ấy chấp thuận cấu hình đề thi, cả hai sẽ cùng bắt đầu buổi học thoại.
              </p>
            </div>

            {/* Quiz Configuration Summary Card */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs font-black text-[#17133B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Bộ câu hỏi đã thiết lập:</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EDE9FE] text-xs font-bold text-[#7C3AED]">
                  {config?.questionCount || 10} câu
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EDE9FE] text-xs font-bold text-slate-700">
                  Độ khó: {difficultyText(config?.difficulty)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EDE9FE] text-xs font-bold text-slate-700">
                  {config?.includeImages !== false ? "Kèm hình ảnh" : "Chỉ văn bản"}
                </span>
              </div>

              <button
                onClick={onBack}
                className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
                title="Quay lại thay đổi số lượng, độ khó"
              >
                <span>Chỉnh sửa cấu hình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Room Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17133B]">Tên phòng học thoại:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F7FC] border border-[#E8E4F3] rounded-2xl text-xs sm:text-sm font-bold text-[#17133B] focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                placeholder="Nhập tên phòng học..."
              />
            </div>

            {/* Room ID & Code Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE]">
              <div>
                <span className="text-[11px] font-bold text-[#77738F] block">Môn học áp dụng:</span>
                <span className="text-sm font-black text-[#17133B] flex items-center gap-1.5 mt-0.5">
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#77738F] block">Mã mời tham gia (Room Code):</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black text-[#7C3AED] tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-[#EDE9FE]">
                    {roomCode}
                  </span>
                  <button
                    onClick={() => handleCopy(roomCode, "code")}
                    className="p-1 hover:text-[#7C3AED] transition-colors"
                    title="Sao chép mã"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Invitation Methods Cards */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-[#17133B] block">
                Chọn phương thức mời bạn cùng học:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Method 1: Share Link */}
                <div
                  onClick={() => handleCopy(inviteUrl, "link")}
                  className="p-3.5 rounded-2xl border border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#17133B]">1. Gửi Link mời</h4>
                  <p className="text-[11px] text-[#77738F]">Sao chép link gửi qua Zalo, Messenger, Telegram.</p>
                  <span className="text-[11px] font-bold text-[#7C3AED] block pt-1">
                    {copiedType === "link" ? "✓ Đã chép link" : "Sao chép link &rarr;"}
                  </span>
                </div>

                {/* Method 2: Room Code */}
                <div
                  onClick={() => handleCopy(roomCode, "code")}
                  className="p-3.5 rounded-2xl border border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Key className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#17133B]">2. Mã phòng</h4>
                  <p className="text-[11px] text-[#77738F]">Bạn bè chỉ cần nhập mã <strong>{roomCode}</strong> để vào.</p>
                  <span className="text-[11px] font-bold text-[#7C3AED] block pt-1">
                    {copiedType === "code" ? "✓ Đã chép mã" : "Sao chép mã &rarr;"}
                  </span>
                </div>

                {/* Method 3: Friend List */}
                <div
                  onClick={() => setShowFriendModal(true)}
                  className="p-3.5 rounded-2xl border border-[#7C3AED]/40 bg-[#FAF8FF] hover:border-[#7C3AED] hover:shadow-xs cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#7C3AED]">3. Danh bạ bạn học</h4>
                  <p className="text-[11px] text-[#77738F]">Mời trực tiếp sinh viên đang online trên hệ thống.</p>
                  <span className="text-[11px] font-bold text-[#7C3AED] block pt-1">
                    Chọn bạn bè &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E8E4F3]">
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#77738F] hover:text-[#17133B]"
              >
                &larr; Quay lại thiết lập
              </button>

              <button
                onClick={handleCreateRoom}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white font-black text-xs hover:bg-[#6D28D9] shadow-md shadow-purple-200 flex items-center gap-1.5 transition-all"
              >
                <span>Vào phòng chờ & Mời bạn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 2: WAITING ROOM (PLAYER 1 WAITING FOR PLAYER 2)   */}
        {/* ======================================================= */}
        {setupStep === "waiting" && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 text-center animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black mb-2 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>PHÒNG CHỜ • ĐANG CHỜ BẠN THAM GIA</span>
              </div>
              <h2 className="text-2xl font-black text-[#17133B]">{roomName}</h2>
              <p className="text-xs text-[#77738F] mt-1">
                Phòng Voice học yêu cầu đúng 2 sinh viên. Đang đợi bạn chấp nhận lời mời...
              </p>
            </div>

            {/* Quiz Configuration Preview in Waiting Room */}
            <div className="p-3 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-[#77738F]">
              <span>Môn: <strong className="text-[#17133B]">{subject.name}</strong></span>
              <span>•</span>
              <span>Số câu: <strong className="text-[#7C3AED]">{config?.questionCount || 10} câu</strong></span>
              <span>•</span>
              <span>Độ khó: <strong className="text-[#17133B]">{difficultyText(config?.difficulty)}</strong></span>
            </div>

            {/* TWO SLOTS: PLAYER 1 SEATED + EMPTY PLAYER 2 PLACEHOLDER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto py-2">
              {/* Slot 1: Player 1 (You) */}
              <div className="p-4 rounded-3xl border-2 border-[#7C3AED] bg-[#FAF8FF] space-y-2.5 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-lg mx-auto flex items-center justify-center shadow-xs">
                  ĐL
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#17133B]">Bạn (Đô La)</h4>
                  <span className="text-[11px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Chủ phòng • Sẵn sàng
                  </span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Microphone: Đã bật</span>
                </div>
              </div>

              {/* Slot 2: Empty Player 2 Placeholder */}
              <div className="p-4 rounded-3xl border-2 border-dashed border-[#E8E4F3] bg-[#F8F7FC] space-y-2.5 flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-400 font-black text-xl flex items-center justify-center animate-pulse">
                  +
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-600">Vị trí Player 2</h4>
                  <span className="text-[11px] font-medium text-[#77738F] block mt-0.5">
                    Đang chờ bạn tham gia...
                  </span>
                </div>
                <button
                  onClick={() => setShowFriendModal(true)}
                  className="px-3 py-1 rounded-xl bg-white text-[#7C3AED] font-bold text-[11px] border border-[#EDE9FE] hover:bg-[#EDE9FE]"
                >
                  Mời từ danh bạ
                </button>
              </div>
            </div>

            {/* Quick Share Code & Link Banner */}
            <div className="p-4 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] max-w-lg mx-auto space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#77738F]">Mã phòng (Gửi cho bạn bè):</span>
                <span className="font-black text-[#7C3AED] bg-white px-2 py-0.5 rounded-md border border-[#EDE9FE]">
                  {roomCode}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleCopy(inviteUrl, "link")}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8E4F3] hover:border-[#7C3AED] text-xs font-bold text-[#17133B] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Sao chép Link mời</span>
                </button>

                <button
                  onClick={() => handleCopy(roomCode, "code")}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8E4F3] hover:border-[#7C3AED] text-xs font-bold text-[#17133B] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Chia sẻ mã phòng</span>
                </button>
              </div>
            </div>

            {/* Simulated Friend Join Button for Instant Demo/Testing */}
            <div className="pt-2">
              <p className="text-[11px] text-[#77738F] mb-2">
                Để kiểm tra luồng xem lại cấu hình đề và xác nhận sẵn sàng:
              </p>
              <button
                onClick={() => {
                  setJoinedFriend({
                    name: "Lê Hoàng Mai",
                    avatar: "HM",
                    major: "Kinh tế đối ngoại (K68)",
                  });
                  setSetupStep("friend_reviewing");
                }}
                className="px-4 py-2 rounded-xl bg-purple-50 text-[#7C3AED] border border-[#EDE9FE] font-bold text-xs hover:bg-[#EDE9FE] transition-all inline-flex items-center gap-1.5 shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Mô phỏng bạn Lê Hoàng Mai mở phòng xem cấu hình đề &rarr;</span>
              </button>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                onClick={() => setSetupStep("config")}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:underline"
              >
                Hủy phòng & Quay lại thiết lập
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 2.5: STEP 7 - FRIEND REVIEWS CONFIGURATION        */}
        {/* ======================================================= */}
        {setupStep === "friend_reviewing" && joinedFriend && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-[#7C3AED]/30 shadow-lg space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black mb-2 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>BƯỚC 7: BẠN ĐƯỢC MỜI ĐANG DUYỆT CẤU HÌNH ĐỀ THI</span>
              </div>
              <h2 className="text-2xl font-black text-[#17133B]">{roomName}</h2>
              <p className="text-xs text-[#77738F] mt-1">
                Người bạn đồng hành đang xem lại chi tiết nội dung ôn tập trước khi chấp nhận tham gia.
              </p>
            </div>

            {/* Friend Previewing Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAF8FF] border border-[#EDE9FE] flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                {joinedFriend.avatar}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#17133B]">{joinedFriend.name}</h4>
                <p className="text-[11px] text-[#77738F]">{joinedFriend.major}</p>
                <span className="text-[11px] font-bold text-blue-600 inline-block mt-0.5">
                  Đang xem xét cấu hình câu hỏi...
                </span>
              </div>
            </div>

            {/* Quiz Configuration Review Table */}
            <div className="max-w-md mx-auto p-5 bg-white rounded-2xl border border-[#E8E4F3] shadow-xs space-y-3 text-left">
              <h4 className="text-xs font-black text-[#17133B] flex items-center gap-1.5 border-b border-[#F0EDF9] pb-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Nội dung bài thi bạn nhận được:</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#77738F] text-[11px] block">Môn học:</span>
                  <span className="font-bold text-[#17133B]">{subject.name}</span>
                </div>
                <div>
                  <span className="text-[#77738F] text-[11px] block">Số lượng câu hỏi:</span>
                  <span className="font-black text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                    {config?.questionCount || 10} câu
                  </span>
                </div>
                <div>
                  <span className="text-[#77738F] text-[11px] block">Mức độ thử thách:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                    Độ khó: {difficultyText(config?.difficulty)}
                  </span>
                </div>
                <div>
                  <span className="text-[#77738F] text-[11px] block">Định dạng câu:</span>
                  <span className="font-bold text-slate-800">
                    Trắc nghiệm 1 đáp án
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#77738F] text-[11px] block">Hình ảnh minh họa:</span>
                  <span className="font-bold text-slate-800">
                    {config?.includeImages !== false ? "Kèm sơ đồ & hình ảnh trực quan" : "Chỉ văn bản"}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation of Friend Decision */}
            <div className="space-y-2 pt-2 max-w-md mx-auto">
              <p className="text-[11px] text-[#77738F]">
                Mô phỏng quyết định của người bạn:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleFriendAcceptConfig}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[Bạn Mai] Đồng ý cấu hình</span>
                </button>

                <button
                  onClick={handleFriendDeclineConfig}
                  className="py-3 px-4 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <X className="w-4 h-4 text-rose-500" />
                  <span>[Bạn Mai] Từ chối & Đổi đề</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 3: STEP 8 - BOTH PLAYERS CONFIRM READINESS (READY)*/}
        {/* ======================================================= */}
        {setupStep === "ready" && joinedFriend && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-emerald-400 shadow-md space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>BƯỚC 8: CẢ 2 ĐÃ CHẤP NHẬN BỘ ĐỀ • XÁC NHẬN SẴN SÀNG</span>
              </div>
              <h2 className="text-2xl font-black text-[#17133B]">{roomName}</h2>
              <p className="text-xs text-[#77738F] mt-1">
                Bộ đề: <strong>{config?.questionCount || 10} câu ({difficultyText(config?.difficulty)})</strong>. Cả 2 cùng tích chọn &ldquo;Sẵn sàng&rdquo; để hệ thống tự động phát đề bài!
              </p>
            </div>

            {/* TWO PARTICIPANTS CONNECTED WITH READINESS TOGGLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto py-2">
              {/* Player 1 (You) */}
              <div className={`p-4 rounded-3xl border-2 transition-all space-y-2.5 ${
                hostReady ? "border-emerald-500 bg-emerald-50/40" : "border-slate-300 bg-slate-50"
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-lg mx-auto flex items-center justify-center shadow-xs">
                  ĐL
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#17133B]">Bạn (Đô La)</h4>
                  <span className="text-[10px] font-bold text-slate-600">Chủ phòng</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Mic: Đã sẵn sàng</span>
                </div>

                {/* Host Readiness Toggle */}
                <button
                  type="button"
                  onClick={() => setHostReady(!hostReady)}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                    hostReady
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{hostReady ? "Bạn đã sẵn sàng ✓" : "Bấm để sẵn sàng"}</span>
                </button>
              </div>

              {/* Player 2 (Friend) */}
              <div className={`p-4 rounded-3xl border-2 transition-all space-y-2.5 ${
                friendReady ? "border-emerald-500 bg-emerald-50/40" : "border-slate-300 bg-slate-50"
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-xs">
                  {joinedFriend.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#17133B]">{joinedFriend.name}</h4>
                  <span className="text-[10px] font-bold text-slate-600">{joinedFriend.major}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Mic: Đã kết nối WebRTC</span>
                </div>

                {/* Friend Readiness Toggle (Simulate Friend) */}
                <button
                  type="button"
                  onClick={() => setFriendReady(!friendReady)}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                    friendReady
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
                  }`}
                  title="Bấm để mô phỏng bạn sẵn sàng hoặc chưa sẵn sàng"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{friendReady ? "Bạn Mai đã sẵn sàng ✓" : "Chờ bạn Mai sẵn sàng..."}</span>
                </button>
              </div>
            </div>

            {/* Room Security & Privacy Lock Notice */}
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium flex items-center justify-center gap-2 max-w-md mx-auto">
              <Shield className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Phòng đã đạt giới hạn 2 người. Đã khóa để không bị làm phiền trong lúc học thoại.</span>
            </div>

            {/* Main Action: START VOICE LEARNING SESSION */}
            <div className="pt-2">
              <button
                onClick={handleStartActiveSession}
                disabled={!hostReady || !friendReady}
                className={`w-full max-w-md mx-auto py-3.5 px-6 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 ${
                  hostReady && friendReady
                    ? "bg-[#7C3AED] hover:bg-[#6D28D9] shadow-purple-200 cursor-pointer"
                    : "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed"
                }`}
              >
                <span>
                  {hostReady && friendReady
                    ? "Bắt đầu ôn tập ngay (Cả 2 đã sẵn sàng) →"
                    : "Đang chờ cả hai cùng sẵn sàng..."}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* FRIEND LIST MODAL (METHOD 3)                              */}
      {/* ========================================================= */}
      {showFriendModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#17133B]">
                <Users className="w-5 h-5 text-[#7C3AED]" />
                <span>Mời bạn học cùng ôn tập</span>
              </div>
              <button
                onClick={() => setShowFriendModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Tìm bạn theo tên hoặc chuyên ngành..."
                className="w-full pl-9 pr-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Friends List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredFriends.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl border border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#FAF8FF] flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {f.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-black text-[#17133B]">{f.name}</h5>
                        {f.online && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đang online" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#77738F]">{f.major}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInviteFriend(f)}
                    className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition-all shadow-xs"
                  >
                    Mời học
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setShowFriendModal(false)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
