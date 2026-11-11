"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  BookX,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gauge,
  HelpCircle,
  Layers,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  UserCheck,
  Wifi,
} from "lucide-react";
import { EarlyWarningAnalysis, StudentProfile } from "@/core/domain/academic.types";
import { calculateCumulativeCpa } from "@/core/services/academicCalculator.service";

interface EarlyWarningTabProps {
  profile: StudentProfile;
  warningAnalysis: EarlyWarningAnalysis;
  onUpdateEngagement: (lmsRate: number, assignmentRate: number, attendanceRate: number) => void;
  onNavigateTab: (tabId: string) => void;
}

export function EarlyWarningTab({
  profile,
  warningAnalysis,
  onUpdateEngagement,
  onNavigateTab,
}: EarlyWarningTabProps) {
  const { cpa4, passedCredits, debtCredits } = calculateCumulativeCpa(profile.semesters);
  const [showSimulateSlider, setShowSimulateSlider] = useState(false);

  // Engagement sliders state
  const [lmsRate, setLmsRate] = useState(profile.digitalEngagement.lmsAccessRate);
  const [assignmentRate, setAssignmentRate] = useState(profile.digitalEngagement.assignmentOnTimeRate);
  const [attendanceRate, setAttendanceRate] = useState(profile.digitalEngagement.attendanceRate);

  const handleSliderChange = (type: "lms" | "assign" | "attend", val: number) => {
    let newLms = lmsRate;
    let newAssign = assignmentRate;
    let newAttend = attendanceRate;

    if (type === "lms") {
      newLms = val;
      setLmsRate(val);
    } else if (type === "assign") {
      newAssign = val;
      setAssignmentRate(val);
    } else {
      newAttend = val;
      setAttendanceRate(val);
    }

    onUpdateEngagement(newLms, newAssign, newAttend);
  };

  const getStatusBadge = (status: "good" | "moderate" | "critical") => {
    switch (status) {
      case "critical":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Báo động</span>;
      case "moderate":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Cần lưu ý</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Tốt / An toàn</span>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-rose-600";
    if (score >= 45) return "text-amber-600";
    if (score >= 25) return "text-yellow-600";
    return "text-emerald-600";
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Banner: Academic Warning Status */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Phân tích cảnh báo sớm học vụ</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Chuẩn đề tài số 1</span>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <div
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
              warningAnalysis.riskScore >= 70
                ? "bg-rose-500 text-white"
                : warningAnalysis.riskScore >= 45
                ? "bg-amber-500 text-white"
                : warningAnalysis.riskScore >= 25
                ? "bg-yellow-400 text-slate-900"
                : "bg-emerald-500 text-white"
            }`}
          >
            <span className="text-lg leading-none">{warningAnalysis.riskScore}%</span>
            <span className="text-[9px] font-semibold mt-0.5">RỦI RO</span>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 leading-snug">
              {warningAnalysis.academicWarningStatus}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Mức độ nguy cơ:{" "}
              <strong className={getRiskColor(warningAnalysis.riskScore)}>
                {warningAnalysis.riskLevel === "danger"
                  ? "Nguy hiểm - Cần can thiệp khẩn"
                  : warningAnalysis.riskLevel === "warning"
                  ? "Nguy cơ cao - Cảnh báo học vụ"
                  : warningAnalysis.riskLevel === "notice"
                  ? "Cần chú ý cải thiện"
                  : "An toàn tuyệt đối"}
              </strong>
            </p>
          </div>
        </div>

        {/* Visual Risk Gauge Meter */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Thanh đo nguy cơ (Risk Meter):</span>
            <span className={getRiskColor(warningAnalysis.riskScore)}>
              {warningAnalysis.riskScore} / 100 điểm
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-1/4" title="An toàn (0-25%)" />
            <div className="h-full bg-yellow-400 w-1/4" title="Lưu ý (26-50%)" />
            <div className="h-full bg-amber-500 w-1/4" title="Cảnh báo (51-75%)" />
            <div className="h-full bg-rose-500 w-1/4" title="Nguy hiểm (76-100%)" />
          </div>
          <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-1">
            <span>0% An toàn</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% Thôi học</span>
          </div>
        </div>
      </div>

      {/* 4 Core Indicators Accordion/Cards (Bám sát Chủ đề 1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>4 Nhóm chỉ báo rủi ro cốt lõi</span>
          </h4>
          <span className="text-[11px] text-slate-400">Trọng số AI</span>
        </div>

        {warningAnalysis.indicators.map((ind, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900">{ind.name}</span>
              </div>
              {getStatusBadge(ind.status)}
            </div>

            <p className="text-xs text-slate-600 font-medium pl-7">{ind.description}</p>

            <div className="pl-7 pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50">
              <span className="italic">{ind.details}</span>
              <span className="font-bold text-indigo-600 shrink-0 ml-2">
                {(ind.weight * 100).toFixed(0)}% trọng số
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Digital Engagement Interactive Simulator */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 rounded-2xl p-4 border border-indigo-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-indigo-950">
              Mô phỏng tác động Tương tác số LMS
            </h4>
          </div>
          <button
            onClick={() => setShowSimulateSlider(!showSimulateSlider)}
            className="text-[11px] font-bold text-indigo-600 underline"
          >
            {showSimulateSlider ? "Thu gọn" : "Thử nghiệm"}
          </button>
        </div>

        <p className="text-xs text-indigo-900 leading-relaxed">
          Nghiên cứu Learning Analytics chỉ ra rằng tăng 20% tương tác số trên LMS giúp giảm 45% nguy cơ trượt môn.
        </p>

        {showSimulateSlider && (
          <div className="space-y-3 pt-2 animate-in fade-in duration-150">
            {/* Slider 1: LMS Access */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>Tần suất vào LMS xem bài giảng:</span>
                <strong className="text-indigo-600">{lmsRate}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={lmsRate}
                onChange={(e) => handleSliderChange("lms", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Slider 2: On-time Assignments */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>Nộp bài tập đúng hạn:</span>
                <strong className="text-indigo-600">{assignmentRate}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={assignmentRate}
                onChange={(e) => handleSliderChange("assign", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Slider 3: Attendance */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>Điểm danh chuyên cần lớp học:</span>
                <strong className="text-indigo-600">{attendanceRate}%</strong>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={attendanceRate}
                onChange={(e) => handleSliderChange("attend", parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommended Interventions CTA */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Biện pháp can thiệp khuyến nghị từ AI</span>
        </h4>

        <div className="space-y-2">
          {warningAnalysis.recommendedInterventions.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigateTab("roadmap")}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Khởi tạo Lộ trình học cải thiện</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
