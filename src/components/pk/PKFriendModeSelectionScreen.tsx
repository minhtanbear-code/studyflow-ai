"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Headphones,
  Info,
  KeyRound,
  Mic,
  Radio,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import { PKSubject } from "@/core/domain/pk.types";

interface PKFriendModeSelectionScreenProps {
  subject: PKSubject;
  onBack: () => void;
  onSelectFriendMode?: (mode: "competition" | "voice") => void;
  onOpenJoinCode?: () => void;
}

export function PKFriendModeSelectionScreen({
  subject,
  onBack,
  onSelectFriendMode,
  onOpenJoinCode,
}: PKFriendModeSelectionScreenProps) {
  const [selectedSubMode, setSelectedSubMode] = useState<"competition" | "voice" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectMode = (mode: "competition" | "voice", title: string) => {
    setSelectedSubMode(mode);
    setToastMessage(`Bạn đã chọn chế độ "${title}". Tính năng sẽ được kích hoạt ở giai đoạn tiếp theo.`);
    if (onSelectFriendMode) {
      onSelectFriendMode(mode);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: BRAND, STEP FLOW & BACK NAVIGATION         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại chọn hình thức"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại</span>
          </button>

          {/* STUDYFLOW AI Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="flex items-baseline">
                <span className="text-sm font-black tracking-tight text-[#17133B]">STUDYFLOW</span>
                <span className="text-sm font-black text-[#7C3AED] ml-1">AI</span>
              </div>
              <span className="text-[10px] text-[#77738F] font-bold tracking-wide">
                PK • Đấu trí học tập
              </span>
            </div>
          </Link>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* Step 1: Completed */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[100px]">{subject.name}</span>
          </div>

          <div className="w-3 h-0.5 bg-[#E8E4F3] hidden lg:block" />

          {/* Step 2: Completed */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
            title="Quay lại Bước 2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ôn tập với bạn bè</span>
          </button>

          <div className="w-3 h-0.5 bg-[#E8E4F3] hidden sm:block" />

          {/* Step 3: Active */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
              3
            </span>
            <span className="font-bold">Chọn chế độ</span>
          </div>
        </div>
      </header>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#17133B] text-white px-5 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA: 2 LARGE CARDS                       */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* CONTEXT BANNER: SUBJECT & STUDY METHOD */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4F3] shadow-xs text-xs">
            <span className="text-sm">{subject.icon}</span>
            <span className="text-[#77738F]">Môn học:</span>
            <strong className="text-[#17133B]">{subject.name}</strong>
            <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.2 rounded-md">
              {subject.code}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8FF] border border-[#7C3AED]/30 shadow-xs text-xs">
            <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-[#77738F]">Hình thức:</span>
            <strong className="text-[#7C3AED]">Ôn tập với bạn bè</strong>
          </div>
        </div>

        {/* HERO TITLE & SUPPORTING DESCRIPTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 animate-in fade-in slide-in-from-top-3 duration-300 delay-75">
          <h1 className="text-3xl sm:text-4xl font-black text-[#17133B] tracking-tight">
            Bạn muốn chọn chế độ nào?
          </h1>

          <p className="text-sm sm:text-base text-[#77738F] font-medium leading-relaxed">
            Chọn cách ôn tập phù hợp để học hiệu quả và thú vị hơn cùng bạn bè.
          </p>
        </div>

        {/* JOIN BY CODE PROMINENT BANNER */}
        {onOpenJoinCode && (
          <div className="max-w-3xl mx-auto w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/80 rounded-2xl p-4 sm:p-5 border-2 border-dashed border-[#7C3AED]/30 hover:border-[#7C3AED] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-inner">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-[#17133B] flex items-center gap-2">
                    <span>Bạn đã có mã phòng từ bạn bè?</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                      Vào nhanh
                    </span>
                  </div>
                  <div className="text-xs text-[#77738F] font-medium mt-0.5">
                    Nhập mã (VD: <code className="font-mono font-bold text-[#7C3AED]">VH-1024</code>) để vào ngay phòng học hoặc thi đấu
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenJoinCode}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Nhập mã phòng</span>
              </button>
            </div>
          </div>
        )}

        {/* TWO STUDY MODE CARDS (Arranged horizontally on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto w-full">
          {/* ======================================================= */}
          {/* CARD 1 – THI ĐẤU                                        */}
          {/* ======================================================= */}
          <div
            onClick={() => handleSelectMode("competition", "Thi đấu")}
            className={`group relative bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-2xl hover:-translate-y-1.5 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-3 ${
              selectedSubMode === "competition"
                ? "border-[#7C3AED] ring-4 ring-[#EDE9FE] bg-[#FAF8FF] shadow-purple-100"
                : "border-[#E8E4F3] hover:border-[#7C3AED]/70"
            }`}
          >
            <div>
              {/* Card Illustration: Two university students competing in friendly challenge */}
              <div className="w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-amber-50 via-purple-50/50 to-indigo-50 border border-[#E8E4F3] mb-6 overflow-hidden relative flex items-center justify-center p-4">
                {/* Background decorative elements */}
                <div className="absolute top-3 left-4 w-12 h-12 rounded-full bg-amber-200/40 blur-xl pointer-events-none" />
                <div className="absolute bottom-3 right-4 w-16 h-16 rounded-full bg-purple-300/30 blur-xl pointer-events-none" />

                {/* SVG Illustration: Friendly 1 vs 1 PK Knowledge Battle */}
                <svg
                  className="w-full h-full max-h-40 transition-transform duration-300 group-hover:scale-105"
                  viewBox="0 0 320 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Table/Desk Base */}
                  <rect x="30" y="125" width="260" height="8" rx="4" fill="#E8E4F3" />
                  <line x1="80" y1="133" x2="80" y2="155" stroke="#D5D0E6" strokeWidth="4" strokeLinecap="round" />
                  <line x1="240" y1="133" x2="240" y2="155" stroke="#D5D0E6" strokeWidth="4" strokeLinecap="round" />

                  {/* Student Left (Challenger 1) */}
                  <g className="transition-transform group-hover:translate-x-1 duration-300">
                    <circle cx="70" cy="55" r="20" fill="#7C3AED" />
                    <circle cx="70" cy="50" r="14" fill="#FDE68A" />
                    {/* Hair */}
                    <path d="M58 48 C60 38, 80 38, 82 48 C78 44, 62 44, 58 48 Z" fill="#4B5563" />
                    {/* Body/Shirt */}
                    <path d="M50 115 C50 90, 90 90, 90 115 Z" fill="#6D28D9" />
                    {/* Laptop / Question Sheet */}
                    <rect x="75" y="95" width="30" height="20" rx="3" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
                    <line x1="80" y1="102" x2="95" y2="102" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
                    <line x1="80" y1="108" x2="98" y2="108" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Center "VS" Badge with lightning */}
                  <g className="animate-pulse">
                    <circle cx="160" cy="85" r="22" fill="#F59E0B" />
                    <circle cx="160" cy="85" r="18" fill="#FBBF24" />
                    <text x="160" y="91" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="900" fontFamily="sans-serif">
                      VS
                    </text>
                    {/* Lightning flashes */}
                    <path d="M158 52 L163 60 L159 62 L164 70 L158 64 L161 62 Z" fill="#F59E0B" />
                  </g>

                  {/* Student Right (Challenger 2) */}
                  <g className="transition-transform group-hover:-translate-x-1 duration-300">
                    <circle cx="250" cy="55" r="20" fill="#3B82F6" />
                    <circle cx="250" cy="50" r="14" fill="#FDE68A" />
                    {/* Hair */}
                    <path d="M238 46 C242 36, 260 38, 262 48 C258 43, 243 43, 238 46 Z" fill="#1F2937" />
                    {/* Body/Shirt */}
                    <path d="M230 115 C230 90, 270 90, 270 115 Z" fill="#2563EB" />
                    {/* Laptop / Question Sheet */}
                    <rect x="215" y="95" width="30" height="20" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                    <line x1="220" y1="102" x2="235" y2="102" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                    <line x1="220" y1="108" x2="238" y2="108" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Floating Quiz Badge */}
                  <g transform="translate(142, 20)">
                    <rect x="0" y="0" width="36" height="18" rx="9" fill="#7C3AED" />
                    <text x="18" y="13" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      1 vs 1
                    </text>
                  </g>
                </svg>

                {/* Trophy Floating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-amber-200 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-800">Leo rank</span>
                </div>
              </div>

              {/* Header: Icon & Title */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#17133B] group-hover:text-[#7C3AED] transition-colors">
                      Thi đấu
                    </h2>
                    <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wide">
                      Competitive PK 1v1
                    </span>
                  </div>
                </div>

                {selectedSubMode === "competition" && (
                  <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed mb-6">
                Cùng bạn bè tranh tài kiến thức, rèn luyện tốc độ và độ chính xác.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-4 border-t border-[#E8E4F3]/70 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <Timer className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span className="font-medium text-[#77738F]">Đồng hồ đếm ngược từng câu hỏi kịch tính</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-medium text-[#77738F]">Cộng điểm thưởng tốc độ & tích lũy Rating</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <Swords className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium text-[#77738F]">Tạo phòng riêng có mã hoặc ghép ngẫu nhiên</span>
                </div>
              </div>
            </div>

            {/* Bottom Button Indicator */}
            <button
              type="button"
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                selectedSubMode === "competition"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-200"
                  : "bg-[#F8F7FC] text-[#17133B] group-hover:bg-[#7C3AED] group-hover:text-white border border-[#E8E4F3] group-hover:border-[#7C3AED]"
              }`}
            >
              <span>Vào chế độ Thi đấu</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* ======================================================= */}
          {/* CARD 2 – VOICE HỌC                                      */}
          {/* ======================================================= */}
          <div
            onClick={() => handleSelectMode("voice", "Voice học")}
            className={`group relative bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-2xl hover:-translate-y-1.5 active:scale-[0.99] animate-in fade-in slide-in-from-bottom-3 delay-100 ${
              selectedSubMode === "voice"
                ? "border-[#7C3AED] ring-4 ring-[#EDE9FE] bg-[#FAF8FF] shadow-purple-100"
                : "border-[#E8E4F3] hover:border-[#7C3AED]/70"
            }`}
          >
            <div>
              {/* Card Illustration: Two university students communicating through voice & headset */}
              <div className="w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-tr from-emerald-50 via-purple-50/50 to-blue-50 border border-[#E8E4F3] mb-6 overflow-hidden relative flex items-center justify-center p-4">
                {/* Background decorative elements */}
                <div className="absolute top-3 right-4 w-14 h-14 rounded-full bg-emerald-200/40 blur-xl pointer-events-none" />
                <div className="absolute bottom-3 left-4 w-16 h-16 rounded-full bg-purple-300/30 blur-xl pointer-events-none" />

                {/* SVG Illustration: Voice Study & Discussion */}
                <svg
                  className="w-full h-full max-h-40 transition-transform duration-300 group-hover:scale-105"
                  viewBox="0 0 320 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Audio connection wave in center */}
                  <g className="animate-pulse">
                    <rect x="135" y="75" width="4" height="18" rx="2" fill="#7C3AED" />
                    <rect x="143" y="65" width="4" height="38" rx="2" fill="#10B981" />
                    <rect x="151" y="55" width="4" height="58" rx="2" fill="#7C3AED" />
                    <rect x="159" y="50" width="4" height="68" rx="2" fill="#6366F1" />
                    <rect x="167" y="55" width="4" height="58" rx="2" fill="#10B981" />
                    <rect x="175" y="65" width="4" height="38" rx="2" fill="#7C3AED" />
                    <rect x="183" y="75" width="4" height="18" rx="2" fill="#10B981" />
                  </g>

                  {/* Student Left (With Headset & Speaking Bubble) */}
                  <g className="transition-transform group-hover:scale-105 origin-left duration-300">
                    <circle cx="70" cy="65" r="22" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
                    <circle cx="70" cy="60" r="14" fill="#FDE68A" />
                    {/* Headset Arc */}
                    <path d="M52 60 C52 44, 88 44, 88 60" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <rect x="50" y="56" width="6" height="12" rx="3" fill="#7C3AED" />
                    <rect x="84" y="56" width="6" height="12" rx="3" fill="#7C3AED" />
                    {/* Headset Mic */}
                    <path d="M84 64 L74 74" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="72" cy="76" r="3" fill="#10B981" />
                    {/* Body */}
                    <path d="M50 125 C50 100, 90 100, 90 125 Z" fill="#8B5CF6" />

                    {/* Speech Bubble Left */}
                    <g transform="translate(30, 15)">
                      <rect x="0" y="0" width="55" height="22" rx="11" fill="#FFFFFF" stroke="#E8E4F3" strokeWidth="1.5" />
                      <text x="27" y="14" textAnchor="middle" fill="#7C3AED" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                        Định khoản?
                      </text>
                    </g>
                  </g>

                  {/* Student Right (Listening & Responding) */}
                  <g className="transition-transform group-hover:scale-105 origin-right duration-300">
                    <circle cx="250" cy="65" r="22" fill="#D1FAE5" stroke="#10B981" strokeWidth="2" />
                    <circle cx="250" cy="60" r="14" fill="#FDE68A" />
                    {/* Headset Arc */}
                    <path d="M232 60 C232 44, 268 44, 268 60" stroke="#10B981" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <rect x="230" y="56" width="6" height="12" rx="3" fill="#10B981" />
                    <rect x="264" y="56" width="6" height="12" rx="3" fill="#10B981" />
                    {/* Headset Mic */}
                    <path d="M236 64 L246 74" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="248" cy="76" r="3" fill="#7C3AED" />
                    {/* Body */}
                    <path d="M230 125 C230 100, 270 100, 270 125 Z" fill="#10B981" />

                    {/* Speech Bubble Right */}
                    <g transform="translate(235, 15)">
                      <rect x="0" y="0" width="55" height="22" rx="11" fill="#FFFFFF" stroke="#E8E4F3" strokeWidth="1.5" />
                      <text x="27" y="14" textAnchor="middle" fill="#10B981" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                        Nợ TK 111!
                      </text>
                    </g>
                  </g>
                </svg>

                {/* Mic Floating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black text-emerald-800">Voice 1v1 Live</span>
                </div>
              </div>

              {/* Header: Icon & Title */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#17133B] group-hover:text-[#7C3AED] transition-colors">
                      Voice học
                    </h2>
                    <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wide">
                      Collaborative Voice Study
                    </span>
                  </div>
                </div>

                {selectedSubMode === "voice" && (
                  <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#77738F] font-medium leading-relaxed mb-6">
                Ôn tập qua trò chuyện thoại, thảo luận và giải thích kiến thức cùng bạn bè.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-4 border-t border-[#E8E4F3]/70 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-[#77738F]">Voice chat độ trễ thấp, đàm thoại mượt mà</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <BookOpen className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span className="font-medium text-[#77738F]">Cùng xem chung bộ câu hỏi & phân tích đáp án</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#17133B]">
                  <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-[#77738F]">Học nhóm đôi thoải mái, không áp lực điểm số</span>
                </div>
              </div>
            </div>

            {/* Bottom Button Indicator */}
            <button
              type="button"
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                selectedSubMode === "voice"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-200"
                  : "bg-[#F8F7FC] text-[#17133B] group-hover:bg-[#7C3AED] group-hover:text-white border border-[#E8E4F3] group-hover:border-[#7C3AED]"
              }`}
            >
              <span>Vào phòng Voice học</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* BOTTOM HELPER NOTE */}
        <div className="text-center mt-10">
          <p className="text-xs text-[#77738F] font-medium inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>
              Cả hai chế độ đều áp dụng trực tiếp cho học phần{" "}
              <strong className="text-[#17133B]">{subject.name}</strong>.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
