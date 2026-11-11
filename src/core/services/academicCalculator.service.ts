import {
  Course,
  EarlyWarningAnalysis,
  GradeComponentWeight,
  IndicatorScore,
  RiskLevel,
  Semester,
  StudentProfile,
  UniversityGradingConfig,
} from "../domain/academic.types";

// Các hệ thống quy chế tính điểm mẫu
export const UNIVERSITY_PRESETS: Record<string, UniversityGradingConfig> = {
  standard_moet: {
    id: "standard_moet",
    name: "Quy chế Chuẩn Bộ GD&ĐT (Thông tư 17/2021)",
    description: "Thang điểm 4 tiêu chuẩn (A, B+, B, C+, C, D+, D, F) áp dụng rộng rãi tại hầu hết trường ĐH.",
    thresholds: [
      { letter: "A", min10: 8.5, gpa4: 4.0, description: "Giỏi / Xuất sắc", isPassing: true },
      { letter: "B+", min10: 8.0, gpa4: 3.5, description: "Khá giỏi", isPassing: true },
      { letter: "B", min10: 7.0, gpa4: 3.0, description: "Khá", isPassing: true },
      { letter: "C+", min10: 6.5, gpa4: 2.5, description: "Trung bình khá", isPassing: true },
      { letter: "C", min10: 5.5, gpa4: 2.0, description: "Trung bình", isPassing: true },
      { letter: "D+", min10: 5.0, gpa4: 1.5, description: "Trung bình yếu", isPassing: true },
      { letter: "D", min10: 4.0, gpa4: 1.0, description: "Yếu (Đạt)", isPassing: true },
      { letter: "F", min10: 0.0, gpa4: 0.0, description: "Kém (Chưa đạt / Học lại)", isPassing: false },
    ],
    warningThresholds: {
      level1Cpa: 1.2,
      level2Cpa: 1.4,
      dropoutCpa: 1.0,
      maxDebtCredits: 24,
    },
  },
  polytechnic: {
    id: "polytechnic",
    name: "Quy chế Bách Khoa / Khối Kỹ thuật (Có A+)",
    description: "Phân bậc chi tiết có A+ (4.0), A (3.8), chuẩn cảnh báo học vụ nghiêm ngặt.",
    thresholds: [
      { letter: "A+", min10: 9.0, gpa4: 4.0, description: "Xuất sắc", isPassing: true },
      { letter: "A", min10: 8.5, gpa4: 3.8, description: "Giỏi", isPassing: true },
      { letter: "B+", min10: 8.0, gpa4: 3.5, description: "Khá giỏi", isPassing: true },
      { letter: "B", min10: 7.0, gpa4: 3.0, description: "Khá", isPassing: true },
      { letter: "C+", min10: 6.5, gpa4: 2.5, description: "Trung bình khá", isPassing: true },
      { letter: "C", min10: 5.5, gpa4: 2.0, description: "Trung bình", isPassing: true },
      { letter: "D+", min10: 5.0, gpa4: 1.5, description: "Trung bình yếu", isPassing: true },
      { letter: "D", min10: 4.0, gpa4: 1.0, description: "Yếu (Đạt)", isPassing: true },
      { letter: "F", min10: 0.0, gpa4: 0.0, description: "Kém (Học lại)", isPassing: false },
    ],
    warningThresholds: {
      level1Cpa: 1.25,
      level2Cpa: 1.5,
      dropoutCpa: 1.1,
      maxDebtCredits: 20,
    },
  },
  custom: {
    id: "custom",
    name: "Tùy biến Trường riêng / Thang điểm tự do",
    description: "Sinh viên có thể tùy chỉnh các ngưỡng điểm theo đúng sổ tay sinh viên trường mình.",
    thresholds: [
      { letter: "A", min10: 8.5, gpa4: 4.0, description: "Xuất sắc", isPassing: true },
      { letter: "B+", min10: 8.0, gpa4: 3.5, description: "Khá giỏi", isPassing: true },
      { letter: "B", min10: 7.0, gpa4: 3.0, description: "Khá", isPassing: true },
      { letter: "C+", min10: 6.5, gpa4: 2.5, description: "Trung bình khá", isPassing: true },
      { letter: "C", min10: 5.5, gpa4: 2.0, description: "Trung bình", isPassing: true },
      { letter: "D+", min10: 5.0, gpa4: 1.5, description: "Trung bình yếu", isPassing: true },
      { letter: "D", min10: 4.0, gpa4: 1.0, description: "Yếu", isPassing: true },
      { letter: "F", min10: 0.0, gpa4: 0.0, description: "Không đạt", isPassing: false },
    ],
    warningThresholds: {
      level1Cpa: 1.2,
      level2Cpa: 1.4,
      dropoutCpa: 1.0,
      maxDebtCredits: 24,
    },
  },
};

