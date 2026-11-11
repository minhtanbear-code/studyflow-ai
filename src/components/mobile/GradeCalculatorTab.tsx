"use client";

import React, { useState } from "react";
import {
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Info,
  Percent,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import {
  Course,
  GradeComponentWeight,
  Semester,
  StudentProfile,
  UniversityGradingConfig,
} from "@/core/domain/academic.types";
import {
  calculateCourseFinal10,
  calculateCumulativeCpa,
  calculateRequiredFinalExamScore,
  calculateSemesterGpa,
  convertScoreToGrade,
  UNIVERSITY_PRESETS,
} from "@/core/services/academicCalculator.service";

interface GradeCalculatorTabProps {
  profile: StudentProfile;
  activeConfig: UniversityGradingConfig;
  onUpdateProfile: (updatedProfile: StudentProfile) => void;
  onSelectGradingPreset: (presetId: string) => void;
}

export function GradeCalculatorTab({
  profile,
  activeConfig,
  onUpdateProfile,
  onSelectGradingPreset,
}: GradeCalculatorTabProps) {
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState<number>(
    profile.semesters.length - 1 >= 0 ? profile.semesters.length - 1 : 0
  );
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const currentSemester: Semester | undefined = profile.semesters[selectedSemesterIndex];

  // Helper cập nhật toàn bộ profile khi có thay đổi
  const handleUpdateCourse = (updatedCourse: Course) => {
    if (!currentSemester) return;

    // Tính lại điểm tổng kết của môn
    const final10 = calculateCourseFinal10(updatedCourse.components);
    const grade = convertScoreToGrade(final10, activeConfig);

    // Tính lại điểm cuối kỳ cần đạt nếu có targetLetter
    const requiredFinalScore = updatedCourse.targetLetter
      ? calculateRequiredFinalExamScore(updatedCourse.components, updatedCourse.targetLetter, activeConfig)
      : null;

    const newCourseObj: Course = {
      ...updatedCourse,
      final10,
      letterGrade: grade.letter,
      final4: grade.gpa4,
      isPassed: grade.isPassed,
      requiredFinalScore,
    };

    const newCourses = currentSemester.courses.map((c) =>
      c.id === updatedCourse.id ? newCourseObj : c
    );

    const semGpa = calculateSemesterGpa(newCourses, activeConfig);

    const newSemester: Semester = {
      ...currentSemester,
      courses: newCourses,
      semesterGpa4: semGpa.gpa4,
      semesterGpa10: semGpa.gpa10,
      totalCredits: semGpa.totalCredits,
      passedCredits: semGpa.passedCredits,
    };

    const newSemesters = profile.semesters.map((s, idx) =>
      idx === selectedSemesterIndex ? newSemester : s
    );

    onUpdateProfile({
      ...profile,
      semesters: newSemesters,
    });
  };

  // Thêm một môn học mới
  const handleAddCourse = () => {
    if (!currentSemester) return;

    const newCourseId = `c_custom_${Date.now()}`;
    const newCourse: Course = {
      id: newCourseId,
      code: `HP${currentSemester.courses.length + 1}`,
      name: `Học phần mới ${currentSemester.courses.length + 1}`,
      credits: 3,
      semesterId: currentSemester.id,
      category: "major",
      components: [
        { id: `comp_${Date.now()}_1`, name: "Chuyên cần", weight: 10, score: 8.5 },
        { id: `comp_${Date.now()}_2`, name: "Bài tập/Thực hành", weight: 20, score: 7.0 },
        { id: `comp_${Date.now()}_3`, name: "Kiểm tra giữa kỳ", weight: 20, score: 6.5 },
        { id: `comp_${Date.now()}_4`, name: "Thi cuối kỳ", weight: 50, score: 7.0 },
      ],
      final10: 7.05,
      letterGrade: "B",
      final4: 3.0,
      isPassed: true,
      targetLetter: "A",
    };

    const updatedCourses = [...currentSemester.courses, newCourse];
    const semGpa = calculateSemesterGpa(updatedCourses, activeConfig);

    const newSemester: Semester = {
      ...currentSemester,
      courses: updatedCourses,
      semesterGpa4: semGpa.gpa4,
      semesterGpa10: semGpa.gpa10,
      totalCredits: semGpa.totalCredits,
      passedCredits: semGpa.passedCredits,
    };

    const newSemesters = profile.semesters.map((s, idx) =>
      idx === selectedSemesterIndex ? newSemester : s
    );

    onUpdateProfile({
      ...profile,
      semesters: newSemesters,
    });

    setExpandedCourseId(newCourseId);
  };

  // Xóa một môn học
  const handleDeleteCourse = (courseId: string) => {
    if (!currentSemester) return;
    const updatedCourses = currentSemester.courses.filter((c) => c.id !== courseId);
    const semGpa = calculateSemesterGpa(updatedCourses, activeConfig);

    const newSemester: Semester = {
      ...currentSemester,
      courses: updatedCourses,
      semesterGpa4: semGpa.gpa4,
      semesterGpa10: semGpa.gpa10,
      totalCredits: semGpa.totalCredits,
      passedCredits: semGpa.passedCredits,
    };

    const newSemesters = profile.semesters.map((s, idx) =>
      idx === selectedSemesterIndex ? newSemester : s
    );

    onUpdateProfile({
      ...profile,
      semesters: newSemesters,
    });
  };

  // Thay đổi điểm của thành phần
  const handleScoreChange = (course: Course, compId: string, val: string) => {
    const num = val === "" ? null : Math.min(10, Math.max(0, parseFloat(val) || 0));
    const newComponents = course.components.map((c) =>
      c.id === compId ? { ...c, score: num } : c
    );
    handleUpdateCourse({ ...course, components: newComponents });
  };

  // Thay đổi trọng số % của thành phần
  const handleWeightChange = (course: Course, compId: string, val: string) => {
    const weight = Math.max(0, Math.min(100, parseInt(val) || 0));
    const newComponents = course.components.map((c) =>
      c.id === compId ? { ...c, weight } : c
    );
    handleUpdateCourse({ ...course, components: newComponents });
  };

  // Thêm thành phần điểm mới vào môn
  const handleAddComponent = (course: Course) => {
    const newComp: GradeComponentWeight = {
      id: `comp_extra_${Date.now()}`,
      name: "Cột điểm bổ sung",
      weight: 10,
      score: 7.0,
    };
    handleUpdateCourse({ ...course, components: [...course.components, newComp] });
  };

  // Xóa thành phần điểm
  const handleDeleteComponent = (course: Course, compId: string) => {
    if (course.components.length <= 1) return;
    const newComponents = course.components.filter((c) => c.id !== compId);
    handleUpdateCourse({ ...course, components: newComponents });
  };

  // Áp dụng bộ trọng số mẫu nhanh
  const handleApplyWeightPreset = (course: Course, preset: "10-20-20-50" | "10-30-60" | "30-70" | "100") => {
    let comps: GradeComponentWeight[] = [];
    if (preset === "10-20-20-50") {
      comps = [
        { id: "c1", name: "Chuyên cần", weight: 10, score: 9.0 },
        { id: "c2", name: "Bài tập / Lab", weight: 20, score: 7.5 },
        { id: "c3", name: "Kiểm tra giữa kỳ", weight: 20, score: 7.0 },
        { id: "c4", name: "Thi cuối kỳ", weight: 50, score: 6.5 },
      ];
    } else if (preset === "10-30-60") {
      comps = [
        { id: "c1", name: "Chuyên cần", weight: 10, score: 9.0 },
        { id: "c2", name: "Giữa kỳ", weight: 30, score: 7.0 },
        { id: "c3", name: "Thi cuối kỳ", weight: 60, score: 6.5 },
      ];
    } else if (preset === "30-70") {
      comps = [
        { id: "c1", name: "Quá trình / Giữa kỳ", weight: 30, score: 7.5 },
        { id: "c2", name: "Thi cuối kỳ", weight: 70, score: 6.5 },
      ];
    } else {
      comps = [{ id: "c1", name: "Đồ án / Khóa luận", weight: 100, score: 8.0 }];
    }
    handleUpdateCourse({ ...course, components: comps });
  };

  const { cpa4, cpa10 } = calculateCumulativeCpa(profile.semesters, activeConfig);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Bộ công cụ tính điểm
            </span>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Nhập & Tính điểm Linh hoạt</span>
            </h2>
          </div>

          {/* Quy chế Preset Button */}
          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Quy chế</span>
          </button>
        </div>

        {/* Current Active Preset Banner */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-slate-500">Quy chế áp dụng: </span>
            <strong className="text-slate-800">{activeConfig.name}</strong>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
            Thang 4 & 10
          </span>
        </div>

        {/* Select Preset Drawer/Panel if open */}
        {showConfigModal && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2 animate-in fade-in duration-200">
            <div className="text-xs font-bold text-indigo-900 mb-1">
              Chọn hệ thống tính điểm theo trường của bạn:
            </div>
            {Object.values(UNIVERSITY_PRESETS).map((preset) => (
              <label
                key={preset.id}
                onClick={() => {
                  onSelectGradingPreset(preset.id);
                  setShowConfigModal(false);
                }}
                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer text-xs border transition-all ${
                  activeConfig.id === preset.id
                    ? "bg-white border-indigo-400 shadow-sm text-indigo-900 font-bold"
                    : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    activeConfig.id === preset.id
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {activeConfig.id === preset.id && <Check className="w-2.5 h-2.5" />}
                </div>
                <div>
                  <div>{preset.name}</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    {preset.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Live CPA Summary Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            CPA Toàn khóa:{" "}
            <span className="text-base font-black text-slate-900">{cpa4.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400"> / 4.0</span>
          </div>
          <div className="text-slate-500">
            Điểm hệ 10:{" "}
            <span className="text-sm font-bold text-slate-800">{cpa10.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {profile.semesters.map((sem, idx) => (
          <button
            key={sem.id}
            onClick={() => setSelectedSemesterIndex(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              selectedSemesterIndex === idx
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {sem.name}
          </button>
        ))}
      </div>

      {/* Current Semester Summary Pill */}
      {currentSemester && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-200">{currentSemester.name}</div>
            <div className="text-xs opacity-80 mt-0.5">
              {currentSemester.courses.length} học phần • Tổng {currentSemester.totalCredits} tín chỉ
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-indigo-200">GPA Kỳ này</div>
            <div className="text-xl font-black text-white">
              {currentSemester.semesterGpa4.toFixed(2)}{" "}
              <span className="text-[10px] font-normal text-slate-400">/ 4.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700">
            Danh sách môn học ({currentSemester?.courses.length || 0})
          </span>
          <button
            onClick={handleAddCourse}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm môn học</span>
          </button>
        </div>

        {currentSemester?.courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          const totalWeight = course.components.reduce((sum, c) => sum + c.weight, 0);
          const isWeightValid = totalWeight === 100;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-indigo-400 shadow-md ring-1 ring-indigo-200"
                  : "border-slate-100 shadow-sm hover:border-slate-200"
              }`}
            >
              {/* Course Card Header */}
              <div
                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                className="p-3.5 cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {course.credits} tín chỉ
                    </span>
                    {!isWeightValid && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {totalWeight}% (chưa đủ 100%)
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {course.name}
                  </h4>
                </div>

                {/* Score Pill & Expand Arrow */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div
                      className={`text-sm font-black px-2 py-0.5 rounded-lg inline-block ${
                        course.final4 >= 3.0
                          ? "bg-emerald-100 text-emerald-800"
                          : course.final4 >= 2.0
                          ? "bg-blue-100 text-blue-800"
                          : course.final4 >= 1.0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {course.letterGrade}{" "}
                      <span className="text-[11px] font-medium">({course.final4.toFixed(1)})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {course.final10.toFixed(1)} / 10
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Edit Section */}
              {isExpanded && (
                <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 space-y-3.5 bg-slate-50/50 animate-in fade-in duration-150">
                  {/* Basic Course Info Edit */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Tên môn học
                      </label>
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => handleUpdateCourse({ ...course, name: e.target.value })}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Số tín chỉ
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={course.credits}
                        onChange={(e) =>
                          handleUpdateCourse({
                            ...course,
                            credits: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Flexible Weight Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mẫu phân bổ trọng số nhanh:</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                      <button
                        onClick={() => handleApplyWeightPreset(course, "10-20-20-50")}
                        className="py-1 px-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors truncate"
                      >
                        10-20-20-50
                      </button>
                      <button
                        onClick={() => handleApplyWeightPreset(course, "10-30-60")}
                        className="py-1 px-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors truncate"
                      >
                        10-30-60
                      </button>
                      <button
                        onClick={() => handleApplyWeightPreset(course, "30-70")}
                        className="py-1 px-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors truncate"
                      >
                        30-70
                      </button>
                      <button
                        onClick={() => handleApplyWeightPreset(course, "100")}
                        className="py-1 px-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors truncate"
                      >
                        Đồ án 100%
                      </button>
                    </div>
                  </div>

                  {/* Component Rows Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                      <span>Thành phần điểm</span>
                      <div className="flex items-center gap-4">
                        <span className="w-14 text-center">Trọng số %</span>
                        <span className="w-16 text-center">Điểm (0-10)</span>
                        <span className="w-5"></span>
                      </div>
                    </div>

                    {course.components.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200"
                      >
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => {
                            const newComps = course.components.map((c) =>
                              c.id === comp.id ? { ...c, name: e.target.value } : c
                            );
                            handleUpdateCourse({ ...course, components: newComps });
                          }}
                          className="flex-1 text-xs font-semibold text-slate-800 bg-transparent border-0 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative w-14">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={comp.weight}
                              onChange={(e) => handleWeightChange(course, comp.id, e.target.value)}
                              className="w-full text-center text-xs font-bold py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                            />
                            <span className="absolute right-1.5 top-1 text-[10px] text-slate-400 font-bold pointer-events-none">
                              %
                            </span>
                          </div>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="-"
                            value={comp.score !== null ? comp.score : ""}
                            onChange={(e) => handleScoreChange(course, comp.id, e.target.value)}
                            className="w-16 text-center text-xs font-black py-1 bg-indigo-50/60 border border-indigo-200 rounded-lg text-indigo-900 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleDeleteComponent(course, comp.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Weight Check Status & Add Component */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500">Tổng trọng số:</span>
                        <strong
                          className={isWeightValid ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}
                        >
                          {totalWeight}%
                        </strong>
                        {isWeightValid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="text-[10px] text-amber-600">
                            (cần bù {100 - totalWeight}%)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddComponent(course)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm cột điểm</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Grade / What-If Simulator */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mô phỏng điểm thi cuối kỳ (What-If):</span>
                      </span>
                      <select
                        value={course.targetLetter || "B"}
                        onChange={(e) =>
                          handleUpdateCourse({ ...course, targetLetter: e.target.value })
                        }
                        className="text-xs font-bold bg-white border border-indigo-200 rounded-lg px-2 py-0.5 text-indigo-700"
                      >
                        <option value="A">Mục tiêu A (4.0)</option>
                        <option value="B+">Mục tiêu B+ (3.5)</option>
                        <option value="B">Mục tiêu B (3.0)</option>
                        <option value="C+">Mục tiêu C+ (2.5)</option>
                        <option value="C">Mục tiêu C (2.0)</option>
                        <option value="D">Mục tiêu D (Đạt môn)</option>
                      </select>
                    </div>

                    <div className="text-xs text-indigo-900 leading-relaxed">
                      {course.requiredFinalScore !== null && course.requiredFinalScore !== undefined ? (
                        course.requiredFinalScore > 10 ? (
                          <span className="text-rose-600 font-bold">
                            ⚠️ Cần thi cuối kỳ &gt; 10.0 (Không khả thi do điểm quá trình thấp, nên chọn mục tiêu thấp hơn).
                          </span>
                        ) : course.requiredFinalScore <= 0 ? (
                          <span className="text-emerald-700 font-bold">
                            🎉 Điểm quá trình đã đủ cao! Thi cuối kỳ chỉ cần đạt điểm liệt (&gt;= 3.0) là có {course.targetLetter}!
                          </span>
                        ) : (
                          <span>
                            Để môn này đạt điểm <strong>{course.targetLetter}</strong>, bài thi cuối kỳ cần tối thiểu:{" "}
                            <strong className="text-sm font-black text-indigo-700 underline">
                              {course.requiredFinalScore.toFixed(1)} điểm
                            </strong>
                          </span>
                        )
                      ) : (
                        <span>Chưa xác định bài thi cuối kỳ.</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Course Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa môn học này</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
