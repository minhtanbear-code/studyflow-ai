"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Flame,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers,
  Search,
  Sparkles,
  Swords,
  TrendingUp,
  X,
} from "lucide-react";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";

interface PKSubjectSelectionScreenProps {
  onSelectSubject?: (subject: PKSubject, currentSearchQuery?: string) => void;
  onBack?: () => void;
  initialSubjectId?: string;
  initialSearchQuery?: string;
  onOpenJoinCode?: () => void;
}

export function PKSubjectSelectionScreen({
  onSelectSubject,
  onBack,
  initialSubjectId,
  initialSearchQuery,
  onOpenJoinCode,
}: PKSubjectSelectionScreenProps) {
  const router = useRouter();

  // Selected subject ID (default to first suggested subject: eco101 - Kinh tế vi mô)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || "eco101"
  );
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || "");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "suggested">("all");

  // Specific 4 required suggested subjects
  const SUGGESTED_SUBJECT_NAMES = [
    "Kinh tế vi mô",
    "Kinh tế vĩ mô",
    "Nguyên lý kế toán",
    "Quản trị tài chính",
  ];

  // Filter available subjects (excluding generic "all" dummy entry for selection)
  const selectableSubjects = useMemo(() => {
    return MOCK_PK_SUBJECTS.filter((s) => s.id !== "all");
  }, []);

  // Filtered by search query & filter pill
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return selectableSubjects.filter((subject) => {
      // If user toggled suggested only
      if (selectedFilter === "suggested" && !SUGGESTED_SUBJECT_NAMES.includes(subject.name)) {
        return false;
      }

      if (!q) return true;

      // Match name, code, or description
      const nameMatch = subject.name.toLowerCase().includes(q);
      const codeMatch = subject.code.toLowerCase().includes(q);
      const descMatch = subject.description?.toLowerCase().includes(q) ?? false;

      return nameMatch || codeMatch || descMatch;
    });
  }, [searchQuery, selectedFilter, selectableSubjects]);

  const selectedSubject = useMemo(() => {
    return selectableSubjects.find((s) => s.id === selectedSubjectId) || selectableSubjects[0];
  }, [selectedSubjectId, selectableSubjects]);

  const handleSelect = (subject: PKSubject) => {
    setSelectedSubjectId(subject.id);
    if (onSelectSubject) {
      onSelectSubject(subject);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#17133B] flex flex-col font-sans antialiased selection:bg-[#EDE9FE] selection:text-[#7C3AED]">
      {/* ========================================================= */}
      {/* TOP HEADER: BRAND, STEP FLOW & EXIT                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E4F3] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4F3] text-xs font-bold text-[#77738F] hover:text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-all group"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          {/* STUDYFLOW AI Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-sm shadow-purple-200">
              <Sparkles className="w-4 h-4 text-[#EDE9FE]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline">
                <span className="text-sm font-black tracking-tight text-[#17133B]">STUDYFLOW</span>
                <span className="text-sm font-black text-[#7C3AED] ml-1">AI</span>
              </div>
              <span className="text-[10px] text-[#77738F] font-bold tracking-wide hidden md:block">
                PK • Đấu trí học tập
              </span>
            </div>
          </Link>
        </div>

        {/* STEP PROGRESS INDICATOR & QUICK JOIN */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {onOpenJoinCode && (
            <button
              type="button"
              onClick={onOpenJoinCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#EDE9FE] text-[#7C3AED] border border-[#7C3AED]/30 font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Nhập mã phòng bạn bè chia sẻ"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nhập mã phòng</span>
              <span className="sm:hidden">Mã phòng</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-black border border-[#7C3AED]/20 shadow-xs">
            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
              1
            </span>
            <span className="font-bold">Bước 1: Chọn môn</span>
          </div>

          <div className="w-4 h-0.5 bg-[#E8E4F3] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-400 font-bold border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-slate-300 text-white text-[11px] flex items-center justify-center">
              2
            </span>
            <span>Bước 2: Chọn chế độ đấu trí</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT: SUBJECT SELECTION HERO & GRID               */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
        {/* HERO TITLE & SUPPORTING DESCRIPTION */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-black border border-[#7C3AED]/20 shadow-xs">
            <Swords className="w-3.5 h-3.5" />
            <span>KHỞI TẠO ĐẤU TRƯỜNG PK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#17133B] tracking-tight">
            Bạn học môn gì?
          </h1>

          <p className="text-sm sm:text-base text-[#77738F] font-medium leading-relaxed">
            Chọn môn học bạn muốn tham gia PK hoặc luyện tập.
          </p>
        </div>

        {/* PROMINENT SEARCH INPUT */}
        <div className="max-w-2xl w-full mx-auto mb-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
          <div className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-[#77738F]">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên môn học bạn muốn tìm kiếm..."
              className="w-full pl-12 pr-11 py-3.5 sm:py-4 bg-white border-2 border-[#E8E4F3] rounded-2xl text-sm sm:text-base font-semibold text-[#17133B] placeholder-[#77738F]/60 shadow-sm transition-all focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#EDE9FE]"
              autoFocus
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SUGGESTED SUBJECTS SECTION */}
        <div className="max-w-2xl w-full mx-auto mb-8 animate-in fade-in duration-300 delay-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#77738F] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Gợi ý môn học trọng tâm:</span>
            </div>

            {selectedFilter === "suggested" && (
              <button
                onClick={() => setSelectedFilter("all")}
                className="text-[11px] font-bold text-[#7C3AED] hover:underline"
              >
                Xem tất cả
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SUBJECT_NAMES.map((name) => {
              const matched = selectableSubjects.find((s) => s.name === name);
              if (!matched) return null;
              const isSelected = selectedSubjectId === matched.id;

              return (
                <button
                  key={matched.id}
                  onClick={() => {
                    handleSelect(matched);
                    setSearchQuery("");
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm shadow-purple-200 scale-102"
                      : "bg-white text-[#17133B] border-[#E8E4F3] hover:border-[#7C3AED] hover:bg-[#EDE9FE]/30"
                  }`}
                >
                  <span className="text-sm">{matched.icon}</span>
                  <span>{matched.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBJECTS LIST GRID */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#77738F]">
            <span>
              Danh sách môn học ({filteredSubjects.length})
            </span>
            <span>
              Nhấp vào môn để chọn
            </span>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E4F3] p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#17133B]">
                Không tìm thấy môn học phù hợp
              </h3>
              <p className="text-xs text-[#77738F] max-w-sm mx-auto">
                Không có môn học nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;. Vui lòng thử tìm với từ khóa khác hoặc chọn từ danh sách gợi ý.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-xl bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs hover:bg-[#7C3AED] hover:text-white transition-all"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSubjects.map((subject, idx) => {
                const isSelected = selectedSubjectId === subject.id;
                const isSuggested = SUGGESTED_SUBJECT_NAMES.includes(subject.name);

                return (
                  <div
                    key={subject.id}
                    onClick={() => handleSelect(subject)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 relative flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-2 ${
                      isSelected
                        ? "bg-[#FAF8FF] border-[#7C3AED] shadow-md shadow-purple-100 ring-2 ring-[#EDE9FE]"
                        : "bg-white border-[#E8E4F3] hover:border-[#7C3AED]/60 hover:shadow-sm hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Top row: Icon & Tag */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                            isSelected
                              ? "bg-[#7C3AED] text-white shadow-sm shadow-purple-200"
                              : "bg-[#F8F7FC] border border-[#E8E4F3] group-hover:bg-[#EDE9FE]/50"
                          }`}
                        >
                          {subject.icon}
                        </div>

                        <div className="flex items-center gap-1">
                          {isSuggested && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Trọng tâm
                            </span>
                          )}

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#7C3AED] text-white scale-110"
                                : "border border-[#E8E4F3] text-transparent group-hover:border-[#7C3AED]/40"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Subject Name & Code */}
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-extrabold text-[#7C3AED] uppercase tracking-wider">
                          {subject.code}
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[#17133B] group-hover:text-[#7C3AED] transition-colors leading-snug">
                          {subject.name}
                        </h3>
                      </div>

                      {/* Short description */}
                      {subject.description && (
                        <p className="text-xs text-[#77738F] font-medium mt-1.5 line-clamp-2 leading-relaxed">
                          {subject.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom meta */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8E4F3]/60 flex items-center justify-between text-[11px] font-bold text-[#77738F]">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {subject.activeRoomsCount} phòng đấu trí
                      </span>

                      {isSelected && (
                        <span className="text-[#7C3AED] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đang chọn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* BOTTOM ACTION BAR (SELECTION CONFIRMATION)                 */}
      {/* ========================================================= */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4F3] px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-lg shrink-0">
              {selectedSubject?.icon || "📚"}
            </div>

            <div>
              <div className="text-[11px] text-[#77738F] font-bold">
                Môn học đã chọn:
              </div>
              <div className="text-sm font-black text-[#17133B] flex items-center gap-1.5">
                <span>{selectedSubject?.name}</span>
                <span className="text-[11px] font-extrabold text-[#7C3AED] bg-[#EDE9FE] px-1.5 py-0.2 rounded-md">
                  {selectedSubject?.code}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="text-right hidden md:block">
              <span className="text-[11px] text-[#77738F] block font-medium">
                Bước tiếp theo:
              </span>
              <span className="text-xs font-bold text-[#17133B]">
                Chọn chế độ Solo 1v1 hoặc Luyện tập
              </span>
            </div>

            <button
              onClick={() => {
                if (onSelectSubject && selectedSubject) {
                  onSelectSubject(selectedSubject, searchQuery);
                }
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white font-black text-xs shadow-md shadow-purple-200 hover:bg-[#6D28D9] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Xác nhận môn học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