/**
 * Tính điểm tổng kết hệ 10 từ các thành phần điểm và trọng số
 */
export function calculateCourseFinal10(components: GradeComponentWeight[]): number {
  if (!components || components.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const comp of components) {
    if (comp.score !== null && !isNaN(comp.score)) {
      totalWeightedScore += comp.score * comp.weight;
      totalWeight += comp.weight;
    }
  }

  if (totalWeight === 0) return 0;
  // Chuẩn hóa nếu chưa đủ 100% hoặc đủ 100%
  const finalScore = totalWeightedScore / totalWeight;
  return Math.round(finalScore * 10) / 10;
}

/**
 * Quy đổi điểm hệ 10 sang Điểm chữ và Điểm hệ 4 dựa vào bảng quy chế cấu hình
 */
export function convertScoreToGrade(
  score10: number,
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): { letter: string; gpa4: number; isPassed: boolean; description: string } {
  const sortedThresholds = [...config.thresholds].sort((a, b) => b.min10 - a.min10);

  for (const t of sortedThresholds) {
    if (score10 >= t.min10) {
      return {
        letter: t.letter,
        gpa4: t.gpa4,
        isPassed: t.isPassing,
        description: t.description,
      };
    }
  }

  const failGrade = sortedThresholds[sortedThresholds.length - 1];
  return {
    letter: failGrade?.letter || "F",
    gpa4: failGrade?.gpa4 || 0,
    isPassed: false,
    description: "Chưa đạt",
  };
}

/**
 * Tính điểm thi Cuối kỳ cần đạt (What-If Calculator) để đạt được điểm chữ mong muốn
 */
export function calculateRequiredFinalExamScore(
  components: GradeComponentWeight[],
  targetLetter: string,
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): number | null {
  const targetThreshold = config.thresholds.find((t) => t.letter === targetLetter);
  if (!targetThreshold) return null;

  const targetMin10 = targetThreshold.min10;

  // Giả định thành phần cuối cùng hoặc thành phần có tên "Cuối kỳ" là bài thi kết thúc môn
  const finalExamComp =
    components.find((c) => c.name.toLowerCase().includes("cuối") || c.name.toLowerCase().includes("thi")) ||
    components[components.length - 1];

  if (!finalExamComp) return null;

  const otherComponents = components.filter((c) => c.id !== finalExamComp.id);
  let otherWeightedSum = 0;
  for (const c of otherComponents) {
    if (c.score !== null) {
      otherWeightedSum += (c.score * c.weight) / 100;
    }
  }

  const finalWeightFrac = finalExamComp.weight / 100;
  if (finalWeightFrac <= 0) return null;

  // targetMin10 = otherWeightedSum + finalExamScore * finalWeightFrac
  const neededScore = (targetMin10 - otherWeightedSum) / finalWeightFrac;
  return Math.round(neededScore * 10) / 10;
}

/**
 * Tính GPA học kỳ (hệ 4 và hệ 10)
 */
export function calculateSemesterGpa(
  courses: Course[],
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): { gpa4: number; gpa10: number; totalCredits: number; passedCredits: number } {
  let totalCredits = 0;
  let passedCredits = 0;
  let totalPoints4 = 0;
  let totalPoints10 = 0;

  for (const course of courses) {
    const final10 = calculateCourseFinal10(course.components);
    const grade = convertScoreToGrade(final10, config);

    totalCredits += course.credits;
    if (grade.isPassed) {
      passedCredits += course.credits;
    }
    totalPoints4 += grade.gpa4 * course.credits;
    totalPoints10 += final10 * course.credits;
  }

  const gpa4 = totalCredits > 0 ? Math.round((totalPoints4 / totalCredits) * 100) / 100 : 0;
  const gpa10 = totalCredits > 0 ? Math.round((totalPoints10 / totalCredits) * 100) / 100 : 0;

  return { gpa4, gpa10, totalCredits, passedCredits };
}

