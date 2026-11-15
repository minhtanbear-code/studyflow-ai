"use client";

import React from "react";
import { Radio, Check, X, Sparkles, BookOpen, Clock } from "lucide-react";
import { VoiceInvitation } from "@/core/services/voiceRealtimeService";

interface PKIncomingInviteModalProps {
  invitation: VoiceInvitation | null;
  onAccept: (invitation: VoiceInvitation) => void;
  onDecline: (invitation: VoiceInvitation) => void;
}

export function PKIncomingInviteModal({
  invitation,
  onAccept,
  onDecline,
}: PKIncomingInviteModalProps) {
  if (!invitation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#7C3AED]/40 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#7C3AED]" />
            <span>LỜI MỜI HỌC VOICE 1 VS 1</span>
          </div>
          <span className="text-[11px] font-bold text-[#77738F] bg-slate-100 px-2 py-0.5 rounded-md">
            Mã: {invitation.room_code}
          </span>
        </div>

        {/* Sender Info */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAF8FF] border border-[#EDE9FE]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
            {invitation.sender_avatar || invitation.sender_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-[#17133B] truncate">
              {invitation.sender_name}
            </h3>
            <p className="text-xs text-[#77738F]">Đang chờ bạn tham gia ôn tập chung</p>
          </div>
        </div>

        {/* Subject & Quiz details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#77738F] flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
              Môn học:
            </span>
            <span className="font-bold text-[#17133B]">{invitation.subject_name}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[#77738F] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Quy mô:
            </span>
            <span className="font-bold text-[#17133B]">
              {invitation.question_count || 10} câu trắc nghiệm
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#77738F] text-center italic">
          Bấm "Chấp nhận" để cùng vào phòng học thoại trực tiếp và giải đề trắc nghiệm!
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => onDecline(invitation)}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-500" />
            <span>Từ chối</span>
          </button>

          <button
            onClick={() => onAccept(invitation)}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
            <span>Chấp nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
}
