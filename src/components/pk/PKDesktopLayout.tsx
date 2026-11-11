"use client";

import React, { useState } from "react";
import { PKLeftSidebar } from "./PKLeftSidebar";
import { PKCentralArea } from "./PKCentralArea";
import { PKRightSidebar } from "./PKRightSidebar";
import { PKCreateRoomModal } from "./PKCreateRoomModal";
import { PKJoinCodeModal } from "./PKJoinCodeModal";
import {
  MOCK_PK_HISTORY,
  MOCK_PK_LEADERBOARD,
  MOCK_PK_PROGRESS,
  MOCK_PK_RECOMMENDATIONS,
  MOCK_PK_ROOMS,
  MOCK_PK_SUBJECTS,
  MOCK_PK_USER_STATS,
} from "@/core/data/mockPkData";
import { PKRoom, PKStudyRecommendation } from "@/core/domain/pk.types";
import { Sparkles, X } from "lucide-react";

export function PKDesktopLayout() {
  const [rooms, setRooms] = useState<PKRoom[]>(MOCK_PK_ROOMS);
  const [myRooms, setMyRooms] = useState<PKRoom[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [mockNotice, setMockNotice] = useState<string | null>(null);

  const handleShowMockToast = (msg: string) => {
    setMockNotice(msg);
    setTimeout(() => {
      setMockNotice(null);
    }, 4000);
  };

  const handleCreateRoom = (newRoom: PKRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setMyRooms((prev) => [newRoom, ...prev]);
    handleShowMockToast(`🎉 Tạo phòng [${newRoom.roomCode}] "${newRoom.title}" thành công! (Mock Interaction)`);
  };

  const handleJoinCode = (code: string): boolean => {
    const found = rooms.find((r) => r.roomCode.toUpperCase() === code.toUpperCase());
    if (found) {
      handleShowMockToast(`⚔️ Đang vào phòng [${found.roomCode}] "${found.title}"... (Mock Interaction)`);
      return true;
    }
    return false;
  };

  const handleJoinRoom = (room: PKRoom) => {
    handleShowMockToast(`⚔️ Đang tham gia phòng [${room.roomCode}] "${room.title}"... (Mock Interaction)`);
  };

  const handleSelectRecommendation = (rec: PKStudyRecommendation) => {
    handleShowMockToast(`🎯 Đang mở đề xuất ôn tập: "${rec.topic}" - ${rec.suggestedAction} (Mock Interaction)`);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* Top Banner Notice for Approved Design System */}
      <div className="bg-[#17133B] text-white px-4 py-2 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
          <span className="font-bold">STUDYFLOW AI • DESKTOP PK MODULE (PHASE 1)</span>
          <span className="hidden sm:inline-block text-[10px] text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800">
            DESKTOP PK APPROVED LAYOUT PRESERVED
          </span>
        </div>

        <div className="text-[11px] text-purple-200 font-medium">
          Phong cách: Purple & White (#7C3AED / #EDE9FE)
        </div>
      </div>

      {/* Floating Mock Action Toast */}
      {mockNotice && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#7C3AED] text-white px-5 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
          <span>{mockNotice}</span>
          <button onClick={() => setMockNotice(null)} className="ml-2 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3-COLUMN MASTER DESKTOP LAYOUT (BẮT BUỘC GIỮ NGUYÊN)      */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-36px)]">
        {/* A. LEFT SIDEBAR */}
        <PKLeftSidebar activeNav="pk" />

        {/* B. CENTRAL CONTENT AREA */}
        <PKCentralArea
          rooms={rooms}
          subjects={MOCK_PK_SUBJECTS}
          history={MOCK_PK_HISTORY}
          myRooms={myRooms}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenJoinCodeModal={() => setIsJoinCodeModalOpen(true)}
          onJoinRoom={handleJoinRoom}
          onStartBotPractice={(diff, sub) => {
            handleShowMockToast(`🤖 Khởi động Practice Battle với Bot (${diff.toUpperCase()}) - ${sub}! (0 XP, ±0 Rating)`);
          }}
        />

        {/* C. RIGHT SIDEBAR */}
        <PKRightSidebar
          userStats={MOCK_PK_USER_STATS}
          leaderboard={MOCK_PK_LEADERBOARD}
          progress={MOCK_PK_PROGRESS}
          recommendations={MOCK_PK_RECOMMENDATIONS}
          onSelectRecommendation={handleSelectRecommendation}
        />
      </div>

      {/* Modals */}
      <PKCreateRoomModal
        isOpen={isCreateModalOpen}
        subjects={MOCK_PK_SUBJECTS}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      <PKJoinCodeModal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        onJoinCode={handleJoinCode}
      />
    </div>
  );
}
