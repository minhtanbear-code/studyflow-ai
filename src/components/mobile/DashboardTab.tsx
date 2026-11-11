"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Wifi,
} from "lucide-react";
import { EarlyWarningAnalysis, StudentProfile } from "@/core/domain/academic.types";
import { calculateCumulativeCpa } from "@/core/services/academicCalculator.service";

interface DashboardTabProps {
  profile: StudentProfile;
  warningAnalysis: EarlyWarningAnalysis;
  onNavigateTab: (tabId: string) => void;
}

export function DashboardTab({ profile, warningAnalysis, onNavigateTab }: DashboardTabProps) {
  const { cpa4, cpa10, passedCredits, debtCredits } = calculateCumulativeCpa(profile.semesters);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "danger":
        return "bg-rose-500 text-white border-rose-600";
      case "warning":
        return "bg-amber-500 text-white border-amber-600";
      case "notice":
        return "bg-yellow-400 text-slate-900 border-yellow-500";
      default:
        return "bg-emerald-500 text-white border-emerald-600";
    }
  };

  const getRiskBannerStyle = (level: string) => {
    switch (level) {
      case "danger":
        return "from-rose-600 via-rose-500 to-red-600 text-white shadow-rose-200";
      case "warning":
        return "from-amber-600 via-amber-500 to-orange-600 text-white shadow-amber-200";
      case "notice":
        return "from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 shadow-yellow-200";
      default:
        return "from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-200";
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Risk Alert Hero Banner */}
      <div
        className={`rounded-2xl p-4 bg-gradient-to-br ${getRiskBannerStyle(
          warningAnalysis.riskLevel
        )} shadow-lg relative overflow-hidden`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-sm">
              Hệ thống Cảnh báo Sớm (AI)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/25">
              Học kỳ {profile.currentSemester} / Năm {profile.currentYear}
            </span>
          </div>

          <div className="flex items-start gap-3 mt-1">
            {warningAnalysis.riskLevel === "danger" || warningAnalysis.riskLevel === "warning" ? (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-black leading-tight">
                {warningAnalysis.academicWarningStatus}
              </h2>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">
                Chỉ số rủi ro học vụ:{" "}
                <span className="font-black text-sm">{warningAnalysis.riskScore}%</span> •{" "}
                {warningAnalysis.riskLevel === "danger"
                  ? "Cần can thiệp khẩn cấp để tránh đình chỉ học."
                  : warningAnalysis.riskLevel === "warning"
                  ? "Cần điều chỉnh phương pháp học và trả nợ môn."
                  : warningAnalysis.riskLevel === "notice"
                  ? "Cần lưu ý giữ vững điểm chuyên cần và ôn thi."
                  : "Tiến độ học tập an toàn, phát huy phong độ."}
              </p>
            </div>
          </div>

          {/* Action Button inside Banner */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs font-medium opacity-90">
              Dự báo tốt nghiệp: <strong>{warningAnalysis.predictedGraduationClassification}</strong>
            </span>
            <button
              onClick={() => onNavigateTab("roadmap")}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-100 transition-all active:scale-95"
            >
              <span>Xem lộ trình</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient background blur circle */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* KPI Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* CPA Score Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Điểm CPA tích lũy</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{cpa4.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
            {cpa4 >= 2.5 ? (
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Thang 10: {cpa10.toFixed(1)}
              </span>
            ) : (
              <span className="text-rose-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> Thang 10: {cpa10.toFixed(1)} (Dưới chuẩn)
              </span>
            )}
          </div>
        </div>

        {/* Credits Progress Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tín chỉ tích lũy</span>
            <BookOpen className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{passedCredits}</span>
            <span className="text-xs text-slate-400">/ {profile.totalRequiredCredits} TC</span>
          </div>
          <div className="mt-1 text-[11px]">
            {debtCredits > 0 ? (
              <span className="text-amber-600 font-semibold">Nợ {debtCredits} tín chỉ</span>
            ) : (
              <span className="text-emerald-600 font-semibold">0 môn nợ (Đạt 100%)</span>
            )}
          </div>
        </div>

        {/* LMS Engagement Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tương tác số LMS</span>
            <Wifi className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {Math.round(
                (profile.digitalEngagement.lmsAccessRate +
                  profile.digitalEngagement.assignmentOnTimeRate +
                  profile.digitalEngagement.attendanceRate) /
                  3
              )}
              %
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Chuyên cần:</span>
            <strong className="text-slate-700">{profile.digitalEngagement.attendanceRate}%</strong>
          </div>
        </div>

        {/* Projected Completion Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tiến độ ra trường</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              ~{warningAnalysis.projectedSemestersToGraduate}
            </span>
            <span className="text-xs text-slate-400">kỳ nữa</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-600 truncate font-semibold">
            Xếp loại: {warningAnalysis.predictedGraduationClassification}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-slate-100/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 border border-slate-200/60">
        <button
          onClick={() => onNavigateTab("grades")}
          className="flex-1 py-2 px-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-1 border border-slate-200/80"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tính điểm</span>
        </button>
        <button
          onClick={() => onNavigateTab("classroom")}
          className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold shadow-sm hover:bg-indigo-100 flex items-center justify-center gap-1 border border-indigo-200"
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Phòng học</span>
        </button>
        <button
          onClick={() => onNavigateTab("warning")}
          className="flex-1 py-2 px-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-1 border border-slate-200/80"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Cảnh báo</span>
        </button>
        <button
          onClick={() => onNavigateTab("ai")}
          className="flex-1 py-2 px-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-1 border border-slate-200/80"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hỏi AI</span>
        </button>
      </div>

      {/* Classroom Quick Join Card */}
      <div
        onClick={() => onNavigateTab("classroom")}
        className="cursor-pointer bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white rounded-2xl p-3.5 shadow-md hover:shadow-lg transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black">Phòng Lớp Học & Tự Học Chung</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                Mới
              </span>
            </div>
            <p className="text-[11px] text-indigo-100 mt-0.5">
              Học Pomodoro, ôn thi Giải tích & điểm danh tích lũy chuyên cần số
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
      </div>

      {/* Key Warning & Intervention Recommendation Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Điểm cần lưu ý ngay học kỳ này</span>
          </h3>
          <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer" onClick={() => onNavigateTab("warning")}>
            Chi tiết &rarr;
          </span>
        </div>

        <div className="space-y-2">
          {warningAnalysis.keyRiskFactors.slice(0, 2).map((factor, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2">Khuyến nghị can thiệp đề xuất:</h4>
          <div className="space-y-1.5">
            {warningAnalysis.recommendedInterventions.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Semesters Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Lịch sử học kỳ & Điểm số</span>
          </h3>
          <span className="text-xs text-slate-400">{profile.semesters.length} học kỳ đã học</span>
        </div>

        <div className="space-y-2.5">
          {profile.semesters.map((sem) => (
            <div
              key={sem.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{sem.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {sem.courses.length} môn học • Đạt {sem.passedCredits}/{sem.totalCredits} TC
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-indigo-600">
                  {sem.semesterGpa4.toFixed(2)}{" "}
                  <span className="text-[10px] font-normal text-slate-400">/ 4.0</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Hệ 10: {sem.semesterGpa10.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
