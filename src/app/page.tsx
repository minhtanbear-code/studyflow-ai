"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  GraduationCap,
  Layout,
  MessageSquareHeart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Swords,
} from "lucide-react";
import { PKSubjectSelectionScreen } from "@/components/pk/PKSubjectSelectionScreen";
import { PKStudyModeSelectionScreen } from "@/components/pk/PKStudyModeSelectionScreen";
import { PKFriendModeSelectionScreen } from "@/components/pk/PKFriendModeSelectionScreen";
import { PKVoiceLearningContainer } from "@/components/pk/PKVoiceLearningContainer";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";
import { SchoolGenZDashboard } from "@/components/schoolgenz/SchoolGenZDashboard";
import { MobileAppContainer } from "@/components/mobile/MobileAppContainer";
import { ThreeNoCommitment } from "@/components/landing/ThreeNoCommitment";
import { PillarsSection } from "@/components/landing/PillarsSection";
import { Footer } from "@/components/common/Footer";

export default function HomePage() {
  const [activeView, setActiveView] = useState<"schoolgenz" | "pk" | "mobile" | "landing">("schoolgenz");
  const [pkStep, setPkStep] = useState<"subject" | "mode" | "friend_mode" | "voice_learning">("subject");
  const [selectedPkSubject, setSelectedPkSubject] = useState<PKSubject>(
    MOCK_PK_SUBJECTS.find((s) => s.id === "eco101") || MOCK_PK_SUBJECTS[1]
  );
  const [pkSearchQuery, setPkSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === "schoolgenz" && <SchoolGenZDashboard />}

        {activeView === "pk" && (
          pkStep === "voice_learning" && selectedPkSubject ? (
            <PKVoiceLearningContainer
              subject={selectedPkSubject}
              onLeave={() => setPkStep("friend_mode")}
            />
          ) : pkStep === "friend_mode" && selectedPkSubject ? (
            <PKFriendModeSelectionScreen
              subject={selectedPkSubject}
              onBack={() => setPkStep("mode")}
              onSelectFriendMode={(mode) => {
                if (mode === "voice") {
                  setPkStep("voice_learning");
                }
              }}
            />
          ) : pkStep === "mode" && selectedPkSubject ? (
            <PKStudyModeSelectionScreen
              subject={selectedPkSubject}
              onBack={() => setPkStep("subject")}
              onSelectMode={(modeId) => {
                if (modeId === "friend") {
                  setPkStep("friend_mode");
                }
              }}
            />
          ) : (
            <PKSubjectSelectionScreen
              initialSubjectId={selectedPkSubject?.id}
              initialSearchQuery={pkSearchQuery}
              onBack={() => setActiveView("schoolgenz")}
              onSelectSubject={(subj, query) => {
                setSelectedPkSubject(subj);
                if (query !== undefined) setPkSearchQuery(query);
                setPkStep("mode");
              }}
            />
          )
        )}

        {activeView === "mobile" && <MobileAppContainer />}

        {activeView === "landing" && (
          <div className="bg-slate-50 text-slate-900 min-h-screen">
            <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 text-center">
              <div className="max-w-7xl mx-auto px-4">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-medium border border-indigo-100 mb-6 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Chủ đề 1: Cảnh báo sớm & Lộ trình cải thiện</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">
                  Nền tảng Học tập & Cảnh báo Sớm Học vụ
                </h1>
                <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed mb-6">
                  Dự báo kết quả học tập, cảnh báo sớm nguy cơ học vụ, tính điểm linh hoạt theo quy chế từng trường và lộ trình cải thiện cá nhân hóa.
                </p>
                <button
                  onClick={() => setActiveView("schoolgenz")}
                  className="bg-blue-600 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700"
                >
                  Mở Giao Diện School Gen Z &rarr;
                </button>
              </div>
            </section>
            <ThreeNoCommitment />
            <PillarsSection />
            <Footer />
          </div>
        )}
      </main>

      {/* Floating View Switcher (Discreet Bottom Pill) */}
      <div className="fixed bottom-3 right-3 z-50 bg-slate-900/90 text-white backdrop-blur-md px-2 py-1 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1 text-[11px] font-bold">
        <button
          onClick={() => setActiveView("schoolgenz")}
          className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
            activeView === "schoolgenz" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layout className="w-3 h-3" />
          <span>School Gen Z</span>
        </button>

        <button
          onClick={() => setActiveView("pk")}
          className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
            activeView === "pk" ? "bg-[#7C3AED] text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Swords className="w-3 h-3" />
          <span>Standalone PK</span>
        </button>

        <button
          onClick={() => setActiveView("mobile")}
          className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 ${
            activeView === "mobile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Smartphone className="w-3 h-3" />
          <span>Mobile</span>
        </button>
      </div>
    </div>
  );
}
