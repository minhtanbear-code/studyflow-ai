export type GradeScaleSystem = "standard_moet" | "polytechnic" | "custom";

export interface GradeComponentWeight {
  id: string;
  name: string; // Chuyên cần, Bài tập/Thực hành, Giữa kỳ, Cuối kỳ
  weight: number; // Tỷ lệ % (tổng = 100)
  score: number | null; // Điểm hệ 10 (0 - 10)
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semesterId: string;
  category: "general" | "foundation" | "major" | "thesis" | "elective"; // Đại cương, Cơ sở ngành, Chuyên ngành, Đồ án, Tự chọn
  components: GradeComponentWeight[];
  final10: number; // Điểm tổng kết hệ 10
  letterGrade: string; // A+, A, B+, B, C+, C, D+, D, F
  final4: number; // Điểm hệ 4 (0.0 - 4.0)
  isPassed: boolean;
  targetLetter?: string; // Điểm chữ mong muốn (để tính điểm thi cần đạt)
  requiredFinalScore?: number | null; // Điểm cuối kỳ cần đạt
  isRetake?: boolean; // Môn đang học lại
}

export interface Semester {
  id: string;
  name: string; // Học kỳ 1 (2024-2025)
  academicYear: string;
  courses: Course[];
  semesterGpa4: number;
  semesterGpa10: number;
  totalCredits: number;
  passedCredits: number;
}

export interface GradingRuleThreshold {
  letter: string;
  min10: number;
  gpa4: number;
  description: string;
  isPassing: boolean;
}

export interface UniversityGradingConfig {
  id: string;
  name: string;
  description: string;
  thresholds: GradingRuleThreshold[];
  warningThresholds: {
    level1Cpa: number; // Ví dụ CPA < 1.2
    level2Cpa: number; // Ví dụ CPA < 1.4
    dropoutCpa: number; // Nguy cơ buộc thôi học CPA < 1.0 hoặc 2 kỳ liên tiếp mức 2
    maxDebtCredits: number; // Tối đa nợ tín chỉ cho phép (ví dụ 24 tín chỉ)
  };
}

export type RiskLevel = "safe" | "notice" | "warning" | "danger";

export interface IndicatorScore {
  name: string;
  category: "academic_performance" | "credit_progress" | "failed_courses" | "digital_engagement";
  score: number; // 0 - 100 (càng cao nguy cơ càng lớn)
  weight: number; // Tỷ trọng đóng góp vào chỉ số tổng hợp
  status: "good" | "moderate" | "critical";
  description: string;
  details: string;
}

export interface EarlyWarningAnalysis {
  riskScore: number; // 0 - 100%
  riskLevel: RiskLevel; // safe (0-25), notice (26-50), warning (51-75), danger (76-100)
  academicWarningStatus: "Không cảnh cáo" | "Cảnh báo Mức 1" | "Cảnh báo Mức 2" | "Nguy cơ Buộc thôi học";
  indicators: IndicatorScore[];
  predictedGraduationClassification: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" | "Chậm tiến độ / Nguy cơ đình chỉ";
  projectedSemestersToGraduate: number;
  keyRiskFactors: string[];
  recommendedInterventions: string[];
}

export interface ImprovementCoursePlan {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  currentLetter: string;
  currentScore4: number;
  targetLetter: string;
  targetScore4: number;
  expectedCpaIncrease: number; // Mức tăng CPA ước tính
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface SemesterRegistrationPlan {
  semesterName: string;
  recommendedCredits: number;
  focusArea: string;
  suggestedCourses: string[];
  maxStressThreshold: string;
}

export interface WeeklyStudyAction {
  week: number;
  title: string;
  focus: string;
  actionItems: string[];
  completed: boolean;
}

export interface ImprovementRoadmap {
  currentCpa: number;
  targetCpa: number;
  targetClassification: string;
  retakeCoursesPlan: ImprovementCoursePlan[];
  nextSemesterPlan: SemesterRegistrationPlan;
  weeklyActions: WeeklyStudyAction[];
  interventionSupportActions: {
    type: "academic_advisor" | "peer_tutoring" | "psychology_counsel" | "policy_support";
    title: string;
    description: string;
    actionLabel: string;
  }[];
}

export interface StudentProfile {
  id: string;
  name: string;
  studentId: string;
  major: string;
  university: string;
  currentYear: number;
  currentSemester: number;
  totalRequiredCredits: number;
  semesters: Semester[];
  gradingPresetId: string;
  digitalEngagement: {
    lmsAccessRate: number; // Tỷ lệ truy cập LMS (%)
    assignmentOnTimeRate: number; // Nộp bài đúng hạn (%)
    attendanceRate: number; // Chuyên cần (%)
  };
}
