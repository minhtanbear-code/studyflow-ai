"use client";

import React from "react";
import { Clock, Eye, HelpCircle, Lock, Play, Shield, Swords, User, Users } from "lucide-react";
import { PKRoom } from "@/core/domain/pk.types";

interface PKRoomCardProps {
  room: PKRoom;
  onJoin: (room: PKRoom) => void;
}

export function PKRoomCard({ room, onJoin }: PKRoomCardProps) {
  const isWaiting = room.status === "waiting";
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E8E4F3] shadow-sm hover:border-[#7C3AED] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 group">
      {/* Top Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#7C3AED]">
              {room.roomCode}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#77738F]">
              {room.subjectName}
            </span>
            {room.isPrivate && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Riêng tư</span>
              </span>
            )}
          </div>

          {/* Mode Pill */}
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              room.mode === "solo"
                ? "bg-purple-100 text-purple-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {room.teamSize === "1v1" ? "Solo 1v1" : `Team ${room.teamSize}`}
          </span>
        </div>

        {/* Room Title */}
        <h4 className="text-sm font-black text-[#17133B] group-hover:text-[#7C3AED] transition-colors line-clamp-2 leading-snug">
          {room.title}
        </h4>
      </div>

      {/* Middle Specs */}
      <div className="bg-[#F8F7FC] p-2.5 rounded-xl border border-[#E8E4F3] flex items-center justify-between text-[11px] text-[#77738F]">
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Host: <strong className="text-[#17133B]">{room.hostName}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#77738F]" />
            <span>{room.questionsCount} câu</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#77738F]" />
            <span>{room.durationMinutes}p</span>
          </span>
        </div>
      </div>

      {/* Footer: Players & Action */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
        {/* Players Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs font-black text-[#17133B]">
            <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>
              {room.currentPlayers}/{room.maxPlayers}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isWaiting
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isWaiting ? "Đang chờ đấu" : "Đang thi đấu"}
          </span>
        </div>

        {/* Action Button */}
        {isWaiting && !isFull ? (
          <button
            onClick={() => onJoin(room)}
            className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm shadow-purple-200 active:scale-95 transition-all"
          >
            <Swords className="w-3.5 h-3.5 text-[#EDE9FE]" />
            <span>Vào đấu</span>
          </button>
        ) : (
          <button
            onClick={() => onJoin(room)}
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-[#77738F] hover:bg-slate-200 active:scale-95 transition-all"
          >
            <Eye className="w-3 h-3" />
            <span>Xem trận</span>
          </button>
        )}
      </div>
    </div>
  );
}
