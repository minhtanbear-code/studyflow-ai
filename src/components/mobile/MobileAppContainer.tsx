"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Award,
  BatteryCharging,
  Bot,
  Calculator,
  ChevronDown,
  Compass,
  FileSpreadsheet,
  Gauge,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wifi,
} from "lucide-react";
import { StudentProfile, UniversityGradingConfig } from "@/core/domain/academic.types";
import { SAMPLE_PROFILES } from "@/core/data/sampleProfiles";
import { ClassroomRoom } from "@/core/domain/classroom.types";
import { INITIAL_CLASSROOMS } from "@/core/data/sampleClassrooms";
import {
  analyzeStudentEarlyWarning,
  UNIVERSITY_PRESETS,
} from "@/core/services/academicCalculator.service";
import { DashboardTab } from "./DashboardTab";
import { GradeCalculatorTab } from "./GradeCalculatorTab";
import { EarlyWarningTab } from "./EarlyWarningTab";
import { RoadmapTab } from "./RoadmapTab";
import { AIAdvisorTab } from "./AIAdvisorTab";
import { ClassroomListTab } from "./ClassroomListTab";
import { ClassroomDetailView } from "./ClassroomDetailView";

interface MobileAppContainerProps {
  defaultFrameMode?: boolean;
}

export function MobileAppContainer({ defaultFrameMode = true }: MobileAppContainerProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "grades" | "classroom" | "warning" | "roadmap" | "ai"
  >("dashboard");
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(defaultFrameMode);

  // Current active student profile
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>("at_risk_student");
  const [profile, setProfile] = useState<StudentProfile>(SAMPLE_PROFILES.at_risk_student);

  // Active grading config
  const [activePresetId, setActivePresetId] = useState<string>("standard_moet");
  const activeGradingConfig: UniversityGradingConfig =
    UNIVERSITY_PRESETS[activePresetId] || UNIVERSITY_PRESETS.standard_moet;

  // Classroom State
  const [rooms, setRooms] = useState<ClassroomRoom[]>(INITIAL_CLASSROOMS);
  const [activeRoom, setActiveRoom] = useState<ClassroomRoom | null>(null);
  const [attendanceAlert, setAttendanceAlert] = useState<string | null>(null);

  // Handle switching sample profiles
  const handleSwitchProfile = (key: string) => {
    setSelectedProfileKey(key);
    const p = SAMPLE_PROFILES[key];
    if (p) {
      setProfile(JSON.parse(JSON.stringify(p)));
    }
  };

  // Handle digital engagement sliders update
  const handleUpdateEngagement = (lmsRate: number, assignmentRate: number, attendanceRate: number) => {
    setProfile((prev) => ({
      ...prev,
      digitalEngagement: {
        lmsAccessRate: lmsRate,
        assignmentOnTimeRate: assignmentRate,
        attendanceRate: attendanceRate,
      },
    }));
  };

  // Perform early warning analysis on current profile state
  const warningAnalysis = analyzeStudentEarlyWarning(profile, activeGradingConfig);

  // Classroom handlers
  const handleSelectRoom = (room: ClassroomRoom) => {
    setActiveRoom(room);
    setActiveTab("classroom");
  };

  const handleCreateRoom = (newRoom: ClassroomRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setActiveTab("classroom");

    // Bonus digital engagement for creating a study room
    setProfile((prev) => ({
      ...prev,
      digitalEngagement: {
        ...prev.digitalEngagement,
        lmsAccessRate: Math.min(100, prev.digitalEngagement.lmsAccessRate + 5),
      },
    }));
  };

  const handleJoinByCode = (code: string): boolean => {
    const found = rooms.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (found) {
      // Check if user already joined, if not add
      const isAlreadyIn = found.activeMembers.some((m) => m.id === profile.id);
      let updatedRoom = found;
      if (!isAlreadyIn) {
        updatedRoom = {
          ...found,
          activeMembers: [
            ...found.activeMembers,
            {
              id: profile.id,
              name: profile.name,
              role: "student",
              status: "focusing",
              goal: "Học tập cùng lớp",
              joinedAt: "Vừa xong",
              isCurrentUser: true,
            },
          ],
          onlineCount: found.onlineCount + 1,
        };
        setRooms((prev) => prev.map((r) => (r.id === found.id ? updatedRoom : r)));
      }
      setActiveRoom(updatedRoom);
      setActiveTab("classroom");
      return true;
    }
    return false;
  };

  const handleUpdateRoom = (updated: ClassroomRoom) => {
    setActiveRoom(updated);
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAttendanceChecked = () => {
    // Tự động cộng tỷ lệ chuyên cần & LMS access rate cho sinh viên (+5%)
    setProfile((prev) => ({
      ...prev,
      digitalEngagement: {
        ...prev.digitalEngagement,
        attendanceRate: Math.min(100, prev.digitalEngagement.attendanceRate + 6),
        lmsAccessRate: Math.min(100, prev.digitalEngagement.lmsAccessRate + 5),
      },
    }));

    setAttendanceAlert("🎉 Đã điểm danh lớp học! Điểm chuyên cần và tương tác số của bạn đã tăng thêm +6%!");
    setTimeout(() => setAttendanceAlert(null), 4000);
  };

  // Current time for phone status bar (client-side only to avoid hydration mismatch)
  const [currentTime, setCurrentTime] = useState<string>("08:00");
  useEffect(() => {
    setCurrentTime(
      new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 py-4 px-2 sm:px-4 flex flex-col items-center justify-start font-sans">
      {/* Top Controls Bar for testing & responsive switcher */}
      <div className="w-full max-w-md md:max-w-xl mb-3 flex items-center justify-between gap-2 px-2 text-xs">
        {/* Profile Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap">Hồ sơ:</span>
          <button
            onClick={() => handleSwitchProfile("at_risk_student")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ${
              selectedProfileKey === "at_risk_student"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Nguy cơ cảnh báo
          </button>
          <button
            onClick={() => handleSwitchProfile("average_improver")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ${
              selectedProfileKey === "average_improver"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            SV Muốn lên Giỏi
          </button>
          <button
            onClick={() => handleSwitchProfile("empty_student")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ${
              selectedProfileKey === "empty_student"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            + Tự nhập dữ liệu
          </button>
        </div>

        {/* Frame Toggle */}
        <button
          onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0 transition-colors"
          title="Chuyển chế độ khung điện thoại / Toàn màn hình"
        >
          {isPhoneFrameMode ? (
            <>
              <Maximize2 className="w-3 h-3 text-indigo-400" />
              <span>Mở rộng</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-indigo-400" />
              <span>Khung iPhone</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrameMode
            ? "max-w-[420px] rounded-[42px] border-[8px] border-slate-800 shadow-2xl bg-white overflow-hidden ring-1 ring-slate-700/60"
            : "max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden"
        }`}
      >
        {/* Phone Notch & Status Bar (in Phone Frame Mode) */}
        {isPhoneFrameMode && (
          <div className="bg-slate-900 text-white px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold select-none">
            <span suppressHydrationWarning>{currentTime}</span>
            {/* Dynamic Island Pill */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Mobile App Header */}
        <div className="bg-white px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-indigo-200">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>{profile.name}</span>
                <span className="text-[10px] font-medium text-slate-400">({profile.studentId})</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[190px]">
                {profile.major} • {profile.university}
              </div>
            </div>
          </div>

          {/* Early Warning Status Pill in Header */}
          <div
            onClick={() => setActiveTab("warning")}
            className={`cursor-pointer px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border flex items-center gap-1 ${
              warningAnalysis.riskScore >= 70
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : warningAnalysis.riskScore >= 45
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                warningAnalysis.riskScore >= 70
                  ? "bg-rose-600 animate-ping"
                  : warningAnalysis.riskScore >= 45
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span>{warningAnalysis.riskScore}% Rủi ro</span>
          </div>
        </div>

        {/* Floating Attendance Toast Notification */}
        {attendanceAlert && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-3 text-center animate-in slide-in-from-top duration-300">
            {attendanceAlert}
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <div className="flex-1 p-3.5 overflow-y-auto bg-slate-50/50 min-h-[580px] max-h-[660px]">
          {activeTab === "dashboard" && (
            <DashboardTab
              profile={profile}
              warningAnalysis={warningAnalysis}
              onNavigateTab={(tab) => {
                if (tab === "classroom") {
                  setActiveRoom(null);
                }
                setActiveTab(tab as any);
              }}
            />
          )}

          {activeTab === "grades" && (
            <GradeCalculatorTab
              profile={profile}
              activeConfig={activeGradingConfig}
              onUpdateProfile={(updated) => setProfile(updated)}
              onSelectGradingPreset={(presetId) => setActivePresetId(presetId)}
            />
          )}

          {activeTab === "classroom" && (
            activeRoom ? (
              <ClassroomDetailView
                room={activeRoom}
                currentUser={profile}
                onBack={() => setActiveRoom(null)}
                onUpdateRoom={handleUpdateRoom}
                onAttendanceChecked={handleAttendanceChecked}
              />
            ) : (
              <ClassroomListTab
                rooms={rooms}
                currentUser={profile}
                onSelectRoom={handleSelectRoom}
                onCreateRoom={handleCreateRoom}
                onJoinByCode={handleJoinByCode}
              />
            )
          )}

          {activeTab === "warning" && (
            <EarlyWarningTab
              profile={profile}
              warningAnalysis={warningAnalysis}
              onUpdateEngagement={handleUpdateEngagement}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === "roadmap" && (
            <RoadmapTab
              profile={profile}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === "ai" && <AIAdvisorTab profile={profile} />}
        </div>

        {/* Bottom Navigation Bar with 6 Tabs */}
        <div className="bg-white border-t border-slate-200/80 px-1 py-1.5 flex items-center justify-around sticky bottom-0 z-20">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
              activeTab === "dashboard" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${activeTab === "dashboard" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Tổng quan</span>
          </button>

          {/* Tab 2: Grades Calculator */}
          <button
            onClick={() => setActiveTab("grades")}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
              activeTab === "grades" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calculator className={`w-4 h-4 ${activeTab === "grades" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Tính điểm</span>
          </button>

          {/* Tab 3: Classroom (Phòng Học Tập) - MỚI! */}
          <button
            onClick={() => {
              setActiveRoom(null);
              setActiveTab("classroom");
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all relative ${
              activeTab === "classroom" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === "classroom" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Lớp học</span>
            <span className="absolute -top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Tab 4: Early Warning (Alert Indicator) */}
          <button
            onClick={() => setActiveTab("warning")}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all relative ${
              activeTab === "warning" ? "text-rose-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === "warning" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Cảnh báo</span>
            {warningAnalysis.riskScore >= 50 && (
              <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Tab 5: Improvement Roadmap */}
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
              activeTab === "roadmap" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === "roadmap" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Lộ trình</span>
          </button>

          {/* Tab 6: AI Advisor */}
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
              activeTab === "ai" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Bot className={`w-4 h-4 ${activeTab === "ai" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[9px] mt-0.5">Trợ lý AI</span>
          </button>
        </div>

        {/* Bottom Home Indicator Bar (in Phone Frame Mode) */}
        {isPhoneFrameMode && (
          <div className="bg-white py-1 flex justify-center">
            <div className="w-28 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 text-center text-[11px] text-slate-400 max-w-md">
        <span>Ứng dụng Dự báo Học tập & Cảnh báo Sớm • Thiết kế Mobile-First</span>
      </div>
    </div>
  );
}
