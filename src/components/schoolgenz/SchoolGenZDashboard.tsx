"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PKSubjectSelectionScreen } from "@/components/pk/PKSubjectSelectionScreen";
import { PKStudyModeSelectionScreen } from "@/components/pk/PKStudyModeSelectionScreen";
import { PKFriendModeSelectionScreen } from "@/components/pk/PKFriendModeSelectionScreen";
import { PKVoiceLearningContainer } from "@/components/pk/PKVoiceLearningContainer";
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Crown,
  Eye,
  Flame,
  Gem,
  GraduationCap,
  Heart,
  Home,
  MessageSquare,
  MessageSquareHeart,
  Mic,
  Moon,
  MoreHorizontal,
  Play,
  Radio,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { CuBongMascot } from "./CuBongMascot";
import { CuBongChatModal } from "./CuBongChatModal";
import { PKBattleModal } from "./PKBattleModal";
import { SchoolGenZPKCentral } from "./SchoolGenZPKCentral";
import { SchoolGenZPKSidebar } from "./SchoolGenZPKSidebar";
import { PKCreateRoomModal } from "@/components/pk/PKCreateRoomModal";
import { PKJoinCodeModal } from "@/components/pk/PKJoinCodeModal";
import {
  BotDifficulty,
  PKHistoryEntry,
  PKRoom,
  PKSubject,
} from "@/core/domain/pk.types";
import {
  MOCK_PK_HISTORY,
  MOCK_PK_LEADERBOARD,
  MOCK_PK_PROGRESS,
  MOCK_PK_RECOMMENDATIONS,
  MOCK_PK_ROOMS,
  MOCK_PK_SUBJECTS,
  MOCK_PK_USER_STATS,
} from "@/core/data/mockPkData";
import { ClassroomRoom } from "@/core/domain/classroom.types";
import { INITIAL_CLASSROOMS } from "@/core/data/sampleClassrooms";
import { ClassroomListTab } from "@/components/mobile/ClassroomListTab";
import { ClassroomDetailView } from "@/components/mobile/ClassroomDetailView";
import { StudentProfile } from "@/core/domain/academic.types";
import { SAMPLE_PROFILES } from "@/core/data/sampleProfiles";
import { GradeCalculatorTab } from "@/components/mobile/GradeCalculatorTab";
import { EarlyWarningTab } from "@/components/mobile/EarlyWarningTab";
import { RoadmapTab } from "@/components/mobile/RoadmapTab";
import { analyzeStudentEarlyWarning, UNIVERSITY_PRESETS } from "@/core/services/academicCalculator.service";

