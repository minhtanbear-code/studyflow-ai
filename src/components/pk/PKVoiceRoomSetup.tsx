"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Key,
  Mic,
  Radio,
  Share2,
  Sparkles,
  Users,
  X,
  Shield,
  Search,
  UserCheck,
  AlertCircle,
  Edit2,
  GraduationCap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";
import { QuizConfigData } from "./PKQuizConfigurationScreen";
import { userService, StudentProfile } from "@/core/services/userService";
import { voiceRealtimeService, RealtimeVoiceRoom } from "@/core/services/voiceRealtimeService";
import { PKUsernameRequiredModal } from "@/components/profile/PKUsernameRequiredModal";
import { createClient } from "@/core/supabase/client";

interface PKVoiceRoomSetupProps {
  subject: PKSubject;
  config?: QuizConfigData;
  initialRoomCode?: string;
  isGuest?: boolean;
  initialHostName?: string;
  onBack: () => void;
  onStartSession: (roomData: {
    roomName: string;
    roomCode: string;
    friendName: string;
    friendAvatar: string;
    isHost: boolean;
  }) => void;
}

export function PKVoiceRoomSetup({
  subject,
  config,
  initialRoomCode,
  isGuest = false,
  initialHostName,
  onBack,
  onStartSession,
}: PKVoiceRoomSetupProps) {
  // Current user identity
  const [currentUser, setCurrentUser] = useState<StudentProfile>(() => userService.getCurrentUser());
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasCustomUsername, setHasCustomUsername] = useState(false);
  const [editName, setEditName] = useState(currentUser.fullName);
  const [editUniversity, setEditUniversity] = useState(currentUser.university);
  const [editMajor, setEditMajor] = useState(currentUser.major);

  // Đồng bộ thông tin xác thực từ Supabase và kiểm tra trạng thái username
  useEffect(() => {
    async function checkAuthProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            setHasCustomUsername(!!profile.username);
            const updatedProfile = {
              ...currentUser,
              id: user.id,
              username: profile.username || currentUser.username,
              fullName: profile.full_name || currentUser.fullName,
              avatar: profile.avatar_url || currentUser.avatar,
              university: profile.university || currentUser.university,
              major: profile.major || currentUser.major,
            };
            setCurrentUser(updatedProfile);
            setEditName(updatedProfile.fullName);
            setEditUniversity(updatedProfile.university);
            setEditMajor(updatedProfile.major);
          }
        }
      } catch (err) {
        console.warn("Lỗi kiểm tra auth trong PKVoiceRoomSetup:", err);
      }
    }
    checkAuthProfile();
  }, []);

  // Mở modal tìm bạn bè: Bắt buộc đã thiết lập username trước
  const handleOpenFriendModal = () => {
    if (!hasCustomUsername && (!currentUser.username || currentUser.username.startsWith("student_"))) {
      setShowUsernameModal(true);
      return;
    }
    setShowFriendModal(true);
  };

  // Setup steps: "config" | "waiting" | "friend_reviewing" | "ready"
  const [setupStep, setSetupStep] = useState<"config" | "waiting" | "friend_reviewing" | "ready">(
    isGuest ? "friend_reviewing" : "config"
  );

  // Readied status for both players before starting
  const [hostReady, setHostReady] = useState(true);
  const [friendReady, setFriendReady] = useState(isGuest ? false : true);
  const [friendDeclinedMsg, setFriendDeclinedMsg] = useState<string | null>(null);

  // Room metadata
  const [roomName] = useState(`Phòng Voice Ôn Thi: ${subject.name}`);
  const [roomCode] = useState(() => initialRoomCode || "VH-" + Math.floor(1000 + Math.random() * 9000));
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pk?room=${roomCode}`
    : `https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk?room=${roomCode}`;

  // Copied toast
  const [copiedType, setCopiedType] = useState<"link" | "code" | null>(null);
  const [inviteSentMsg, setInviteSentMsg] = useState<string | null>(null);

  // Friend list modal & search
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendList, setFriendList] = useState<StudentProfile[]>(() => userService.getFriendList());

  // Friend joining state
  const [joinedFriend, setJoinedFriend] = useState<{
    name: string;
    avatar: string;
    major: string;
  } | null>(() => {
    if (isGuest && initialHostName) {
      return {
        name: initialHostName,
        avatar: initialHostName.slice(0, 2).toUpperCase(),
        major: "Chủ phòng (UEH)",
      };
    }
    return null;
  });

  const difficultyText = (d?: string) => {
    switch (d) {
      case "easy": return "Dễ";
      case "hard": return "Khó";
      case "mixed": return "Hỗn hợp";
      default: return "Trung bình";
    }
  };

  // Tra cứu tìm kiếm bạn bè thật theo từ khóa
  useEffect(() => {
    if (!showFriendModal) return;
    let active = true;
    userService.searchStudents(friendSearch).then((results) => {
      if (active) setFriendList(results);
    });
    return () => {
      active = false;
    };
  }, [friendSearch, showFriendModal]);

  // Tự động khởi tạo phòng trên Supabase ngay khi host mở trang
  useEffect(() => {
    if (!isGuest) {
      voiceRealtimeService.createRoom({
        room_code: roomCode,
        room_name: roomName,
        subject_id: subject.id,
        host_id: currentUser.id,
        host_name: currentUser.fullName,
        host_avatar: currentUser.avatar,
        question_count: config?.questionCount || 10,
        difficulty: config?.difficulty || "medium",
        include_images: config?.includeImages ?? true,
      });
    }
  }, [roomCode, isGuest, roomName, subject.id, currentUser.id, currentUser.fullName, currentUser.avatar, config]);

  // Copy helper
  const handleCopy = async (text: string, type: "link" | "code") => {
    if (!isGuest) {
      await voiceRealtimeService.createRoom({
        room_code: roomCode,
        room_name: roomName,
        subject_id: subject.id,
        host_id: currentUser.id,
        host_name: currentUser.fullName,
        host_avatar: currentUser.avatar,
        question_count: config?.questionCount || 10,
        difficulty: config?.difficulty || "medium",
        include_images: config?.includeImages ?? true,
      });
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Creator proceeds to Waiting Room
  const handleCreateRoom = async () => {
    setSetupStep("waiting");
    setFriendDeclinedMsg(null);

    await voiceRealtimeService.createRoom({
      room_code: roomCode,
      room_name: roomName,
      subject_id: subject.id,
      host_id: currentUser.id,
      host_name: currentUser.fullName,
      host_avatar: currentUser.avatar,
      question_count: config?.questionCount || 10,
      difficulty: config?.difficulty || "medium",
      include_images: config?.includeImages ?? true,
    });
  };

  // Lắng nghe đồng bộ phòng thời gian thực (Supabase Realtime Sync)
  useEffect(() => {
    const unsubscribe = voiceRealtimeService.subscribeToRoom(roomCode, (room: RealtimeVoiceRoom) => {
      if (!isGuest) {
        // HOST PERSPECTIVE:
        if (room.guest_name && (room.status === "friend_reviewing" || room.status === "ready" || room.status === "active")) {
          setJoinedFriend({
            name: room.guest_name,
            avatar: room.guest_avatar || room.guest_name.slice(0, 2).toUpperCase(),
            major: room.guest_major || "Bạn đồng hành",
          });
          if (room.status === "friend_reviewing") {
            setSetupStep("friend_reviewing");
          } else if (room.status === "ready") {
            setFriendReady(true);
            setSetupStep("ready");
          } else if (room.status === "active") {
            onStartSession({
              roomName: room.room_name,
              roomCode: room.room_code,
              friendName: room.guest_name,
              friendAvatar: room.guest_avatar || room.guest_name.slice(0, 2).toUpperCase(),
              isHost: true,
            });
          }
        }
      } else {
        // GUEST PERSPECTIVE:
        if (room.host_name) {
          setJoinedFriend({
            name: room.host_name,
            avatar: room.host_avatar || room.host_name.slice(0, 2).toUpperCase(),
            major: "Chủ phòng",
          });
        }
        if (room.status === "ready") {
          setSetupStep("ready");
        } else if (room.status === "active") {
          onStartSession({
            roomName: room.room_name,
            roomCode: room.room_code,
            friendName: room.host_name,
            friendAvatar: room.host_avatar || room.host_name.slice(0, 2).toUpperCase(),
            isHost: false,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, isGuest, onStartSession]);

  // Gửi lời mời trực tiếp đến người bạn trong danh bạ
  const handleInviteFriend = async (friend: StudentProfile) => {
    setShowFriendModal(false);
    setFriendDeclinedMsg(null);
    setSetupStep("waiting");

    // Đảm bảo phòng đã được khởi tạo
    await handleCreateRoom();

    const ok = await voiceRealtimeService.sendDirectInvitation({
      room_code: roomCode,
      sender_id: currentUser.id,
      sender_name: `${currentUser.fullName} (${currentUser.university})`,
      sender_avatar: currentUser.avatar,
      receiver_id: friend.id,
      subject_name: subject.name,
      question_count: config?.questionCount || 10,
      difficulty: config?.difficulty || "medium",
    });

    setInviteSentMsg(ok ? `Đã gửi lời mời đến ${friend.fullName}!` : `Đang chờ ${friend.fullName}...`);
    setTimeout(() => setInviteSentMsg(null), 4000);
  };

  // Friend accepts quiz configuration
  const handleFriendAcceptConfig = async () => {
    setFriendReady(true);
    setSetupStep("ready");
    await voiceRealtimeService.guestAcceptConfig(roomCode);
  };

  // Friend declines quiz configuration
  const handleFriendDeclineConfig = async () => {
    await voiceRealtimeService.guestDeclineConfig(roomCode);
    setFriendDeclinedMsg("Bạn đã từ chối cấu hình đề thi này.");
    onBack();
  };

  // Start the actual Voice Learning session
  const handleStartActiveSession = async () => {
    if (!joinedFriend || !hostReady || !friendReady) return;
    await voiceRealtimeService.startActiveSession(roomCode);
    onStartSession({
      roomName,
      roomCode,
      friendName: joinedFriend.name,
      friendAvatar: joinedFriend.avatar,
      isHost: !isGuest,
    });
  };

  // Cập nhật Profile
  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    const updated = userService.updateCurrentUser({
      fullName: editName.trim(),
      university: editUniversity.trim(),
      major: editMajor.trim(),
    });
    setCurrentUser(updated);
    setShowEditProfile(false);
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
                {isGuest ? "Gia nhập phòng Voice" : "Tạo phòng Voice học (1 vs 1)"}
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

      {/* Invite sent notification toast */}
      {inviteSentMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#7C3AED] text-white px-4 py-2 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{inviteSentMsg}</span>
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
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
            >
              Chỉnh sửa cấu hình &rarr;
            </button>
          </div>
        )}

        {/* Current User Quick-Edit Banner */}
        <div className="mb-4 p-3 bg-white rounded-2xl border border-[#E8E4F3] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-xs flex items-center justify-center">
              {currentUser.avatar}
            </div>
            <div>
              <span className="font-black text-[#17133B]">{currentUser.fullName}</span>
              <span className="text-[11px] text-[#77738F] block">
                {currentUser.university} • {currentUser.major} ({currentUser.academicYear})
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#EDE9FE] hover:text-[#7C3AED] text-slate-600 font-bold text-[11px] transition-all cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Đổi tên / trường</span>
          </button>
        </div>

        {/* ======================================================= */}
        {/* PHASE 2.1: INITIAL CONFIGURATION / CREATION             */}
        {/* ======================================================= */}
        {setupStep === "config" && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#E8E4F3] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-black mb-2 border border-purple-200">
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

            {/* Quiz Configuration Summary Box */}
            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#EDE9FE] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[#F0EDF9] pb-2.5">
                <span className="font-bold text-[#77738F]">Cấu hình đề thi đã chọn:</span>
                <button
                  onClick={onBack}
                  className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Thay đổi
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#77738F] block text-[11px]">Môn học:</span>
                  <span className="font-black text-[#17133B]">{subject.name}</span>
                </div>
                <div>
                  <span className="text-[#77738F] block text-[11px]">Số lượng câu:</span>
                  <span className="font-black text-[#7C3AED]">{config?.questionCount || 10} câu</span>
                </div>
                <div>
                  <span className="text-[#77738F] block text-[11px]">Độ khó:</span>
                  <span className="font-black text-[#17133B]">{difficultyText(config?.difficulty)}</span>
                </div>
                <div>
                  <span className="text-[#77738F] block text-[11px]">Dạng đề:</span>
                  <span className="font-bold text-[#17133B]">Trắc nghiệm chuẩn</span>
                </div>
              </div>
            </div>

            {/* Three Invitation Methods */}
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
                  <h4 className="text-xs font-black text-[#17133B]">1. Sao chép Link</h4>
                  <p className="text-[11px] text-[#77738F]">Gửi qua Zalo, Messenger, Facebook...</p>
                  <span className="text-[11px] font-bold text-blue-600 block pt-1">
                    Bấm sao chép &rarr;
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
                    {roomCode} (Bấm chép)
                  </span>
                </div>

                {/* Method 3: Friend Directory */}
                <div
                  onClick={handleOpenFriendModal}
                  className="p-3.5 rounded-2xl border-2 border-[#7C3AED]/40 bg-[#FAF8FF] hover:border-[#7C3AED] cursor-pointer transition-all space-y-1.5 group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#7C3AED]">3. Danh bạ bạn học</h4>
                  <p className="text-[11px] text-[#77738F]">Mời trực tiếp sinh viên đang online trên hệ thống.</p>
                  <span className="text-[11px] font-bold text-[#7C3AED] block pt-1">
                    Chọn bạn bè &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 border-t border-[#F0EDF9]">
              <button
                onClick={handleCreateRoom}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
              >
                <span>Vào phòng chờ & Mời bạn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 2.2: WAITING ROOM                                  */}
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
                  {currentUser.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#17133B]">Bạn ({currentUser.fullName})</h4>
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
                  onClick={handleOpenFriendModal}
                  className="px-3 py-1 rounded-xl bg-white text-[#7C3AED] font-bold text-[11px] border border-[#EDE9FE] hover:bg-[#EDE9FE] cursor-pointer"
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
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8E4F3] hover:border-[#7C3AED] text-xs font-bold text-[#17133B] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Sao chép Link mời</span>
                </button>

                <button
                  onClick={() => handleCopy(roomCode, "code")}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E8E4F3] hover:border-[#7C3AED] text-xs font-bold text-[#17133B] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Chia sẻ mã phòng</span>
                </button>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                onClick={() => setSetupStep("config")}
                className="text-xs font-bold text-[#77738F] hover:text-rose-600 transition-colors cursor-pointer"
              >
                Hủy phòng chờ & Thiết lập lại
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 2.3: FRIEND REVIEWS CONFIGURATION                  */}
        {/* ======================================================= */}
        {setupStep === "friend_reviewing" && joinedFriend && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-[#7C3AED]/30 shadow-lg space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black mb-2 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>BƯỚC 2: XEM LẠI CẤU HÌNH ĐỀ THI 1VS1</span>
              </div>
              <h2 className="text-2xl font-black text-[#17133B]">{roomName}</h2>
              <p className="text-xs text-[#77738F] mt-1">
                {isGuest
                  ? "Bạn đã vào phòng của " + joinedFriend.name + ". Hãy xem lại nội dung trước khi xác nhận sẵn sàng!"
                  : joinedFriend.name + " đã vào phòng và đang xem lại chi tiết nội dung đề thi..."}
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
                  {isGuest ? "Chủ phòng tạo đề" : "Đang đồng bộ cấu hình..."}
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
                  <span className="text-[#77738F] text-[11px] block">Tương tác phòng:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    WebRTC Voice 1v1
                  </span>
                </div>
              </div>
            </div>

            {/* If GUEST: Show Accept or Decline buttons */}
            {isGuest ? (
              <div className="pt-2 max-w-md mx-auto space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFriendAcceptConfig}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đồng ý cấu hình & Sẵn sàng</span>
                  </button>

                  <button
                    onClick={handleFriendDeclineConfig}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 font-medium max-w-md mx-auto">
                Đang chờ {joinedFriend.name} xác nhận đồng ý với cấu hình đề thi trên...
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* PHASE 2.4: BOTH PLAYERS READY                            */}
        {/* ======================================================= */}
        {setupStep === "ready" && joinedFriend && (
          <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-emerald-500/40 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-2 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CẢ HAI BẠN ĐÃ KẾT NỐI VÀO PHÒNG VOICE!</span>
              </div>
              <h2 className="text-2xl font-black text-[#17133B]">{roomName}</h2>
              <p className="text-xs text-[#77738F] mt-1">
                Microphone đã sẵn sàng kết nối trực tiếp. Cùng bấm bắt đầu để bước vào phòng giải đề!
              </p>
            </div>

            {/* TWO PARTICIPANTS CONNECTED WITH READINESS TOGGLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto py-2">
              {/* Player 1 (You) */}
              <div className="p-4 rounded-3xl border-2 border-emerald-500 bg-emerald-50/40 space-y-2.5 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-lg mx-auto flex items-center justify-center shadow-xs">
                  {currentUser.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#17133B]">Bạn ({currentUser.fullName})</h4>
                  <span className="text-[10px] font-bold text-slate-600">{isGuest ? "Khách mời" : "Chủ phòng"}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Mic: Đã sẵn sàng</span>
                </div>
                <div className="w-full py-1.5 px-3 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Bạn đã sẵn sàng ✓</span>
                </div>
              </div>

              {/* Player 2 (Friend) */}
              <div className="p-4 rounded-3xl border-2 border-emerald-500 bg-emerald-50/40 space-y-2.5 shadow-sm">
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
                <div className="w-full py-1.5 px-3 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{joinedFriend.name} đã sẵn sàng ✓</span>
                </div>
              </div>
            </div>

            {/* Room Security Notice */}
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium flex items-center justify-center gap-2 max-w-md mx-auto">
              <Shield className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Phòng đã đạt giới hạn 2 người. Đã khóa để không bị làm phiền trong lúc học thoại.</span>
            </div>

            {/* Main Action: START VOICE LEARNING SESSION */}
            <div className="pt-2">
              <button
                onClick={handleStartActiveSession}
                className="w-full max-w-md mx-auto py-3.5 px-6 rounded-2xl text-white font-black text-sm shadow-xl bg-[#7C3AED] hover:bg-[#6D28D9] shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer hover:scale-[1.01]"
              >
                <span>Bắt đầu ôn tập ngay (Cả 2 đã sẵn sàng) &rarr;</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#17133B]">
                <Users className="w-5 h-5 text-[#7C3AED]" />
                <span>Mời bạn học cùng ôn tập</span>
              </div>
              <button
                onClick={() => setShowFriendModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
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
                placeholder="Tìm bạn theo tên, tài khoản hoặc trường..."
                className="w-full pl-9 pr-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Friends List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {friendList.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#77738F]">
                  Không tìm thấy bạn học phù hợp với từ khóa "{friendSearch}".
                </div>
              ) : (
                friendList.map((f) => (
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
                          <h5 className="text-xs font-black text-[#17133B]">{f.fullName}</h5>
                          {f.isOnline && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đang online" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#77738F]">{f.university} • {f.major}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInviteFriend(f)}
                      className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Mời học
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setShowFriendModal(false)}
                className="text-xs font-bold text-slate-500 hover:underline cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PROFILE EDIT MODAL                                        */}
      {/* ========================================================= */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-[#E8E4F3] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-[#17133B]">
                <GraduationCap className="w-5 h-5 text-[#7C3AED]" />
                <span>Hồ sơ sinh viên của bạn</span>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#17133B] block mb-1">Họ và tên hiển thị:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="VD: Minh Tân, Thu Hà..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17133B] block mb-1">Trường Đại học:</label>
                <input
                  type="text"
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  placeholder="VD: UEH, NEU, FTU, UFM..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17133B] block mb-1">Chuyên ngành:</label>
                <input
                  type="text"
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  placeholder="VD: Kinh tế đối ngoại, Kế toán..."
                  className="w-full px-3 py-2 bg-[#F8F7FC] border border-[#E8E4F3] rounded-xl font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs cursor-pointer"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YÊU CẦU THIẾT LẬP USERNAME TRƯỚC KHI TÌM BẠN BÈ (PROGRESSIVE PROFILING) */}
      <PKUsernameRequiredModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={(newUsername) => {
          setHasCustomUsername(true);
          setCurrentUser((prev) => ({ ...prev, username: newUsername }));
          setShowUsernameModal(false);
          setShowFriendModal(true);
        }}
      />
    </div>
  );
}