/**
 * Tính điểm tích lũy CPA toàn khóa (Cumulative Grade Point Average)
 */
export function calculateCumulativeCpa(
  semesters: Semester[],
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): { cpa4: number; cpa10: number; totalCredits: number; passedCredits: number; debtCredits: number } {
  let totalCredits = 0;
  let passedCredits = 0;
  let debtCredits = 0;
  let totalPoints4 = 0;
  let totalPoints10 = 0;

  // Lọc lấy môn học mới nhất nếu có học lại
  const courseMap = new Map<string, Course>();
  for (const sem of semesters) {
    for (const c of sem.courses) {
      // Nếu môn đã học lại, ghi đè bằng lần học sau
      courseMap.set(c.code, c);
    }
  }

  courseMap.forEach((course) => {
    const final10 = calculateCourseFinal10(course.components);
    const grade = convertScoreToGrade(final10, config);

    totalCredits += course.credits;
    if (grade.isPassed) {
      passedCredits += course.credits;
    } else {
      debtCredits += course.credits;
    }
    totalPoints4 += grade.gpa4 * course.credits;
    totalPoints10 += final10 * course.credits;
  });

  const cpa4 = totalCredits > 0 ? Math.round((totalPoints4 / totalCredits) * 100) / 100 : 0;
  const cpa10 = totalCredits > 0 ? Math.round((totalPoints10 / totalCredits) * 100) / 100 : 0;

  return { cpa4, cpa10, totalCredits, passedCredits, debtCredits };
}

/**
 * Hệ thống Cảnh báo sớm (Early Warning System) dựa trên 4 nhóm chỉ báo:
 * 1. Kết quả học tập (GPA/CPA)
 * 2. Tiến độ tích lũy tín chỉ
 * 3. Học phần chưa đạt / nợ môn
 * 4. Mức độ tương tác số & chuyên cần LMS
 */