export function SchoolGenZDashboard() {
  const router = useRouter();

  // Navigation & View State
  const [activeNav, setActiveNav] = useState<
    "campus" | "study" | "pk" | "hall_of_fame" | "ai" | "genz" | "shop" | "classroom" | "livestream"
  >("campus");
  const [pkFlowStep, setPkFlowStep] = useState<"subject" | "mode" | "friend_mode" | "voice_learning">("subject");
  const [selectedFlowSubject, setSelectedFlowSubject] = useState<PKSubject>(
    MOCK_PK_SUBJECTS.find((s) => s.id === "eco101") || MOCK_PK_SUBJECTS[1]
  );
  const [flowSearchQuery, setFlowSearchQuery] = useState<string>("");

  // User Gamification Stats
  const [coins, setCoins] = useState(120);
  const [diamonds, setDiamonds] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotice, setShowNotice] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("Lớp 5");

  // Live Date Time string matching screenshot format: "CN, 08/11/2026 08:24:40"
  const [currentTimeStr, setCurrentTimeStr] = useState("CN, 08/11/2026 08:24:40");

  // Daily Tasks State
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: "Học 1 bài hôm nay", current: 1, total: 1, done: true },
    { id: 2, title: "Luyện 10 câu", current: 4, total: 10, done: false },
    { id: 3, title: "Chơi 2 trận PK", current: 0, total: 2, done: false },
  ]);

  // Modals
  const [showCuBongModal, setShowCuBongModal] = useState(false);
  const [showPKModal, setShowPKModal] = useState(false);
  const [showCreatePKModal, setShowCreatePKModal] = useState(false);
  const [showJoinPKCodeModal, setShowJoinPKCodeModal] = useState(false);

  // PK State & Handlers
  const [pkRooms, setPkRooms] = useState<PKRoom[]>(MOCK_PK_ROOMS);
  const [pkMyRooms, setPkMyRooms] = useState<PKRoom[]>([]);
  const [pkHistory, setPkHistory] = useState<PKHistoryEntry[]>(MOCK_PK_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bot Practice State
  const [isBotBattle, setIsBotBattle] = useState(false);
  const [currentBotDifficulty, setCurrentBotDifficulty] = useState<BotDifficulty>("adaptive");
  const [currentPracticeSubject, setCurrentPracticeSubject] = useState("Kinh tế vi mô");
  const [selectedPKSubjectId, setSelectedPKSubjectId] = useState<string>("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectSubject = (id: string) => {
    setSelectedPKSubjectId(id);
    const sub = MOCK_PK_SUBJECTS.find((s) => s.id === id);
    if (sub && sub.id !== "all") {
      setCurrentPracticeSubject(sub.name);
      showToast(`📚 Đã chọn môn: ${sub.name} (${sub.activeRoomsCount} phòng đấu)`);
    } else {
      setCurrentPracticeSubject("Tất cả môn");
      showToast("📚 Hiển thị tất cả các môn đấu trí");
    }
  };

  const handleStartBotPractice = (difficulty: BotDifficulty, subjectName: string) => {
    setIsBotBattle(true);
    setCurrentBotDifficulty(difficulty);
    setCurrentPracticeSubject(subjectName);
    showToast(`🤖 Bắt đầu trận Luyện tập với Bot (${difficulty.toUpperCase()}) - ${subjectName}`);
    setShowPKModal(true);
  };

  const handleCreateRoom = (data: any) => {
    const newRoom: PKRoom = {
      id: "r-" + Date.now(),
      roomCode: "PK-" + Math.floor(1000 + Math.random() * 9000),
      title: data.title,
      subjectId: data.subjectId,
      subjectName: MOCK_PK_SUBJECTS.find((s) => s.id === data.subjectId)?.name || "Môn học chung",
      mode: data.mode,
      teamSize: data.teamSize,
      currentPlayers: 1,
      maxPlayers: data.mode === "solo" ? 2 : data.teamSize === "2v2" ? 4 : 6,
      isPrivate: data.isPrivate,
      status: "waiting",
      hostName: "Đô La",
      durationMinutes: data.durationMinutes,
      questionsCount: data.questionsCount,
      createdAt: "Vừa xong",
    };
    setPkRooms((prev) => [newRoom, ...prev]);
    setPkMyRooms((prev) => [newRoom, ...prev]);
    setShowCreatePKModal(false);
    showToast(`🎉 Tạo phòng "${newRoom.title}" thành công! Mã: ${newRoom.roomCode}`);
  };

  const handleJoinByCode = (code: string) => {
    const found = pkRooms.find((r) => r.roomCode.toLowerCase() === code.toLowerCase());
    setShowJoinPKCodeModal(false);
    setIsBotBattle(false);
    if (found) {
      showToast(`⚡ Đang kết nối vào phòng [${found.roomCode}] "${found.title}"...`);
      setShowPKModal(true);
      return true;
    } else {
      showToast(`⚠️ Không tìm thấy phòng với mã ${code}. Đã tạo phòng so tài tự động!`);
      setShowPKModal(true);
      return true;
    }
  };

  const handleJoinRoom = (room: PKRoom) => {
    setIsBotBattle(false);
    showToast(`⚔️ Đang vào phòng [${room.roomCode}] "${room.title}"... Bắt đầu thi đấu!`);
    setShowPKModal(true);
  };

  // Classroom & Academic Integration
  const [profile, setProfile] = useState<StudentProfile>(SAMPLE_PROFILES.at_risk_student);
  const [rooms, setRooms] = useState<ClassroomRoom[]>(INITIAL_CLASSROOMS);
  const [activeRoom, setActiveRoom] = useState<ClassroomRoom | null>(null);
  const warningAnalysis = analyzeStudentEarlyWarning(profile, UNIVERSITY_PRESETS.standard_moet);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayName = days[now.getDay()];
      const d = String(now.getDate()).padStart(2, "0");
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const y = now.getFullYear();
      const h = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTimeStr(`${dayName}, ${d}/${m}/${y} ${h}:${min}:${s}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRewardCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
    // Also increment PK quest if in PK
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === 3 ? { ...t, current: Math.min(t.total, t.current + 1), done: t.current + 1 >= t.total } : t))
    );
  };

  if (activeNav === "pk") {
    if (pkFlowStep === "voice_learning" && selectedFlowSubject) {
      return (
        <PKVoiceLearningContainer
          subject={selectedFlowSubject}
          onLeave={() => setPkFlowStep("friend_mode")}
        />
      );
    }
    if (pkFlowStep === "friend_mode" && selectedFlowSubject) {
      return (
        <PKFriendModeSelectionScreen
          subject={selectedFlowSubject}
          onBack={() => setPkFlowStep("mode")}
          onSelectFriendMode={(mode) => {
            if (mode === "voice") {
              setPkFlowStep("voice_learning");
            }
          }}
        />
      );
    }
    if (pkFlowStep === "mode" && selectedFlowSubject) {
      return (
        <PKStudyModeSelectionScreen
          subject={selectedFlowSubject}
          onBack={() => setPkFlowStep("subject")}
          onSelectMode={(modeId) => {
            if (modeId === "friend") {
              setPkFlowStep("friend_mode");
            }
          }}
        />
      );
    }
    return (
      <PKSubjectSelectionScreen
        initialSubjectId={selectedFlowSubject?.id}
        initialSearchQuery={flowSearchQuery}
        onBack={() => setActiveNav("campus")}
        onSelectSubject={(subj, q) => {
          setSelectedFlowSubject(subj);
          if (q !== undefined) setFlowSearchQuery(q);
          setPkFlowStep("mode");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#edf3ff] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Xanh biển đậm sang trọng)                 */}
      {/* ========================================================= */}
      <header className="bg-gradient-to-r from-[#296ef2] via-[#2f75f8] to-[#3b82f6] text-white px-3 sm:px-6 py-2.5 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => setActiveNav("campus")}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-600 font-black text-xl group-hover:scale-105 transition-transform">
              <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🎓
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                School
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#ff80bf] ml-1 drop-shadow-sm">
                Gen
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#ffbf00] ml-0.5 drop-shadow-sm">
                Z
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bài học, lớp, ID phòng thi..."
              className="w-full text-xs bg-white text-slate-800 placeholder-slate-400 rounded-full pl-9 pr-4 py-2 border-0 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/80"
            />
          </div>

          {/* Right Header Widget Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock Pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-700/60 border border-blue-400/40 text-xs font-mono font-medium text-white shadow-sm"
              suppressHydrationWarning
            >
              <Clock className="w-3.5 h-3.5 text-blue-200" />
              <span>{currentTimeStr}</span>
            </div>

            {/* Sound Toggle Pill */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-full bg-blue-700/60 hover:bg-blue-600 flex items-center justify-center text-white border border-blue-400/40 transition-colors shadow-sm"
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Coins & Diamonds Pill */}
            <div className="flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/40 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <span className="flex items-center gap-1 text-yellow-300">
                <span>🪙</span>
                <span>{coins}</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1 text-sky-200">
                <span>💎</span>
                <span>{diamonds}</span>
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => alert("Thông báo: Bạn có 1 bài tập mới cần hoàn thành!")}
              className="w-8 h-8 rounded-full bg-blue-700/60 hover:bg-blue-600 flex items-center justify-center text-white border border-blue-400/40 relative transition-colors shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </button>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded-full cursor-pointer transition-colors">
              <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">
                ĐL
              </div>
              <div className="hidden sm:block text-left pr-1 leading-none">
                <div className="text-xs font-black text-white">Đô La</div>
                <div className="text-[10px] text-blue-100 font-medium mt-0.5">
                  Lớp 5 • Lv 1 • Gà con
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN BODY (Sidebar Trái + Nội dung Giữa + Cột Phải)   */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 flex-1 flex flex-col lg:flex-row gap-4">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR MENU                                         */}
        {/* ========================================================= */}
        <aside className="lg:w-56 shrink-0 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
          {/* Menu Items */}
          {[
            { id: "campus", label: "Sân trường", icon: "🏛️", isDefault: true },
            { id: "study", label: "Học", icon: "📖", badge: "Điểm & Lộ trình" },
            { id: "pk", label: "PK", icon: "🏆", badge: "Đấu trí" },
            { id: "hall_of_fame", label: "Đấu trường danh vọng", icon: "👑" },
            { id: "ai", label: "Học cùng AI", icon: "🤖", badge: "Mới" },
            { id: "genz", label: "Gen Z", icon: "🔍" },
            { id: "shop", label: "Mua sắm", icon: "🛒", badge: "Shopee" },
            { id: "classroom", label: "Lớp học", icon: "👥", badge: "Online" },
            { id: "livestream", label: "Livestream", icon: "🎥" },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "pk") {
                    router.push("/pk");
                    return;
                  }
                  if (item.id === "ai") {
                    setShowCuBongModal(true);
                  } else {
                    setActiveNav(item.id as any);
                  }
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-sm ${
                  isActive
                    ? "bg-[#296ef2] text-white shadow-md shadow-blue-300/50 scale-[1.02]"
                    : "bg-white text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 border border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      item.badge === "Shopee"
                        ? "bg-orange-100 text-orange-600"
                        : isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* ========================================================= */}
        {/* CENTER CONTENT COLUMN                                     */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col gap-3 min-w-0">
          {/* NOTICE BANNER BỐ MẸ (Vàng nhẹ nhàng) */}
          {showNotice && (
            <div className="bg-[#fff9e6] border-2 border-[#ffe082] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
              <div className="text-xs text-[#7c5e10] leading-relaxed pr-2">
                <strong className="text-[#594205] block font-black text-xs sm:text-sm mb-0.5">
                  Bố mẹ ơi, có lựa chọn mới cho con
                </strong>
                Mic, camera, nhắn tin nay là từng lựa chọn riêng. Con vẫn học bình thường.
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => alert("Chế độ kiểm soát phụ huynh: Các cài đặt âm thanh, hình ảnh đã an toàn cho con!")}
                  className="px-3 py-1.5 rounded-xl bg-[#fbc02d] hover:bg-[#f9a825] text-slate-900 font-black text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  Bố mẹ xem
                </button>
                <button
                  onClick={() => setShowNotice(false)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW: CAMPUS / SÂN TRƯỜNG (Default) */}
          {activeNav === "campus" && (
            <>
              {/* HERO FEATURE CARD (MỚI • HỌC CÙNG AI VỚI CÚ BÔNG) */}
              <div className="bg-gradient-to-br from-[#e0f0ff] via-[#ebf5ff] to-[#f0f7ff] rounded-3xl p-4 sm:p-6 border-2 border-[#badeff] shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-3 z-10 max-w-md">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>+ MỚI • HỌC CÙNG AI</span>
                  </span>

                  {/* Heading */}
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    Nói tiếng Anh, tiếng Trung với Cú Bông
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Nhập vai, luyện phát âm, sửa lỗi từng câu •{" "}
                    <strong className="text-blue-700">10 phút miễn phí mỗi ngày</strong>
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setShowCuBongModal(true)}
                      className="inline-flex items-center gap-2 bg-[#296ef2] hover:bg-[#1f5cd1] text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-blue-200 active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Nhắn tin với Cú</span>
                    </button>

                    <button
                      onClick={() => setShowCuBongModal(true)}
                      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border-2 border-slate-200 shadow-sm active:scale-95 transition-all"
                    >
                      <Mic className="w-4 h-4 text-blue-600" />
                      <span>Nói ngay</span>
                    </button>
                  </div>
                </div>

                {/* Cute Mascot */}
                <div
                  onClick={() => setShowCuBongModal(true)}
                  className="cursor-pointer shrink-0 relative group"
                  title="Bấm vào Cú Bông để trò chuyện!"
                >
                  <CuBongMascot className="w-36 h-36 sm:w-44 sm:h-44" />
                  <span className="absolute -top-2 right-2 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow animate-bounce">
                    Xin chào! 👋
                  </span>
                </div>
              </div>

              {/* SUBJECT & GRADE SELECTOR BAR */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3e8ff] text-purple-600 flex items-center justify-center shrink-0 text-xl font-bold">
                    📱
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      Tiếng Anh • lớp em đang học
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Đổi lớp: Học, PK, Thi thử, Bảng vàng theo lớp mới
                    </p>
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-black text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="Lớp 1">Lớp của em 🇬🇧 Lớp 1</option>
                    <option value="Lớp 2">Lớp của em 🇬🇧 Lớp 2</option>
                    <option value="Lớp 3">Lớp của em 🇬🇧 Lớp 3</option>
                    <option value="Lớp 4">Lớp của em 🇬🇧 Lớp 4</option>
                    <option value="Lớp 5">Lớp của em 🇬🇧 Lớp 5</option>
                    <option value="Đại học">Đại học / Sinh viên 🎓</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* SCHOOL YARD / SÂN TRƯỜNG INTERACTIVE GRAPHIC */}
              <div className="relative bg-gradient-to-b from-[#87ceeb] via-[#bfe9ff] to-[#a3e49e] rounded-3xl h-64 sm:h-72 border-2 border-blue-200 overflow-hidden shadow-sm flex items-end justify-center">
                {/* Sun & Clouds */}
                <div className="absolute top-4 right-10 w-12 h-12 rounded-full bg-yellow-300 shadow-lg shadow-yellow-200/50" />
                <div className="absolute top-6 left-12 w-20 h-7 bg-white/80 rounded-full blur-[1px]" />
                <div className="absolute top-10 right-28 w-24 h-8 bg-white/70 rounded-full blur-[1px]" />

                {/* Decorative Bunting Flags */}
                <div className="absolute top-24 left-0 right-0 flex justify-around">
                  {["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#ef4444", "#3b82f6"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-4 h-5"
                        style={{
                          backgroundColor: color,
                          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        }}
                      />
                    )
                  )}
                </div>

                {/* Illustrated School Building */}
                <div className="w-full max-w-lg h-44 bg-[#ffe0b2] border-t-8 border-[#d84315] rounded-t-2xl relative shadow-lg mx-auto flex flex-col justify-end">
                  {/* Roof Top Clock */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#bf360c] rounded-t-full flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[8px] font-bold">
                      🕒
                    </div>
                  </div>

                  {/* Windows Row */}
                  <div className="grid grid-cols-5 gap-3 px-6 pt-3">
                    {[1, 2, 3, 4, 5].map((w) => (
                      <div key={w} className="h-10 bg-[#bbdefb] border-2 border-white rounded-lg shadow-inner" />
                    ))}
                  </div>

                  {/* School Gate Doors */}
                  <div className="w-20 h-16 bg-[#5d4037] mx-auto rounded-t-xl border-t-4 border-amber-900 mt-2 shadow flex items-center justify-center">
                    <div className="w-1 h-6 bg-amber-400" />
                  </div>
                </div>

                {/* Floating "Chào Đô La!" Card (Exactly as in screenshot) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 border-2 border-slate-100 shadow-xl space-y-2.5 z-20">
                  <h3 className="text-base font-black text-slate-900">Chào Đô La!</h3>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>1 bạn online</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      onClick={() => setActiveNav("classroom")}
                      className="w-full bg-[#296ef2] hover:bg-[#1e5ccc] text-white font-black text-xs px-4 py-2 rounded-xl shadow transition-all active:scale-95 flex items-center justify-between"
                    >
                      <span>Vào trường</span>
                      <span>&gt;</span>
                    </button>
                    <button
                      onClick={() => setActiveNav("classroom")}
                      className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black text-xs px-4 py-2 rounded-xl shadow transition-all active:scale-95 flex items-center justify-between"
                    >
                      <span>Vào lớp</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW: CLASSROOM / LỚP HỌC (Seamless Virtual Rooms) */}
          {activeNav === "classroom" && (
            <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Phòng Học & Lớp Học Chung
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNav("campus")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  &larr; Quay về Sân trường
                </button>
              </div>

              {activeRoom ? (
                <ClassroomDetailView
                  room={activeRoom}
                  currentUser={profile}
                  onBack={() => setActiveRoom(null)}
                  onUpdateRoom={(u) => setActiveRoom(u)}
                  onAttendanceChecked={() => alert("🎉 Đã điểm danh vào lớp!")}
                />
              ) : (
                <ClassroomListTab
                  rooms={rooms}
                  currentUser={profile}
                  onSelectRoom={(r) => setActiveRoom(r)}
                  onCreateRoom={(nr) => {
                    setRooms((prev) => [nr, ...prev]);
                    setActiveRoom(nr);
                  }}
                  onJoinByCode={(code) => {
                    const r = rooms.find((x) => x.code.toUpperCase() === code.toUpperCase());
                    if (r) {
                      setActiveRoom(r);
                      return true;
                    }
                    return false;
                  }}
                />
              )}
            </div>
          )}

          {/* VIEW: STUDY / HỌC (Grade Calculator & Academic Early Warning) */}
          {activeNav === "study" && (
            <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Góc Học Tập & Dự Báo Điểm Số
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNav("campus")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  &larr; Về Sân trường
                </button>
              </div>

              {/* Grade Calculator Component */}
              <GradeCalculatorTab
                profile={profile}
                activeConfig={UNIVERSITY_PRESETS.standard_moet}
                onUpdateProfile={(up) => setProfile(up)}
                onSelectGradingPreset={() => {}}
              />
            </div>
          )}

        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN WIDGETS                                      */}
        {/* ========================================================= */}
        <aside className="lg:w-72 shrink-0 space-y-3.5">
            {/* WIDGET 1: NHIỆM VỤ HÔM NAY */}
            <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Nhiệm vụ hôm nay</h4>
                </div>
              </div>

              {/* Task 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Học 1 bài hôm nay</span>
                  <span className="text-emerald-600 font-black">1/1 xong</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              {/* Task 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Luyện 10 câu</span>
                  <span className="text-slate-500 font-black">0/10</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-0" />
                </div>
              </div>

              {/* Task 3 */}
              <div
                onClick={() => router.push("/pk")}
                className="space-y-1 cursor-pointer group"
                title="Bấm để vào Đấu trường PK"
              >
                <div className="flex justify-between text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors">
                  <span className="flex items-center gap-1">
                    <span>Chơi 2 trận PK</span>
                    <span className="text-[10px] text-rose-500 font-black">🔥</span>
                  </span>
                  <span className="text-rose-500 font-black">
                    {dailyTasks[2].current}/2
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${(dailyTasks[2].current / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* WIDGET 2: THỨ HẠNG LỚP */}
            <div className="bg-white rounded-3xl p-3.5 border-2 border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">Thứ hạng lớp</h5>
                <p className="text-[11px] text-slate-500 font-medium">chưa có điểm tuần này</p>
              </div>
            </div>

            {/* WIDGET 3: LỜI MỜI PK (Card Đen Navy chuẩn như hình) */}
            <div className="bg-[#1b2234] text-white rounded-3xl p-4 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-900 font-black text-xs shrink-0">
                  ĐL
                </div>
                <div>
                  <h5 className="text-xs font-black text-white">Lời mời PK</h5>
                  <p className="text-[11px] text-slate-400">Chưa có lời mời nào</p>
                </div>
              </div>

              <button
                onClick={() => router.push("/pk")}
                className="w-full py-2.5 rounded-2xl bg-[#ff5252] hover:bg-[#e04545] text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                Tạo trận PK
              </button>
            </div>
          </aside>
        </div>

      {/* PK MODALS */}
      <PKCreateRoomModal
        isOpen={showCreatePKModal}
        onClose={() => setShowCreatePKModal(false)}
        subjects={MOCK_PK_SUBJECTS}
        onCreateRoom={handleCreateRoom}
      />

      <PKJoinCodeModal
        isOpen={showJoinPKCodeModal}
        onClose={() => setShowJoinPKCodeModal(false)}
        onJoinCode={handleJoinByCode}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1b2234] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <CuBongChatModal
        isOpen={showCuBongModal}
        onClose={() => setShowCuBongModal(false)}
        onRewardCoins={handleRewardCoins}
      />

      <PKBattleModal
        isOpen={showPKModal}
        onClose={() => {
          setShowPKModal(false);
          setIsBotBattle(false);
        }}
        onRewardCoins={handleRewardCoins}
        isBotPractice={isBotBattle}
        botDifficulty={currentBotDifficulty}
        practiceSubject={currentPracticeSubject}
        onSaveHistory={(entry) => setPkHistory((prev) => [entry, ...prev])}
      />
    </div>
  );
}
