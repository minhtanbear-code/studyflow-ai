"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { ImprovementRoadmap, StudentProfile } from "@/core/domain/academic.types";
import { generateImprovementRoadmap } from "@/core/services/roadmapGenerator.service";
import { calculateCumulativeCpa } from "@/core/services/academicCalculator.service";

interface RoadmapTabProps {
  profile: StudentProfile;
  onNavigateTab: (tabId: string) => void;
}

export function RoadmapTab({ profile, onNavigateTab }: RoadmapTabProps) {
  const { cpa4 } = calculateCumulativeCpa(profile.semesters);

  const defaultTarget = cpa4 < 2.0 ? 2.5 : cpa4 < 2.8 ? 3.2 : 3.6;
  const [targetCpa, setTargetCpa] = useState<number>(defaultTarget);
  const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>({ 1: true });
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [tutoringRequested, setTutoringRequested] = useState(false);

  const roadmap: ImprovementRoadmap = generateImprovementRoadmap(profile, targetCpa);

  const toggleWeekCheck = (weekNum: number) => {
    setCompletedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }));
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner: Goal Setting */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20">
              Lộ trình Cải thiện Cá nhân hóa
            </span>
            <span className="text-xs font-semibold text-indigo-200">Kế hoạch phục hồi</span>
          </div>

          <h3 className="text-base font-black mt-1 leading-snug">
            Mục tiêu CPA: Kéo điểm lên {targetCpa.toFixed(2)}/4.00
          </h3>

          <p className="text-xs text-indigo-200 mt-1">
            Hiện tại: <strong>{cpa4.toFixed(2)}</strong> &rarr; Mục tiêu xếp loại:{" "}
            <strong className="text-amber-300">{roadmap.targetClassification}</strong>
          </p>

          {/* Interactive Target CPA Slider */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Điều chỉnh mục tiêu:</span>
              <strong className="text-amber-300 text-sm">{targetCpa.toFixed(2)} / 4.00</strong>
            </div>
            <input
              type="range"
              min="2.0"
              max="3.8"
              step="0.1"
              value={targetCpa}
              onChange={(e) => setTargetCpa(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-indigo-950/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-indigo-300 mt-1">
              <span>2.0 (TB)</span>
              <span>2.5 (Khá)</span>
              <span>3.2 (Giỏi)</span>
              <span>3.6 (Xuất sắc)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retake Priority List (ROI Optimization) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Môn ưu tiên học lại / cải thiện điểm (ROI Cao nhất)</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            {roadmap.retakeCoursesPlan.length} môn
          </span>
        </div>

        {roadmap.retakeCoursesPlan.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tuyệt vời! Không có môn học nào bị điểm D hoặc F cần phải học lại.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {roadmap.retakeCoursesPlan.map((plan) => (
              <div
                key={plan.courseId}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{plan.courseName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({plan.credits} TC)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                      Điểm: {plan.currentLetter}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      Mục tiêu: {plan.targetLetter}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">{plan.reason}</p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Mức tăng CPA ước tính:</span>
                  <span className="font-black text-emerald-600">+{plan.expectedCpaIncrease} điểm CPA</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Semester Course Registration Strategy */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Kế hoạch đăng ký tín chỉ học kỳ tới</span>
          </h4>
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {roadmap.nextSemesterPlan.recommendedCredits} Tín chỉ
          </span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Trọng tâm: {roadmap.nextSemesterPlan.focusArea}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Ngưỡng an toàn: {roadmap.nextSemesterPlan.maxStressThreshold}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-600">Khuyến nghị phân bổ môn:</div>
          {roadmap.nextSemesterPlan.suggestedCourses.map((cName, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{cName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Week Study Sprint Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Sprint hành động vi mô 4 tuần (Study Sprint)</span>
          </h4>
          <span className="text-[11px] text-slate-400">Phương pháp chủ động</span>
        </div>

        <div className="space-y-2.5">
          {roadmap.weeklyActions.map((week) => {
            const isDone = !!completedWeeks[week.week];
            return (
              <div
                key={week.week}
                className={`p-3 rounded-xl border transition-all ${
                  isDone
                    ? "bg-slate-50/80 border-slate-200 opacity-80"
                    : "bg-white border-indigo-100 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWeekCheck(week.week)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-300 text-transparent hover:border-indigo-500"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`text-xs font-bold ${
                        isDone ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      Tuần {week.week}: {week.title}
                    </span>
                  </div>
                </div>

                <div className="pl-7 space-y-1">
                  {week.actionItems.map((item, aIdx) => (
                    <div key={aIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Support Interventions (Bám sát Chủ đề 1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          <span>Giải pháp can thiệp & Kết nối hỗ trợ số</span>
        </h4>

        <div className="space-y-2.5">
          {/* Card 1: CVHT */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đặt lịch Cố vấn học tập (CVHT)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tư vấn cá nhân hóa, đơn xin giảm tải môn học
              </div>
            </div>
            <button
              onClick={() => setAppointmentBooked(true)}
              disabled={appointmentBooked}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                appointmentBooked
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              }`}
            >
              {appointmentBooked ? "Đã đặt lịch" : "Đặt lịch"}
            </button>
          </div>

          {/* Card 2: Peer Tutoring */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span>Ghép đôi Trợ giảng đồng cấp</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kèm 1-1 miễn phí từ sinh viên giỏi khóa trên
              </div>
            </div>
            <button
              onClick={() => setTutoringRequested(true)}
              disabled={tutoringRequested}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                tutoringRequested
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
              }`}
            >
              {tutoringRequested ? "Đã gửi yêu cầu" : "Tìm gia sư"}
            </button>
          </div>

          {/* Card 3: Ask AI */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chat với Trợ lý AI Cố vấn</span>
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                Giải đáp quy chế, phân tích từng môn học vụ
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("ai")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm"
            >
              Mở chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