export function analyzeStudentEarlyWarning(
  profile: StudentProfile,
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): EarlyWarningAnalysis {
  const { cpa4, passedCredits, debtCredits } = calculateCumulativeCpa(profile.semesters, config);

  // Lấy kết quả kỳ gần nhất
  const latestSemester = profile.semesters[profile.semesters.length - 1];
  const latestGpa4 = latestSemester ? latestSemester.semesterGpa4 : cpa4;

  // 1. Chỉ báo Kết quả học tập (Academic Performance)
  let academicScore = 0;
  if (cpa4 < config.warningThresholds.dropoutCpa) academicScore = 95;
  else if (cpa4 < config.warningThresholds.level1Cpa) academicScore = 80;
  else if (cpa4 < config.warningThresholds.level2Cpa) academicScore = 60;
  else if (cpa4 < 2.0) academicScore = 45;
  else if (cpa4 < 2.5) academicScore = 25;
  else academicScore = 5;

  const academicIndicator: IndicatorScore = {
    name: "Kết quả học tập (CPA & GPA kỳ)",
    category: "academic_performance",
    score: academicScore,
    weight: 0.35,
    status: academicScore > 60 ? "critical" : academicScore > 30 ? "moderate" : "good",
    description: `CPA tích lũy hiện tại: ${cpa4.toFixed(2)}/4.00 | Kỳ gần nhất: ${latestGpa4.toFixed(2)}/4.00`,
    details:
      cpa4 < config.warningThresholds.level1Cpa
        ? "CPA dưới ngưỡng an toàn, nằm trong khung cảnh báo học vụ của trường."
        : "Điểm trung bình tích lũy duy trì ở mức ổn định.",
  };

  // 2. Chỉ báo Tiến độ tích lũy tín chỉ (Credit Progress)
  // Tính số tín chỉ chuẩn theo học kỳ hiện tại (trung bình 16 tín chỉ / kỳ)
  const expectedCreditsAtSemester = profile.currentSemester * 16;
  const creditShortfall = Math.max(0, expectedCreditsAtSemester - passedCredits);
  let creditProgressScore = 0;
  if (creditShortfall > 20) creditProgressScore = 90;
  else if (creditShortfall > 12) creditProgressScore = 65;
  else if (creditShortfall > 6) creditProgressScore = 35;
  else creditProgressScore = 10;

  const creditIndicator: IndicatorScore = {
    name: "Tiến độ tích lũy tín chỉ",
    category: "credit_progress",
    score: creditProgressScore,
    weight: 0.25,
    status: creditProgressScore > 60 ? "critical" : creditProgressScore > 30 ? "moderate" : "good",
    description: `Đã tích lũy ${passedCredits}/${profile.totalRequiredCredits} TC (Chuẩn kỳ ${profile.currentSemester}: ~${expectedCreditsAtSemester} TC)`,
    details:
      creditShortfall > 12
        ? `Chậm tiến độ ${creditShortfall} tín chỉ so với lộ trình chuẩn 4 năm.`
        : "Tiến độ tích lũy tín chỉ theo sát khung chương trình đào tạo.",
  };

  // 3. Chỉ báo Học phần chưa đạt (Failed / Debt Courses)
  let debtScore = 0;
  if (debtCredits >= config.warningThresholds.maxDebtCredits) debtScore = 95;
  else if (debtCredits > 12) debtScore = 75;
  else if (debtCredits > 6) debtScore = 45;
  else if (debtCredits > 0) debtScore = 20;
  else debtScore = 0;

  const failedCoursesIndicator: IndicatorScore = {
    name: "Học phần chưa đạt (Nợ môn)",
    category: "failed_courses",
    score: debtScore,
    weight: 0.25,
    status: debtScore > 60 ? "critical" : debtScore > 20 ? "moderate" : "good",
    description: `Đang nợ ${debtCredits} tín chỉ chưa hoàn thành`,
    details:
      debtCredits > 12
        ? "Số tín chỉ nợ cao, gây nguy cơ nghẽn môn tiên quyết và kéo dài thời gian tốt nghiệp."
        : debtCredits > 0
        ? "Cần lên kế hoạch học trả nợ vào kỳ phụ hè hoặc kỳ tiếp theo."
        : "Không có môn nợ, hoàn thành tất cả học phần đã đăng ký.",
  };

  // 4. Chỉ báo Mức độ tương tác số (Digital Engagement)
  const lms = profile.digitalEngagement;
  const avgEngagement = (lms.lmsAccessRate + lms.assignmentOnTimeRate + lms.attendanceRate) / 3;
  let engagementRiskScore = 0;
  if (avgEngagement < 50) engagementRiskScore = 85;
  else if (avgEngagement < 70) engagementRiskScore = 55;
  else if (avgEngagement < 85) engagementRiskScore = 25;
  else engagementRiskScore = 5;

  const digitalIndicator: IndicatorScore = {
    name: "Tương tác số & Chuyên cần LMS",
    category: "digital_engagement",
    score: engagementRiskScore,
    weight: 0.15,
    status: engagementRiskScore > 60 ? "critical" : engagementRiskScore > 30 ? "moderate" : "good",
    description: `Tương tác hệ thống LMS: ${Math.round(avgEngagement)}% (Chuyên cần: ${lms.attendanceRate}%, Nộp bài: ${lms.assignmentOnTimeRate}%)`,
    details:
      avgEngagement < 65
        ? "Mức độ tương tác với bài giảng online và nộp bài tập giảm sút – tín hiệu sớm của nguy cơ bỏ cuộc."
        : "Tương tác số đều đặn, tham gia đầy đủ các hoạt động học tập trên nền tảng.",
  };

  // Tổng hợp Điểm rủi ro tổng thể (Academic At-Risk Score 0 - 100)
  const totalRiskScore = Math.round(
    academicScore * academicIndicator.weight +
      creditProgressScore * creditIndicator.weight +
      debtScore * failedCoursesIndicator.weight +
      engagementRiskScore * digitalIndicator.weight
  );

  let riskLevel: RiskLevel = "safe";
  let academicWarningStatus: EarlyWarningAnalysis["academicWarningStatus"] = "Không cảnh cáo";

  if (totalRiskScore >= 75 || cpa4 < config.warningThresholds.dropoutCpa) {
    riskLevel = "danger";
    academicWarningStatus = "Nguy cơ Buộc thôi học";
  } else if (totalRiskScore >= 50 || cpa4 < config.warningThresholds.level1Cpa) {
    riskLevel = "warning";
    academicWarningStatus = "Cảnh báo Mức 2";
  } else if (totalRiskScore >= 28 || cpa4 < config.warningThresholds.level2Cpa) {
    riskLevel = "notice";
    academicWarningStatus = "Cảnh báo Mức 1";
  } else {
    riskLevel = "safe";
    academicWarningStatus = "Không cảnh cáo";
  }

  // Dự báo Xếp loại tốt nghiệp & Số kỳ hoàn thành
  let predictedGraduationClassification: EarlyWarningAnalysis["predictedGraduationClassification"] = "Khá";
  if (cpa4 >= 3.6 && creditProgressScore < 30) predictedGraduationClassification = "Xuất sắc";
  else if (cpa4 >= 3.2 && creditProgressScore < 40) predictedGraduationClassification = "Giỏi";
  else if (cpa4 >= 2.5 && creditProgressScore < 60) predictedGraduationClassification = "Khá";
  else if (cpa4 >= 2.0 && creditProgressScore < 70) predictedGraduationClassification = "Trung bình";
  else predictedGraduationClassification = "Chậm tiến độ / Nguy cơ đình chỉ";

  const remainingCredits = Math.max(0, profile.totalRequiredCredits - passedCredits);
  const avgCreditsPerSem = 16;
  const projectedSemestersToGraduate = Math.ceil(remainingCredits / avgCreditsPerSem);

  const keyRiskFactors: string[] = [];
  const recommendedInterventions: string[] = [];

  if (cpa4 < 2.0) keyRiskFactors.push(`Điểm tích lũy CPA (${cpa4.toFixed(2)}) chạm ngưỡng báo động đỏ.`);
  if (debtCredits > 0) keyRiskFactors.push(`Còn tồn đọng ${debtCredits} tín chỉ học phần chưa đạt.`);
  if (lms.attendanceRate < 75) keyRiskFactors.push(`Chuyên cần lớp học thấp (${lms.attendanceRate}%), nguy cơ bị cấm thi.`);
  if (lms.assignmentOnTimeRate < 60) keyRiskFactors.push(`Tỷ lệ nộp bài tập đúng hạn thấp (${lms.assignmentOnTimeRate}%).`);
  if (creditShortfall > 10) keyRiskFactors.push(`Chậm tiến độ so với kế hoạch học tập chuẩn.`);

  if (keyRiskFactors.length === 0) {
    keyRiskFactors.push("Không phát hiện yếu tố rủi ro nghiêm trọng. Tiến độ học tập ổn định.");
  }

  // Khuyến nghị can thiệp theo chuẩn Chủ đề 1
  if (riskLevel === "danger" || riskLevel === "warning") {
    recommendedInterventions.push("Kết nối khẩn cấp với Cố vấn học tập (CVHT) để làm đơn xin giảm tải tín chỉ.");
    recommendedInterventions.push("Đăng ký vào CLB Trợ giảng & Gia sư đồng cấp (Peer Tutoring) cho các môn nợ.");
    recommendedInterventions.push("Học lại môn điểm F vào kỳ hè gần nhất để xóa điểm liệt, kéo CPA tức thì.");
    recommendedInterventions.push("Kích hoạt chế độ kiểm soát thời gian học và điểm danh trên hệ thống số.");
  } else if (riskLevel === "notice") {
    recommendedInterventions.push("Tập trung cải thiện điểm các môn cơ sở ngành điểm D/C để nâng CPA lên >= 2.5.");
    recommendedInterventions.push("Tăng cường tương tác LMS, hoàn thành 100% bài quiz trực tuyến.");
    recommendedInterventions.push("Giới hạn đăng ký tối đa 16 tín chỉ trong kỳ tiếp theo để tránh quá tải.");
  } else {
    recommendedInterventions.push("Duy trì nhịp độ học tập hiện tại và tích cực tham gia nghiên cứu khoa học.");
    recommendedInterventions.push("Đăng ký môn học vượt nếu muốn tốt nghiệp sớm 1 học kỳ.");
  }

  return {
    riskScore: totalRiskScore,
    riskLevel,
    academicWarningStatus,
    indicators: [academicIndicator, creditIndicator, failedCoursesIndicator, digitalIndicator],
    predictedGraduationClassification,
    projectedSemestersToGraduate,
    keyRiskFactors,
    recommendedInterventions,
  };
}
