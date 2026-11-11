import {
  ImprovementCoursePlan,
  ImprovementRoadmap,
  SemesterRegistrationPlan,
  StudentProfile,
  UniversityGradingConfig,
  WeeklyStudyAction,
} from "../domain/academic.types";
import {
  calculateCumulativeCpa,
  convertScoreToGrade,
  UNIVERSITY_PRESETS,
} from "./academicCalculator.service";

/**
 * Sinh lộ trình học cải thiện cá nhân hóa (Personalized Academic Improvement Roadmap)
 */
export function generateImprovementRoadmap(
  profile: StudentProfile,
  targetCpaGoal: number = 3.0,
  config: UniversityGradingConfig = UNIVERSITY_PRESETS.standard_moet
): ImprovementRoadmap {
  const { cpa4, totalCredits } = calculateCumulativeCpa(profile.semesters, config);

  // Tìm tất cả các môn đã học
  const allCourses = profile.semesters.flatMap((s) => s.courses);

  // Thuật toán tìm các môn có thể cải thiện (Điểm F, D, D+, C)
  const improvableCourses: ImprovementCoursePlan[] = [];

  for (const course of allCourses) {
    const grade = convertScoreToGrade(course.final10, config);
    // Nếu điểm hệ 4 < 2.5 (dưới C+)
    if (grade.gpa4 < 2.5) {
      // Mục tiêu cải thiện: nếu F thì lên B (3.0); nếu D thì lên B+ (3.5)
      const targetScore4 = grade.gpa4 === 0 ? 3.0 : 3.5;
      const targetLetter = grade.gpa4 === 0 ? "B" : "B+";

      // Mức tăng điểm tích lũy ước tính: (Delta Điểm * Số TC) / Tổng TC
      const deltaScore = targetScore4 - grade.gpa4;
      const effectiveTotalCredits = Math.max(totalCredits, 30);
      const expectedCpaIncrease = Math.round(((deltaScore * course.credits) / effectiveTotalCredits) * 100) / 100;

      let priority: "high" | "medium" | "low" = "medium";
      let reason = "";

      if (grade.gpa4 === 0) {
        priority = "high";
        reason = `Môn nợ (${course.credits} TC) làm kéo lùi điểm nặng nhất và cản trở điều kiện tốt nghiệp. Học lại sẽ tăng ngay +${expectedCpaIncrease} điểm CPA.`;
      } else if (course.credits >= 3) {
        priority = "high";
        reason = `Môn ${course.credits} tín chỉ điểm ${grade.letter}. Cải thiện lên ${targetLetter} mang lại hiệu quả nâng điểm cao nhất.`;
      } else {
        priority = "low";
        reason = `Môn tự chọn hoặc ít tín chỉ, cải thiện sau khi đã xử lý các môn chính.`;
      }

      improvableCourses.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        credits: course.credits,
        currentLetter: grade.letter,
        currentScore4: grade.gpa4,
        targetLetter,
        targetScore4,
        expectedCpaIncrease,
        priority,
        reason,
      });
    }
  }

  // Sắp xếp môn cần học lại theo thứ tự ưu tiên: High -> Medium -> Low, và CPA increase cao nhất
  improvableCourses.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return b.expectedCpaIncrease - a.expectedCpaIncrease;
  });

  // Kế hoạch đăng ký tín chỉ học kỳ tiếp theo
  let recommendedCredits = 15;
  let focusArea = "Phục hồi điểm số & trả nợ môn";
  const suggestedCourses: string[] = [];

  if (cpa4 < 2.0) {
    recommendedCredits = 14; // Giảm tải để tập trung
    focusArea = "Giảm tải áp lực – Ưu tiên học lại 1-2 môn nợ và môn đại cương cơ bản.";
    if (improvableCourses.length > 0) {
      suggestedCourses.push(`Học lại: ${improvableCourses[0].courseName} (${improvableCourses[0].credits} TC)`);
    }
    if (improvableCourses.length > 1) {
      suggestedCourses.push(`Học lại: ${improvableCourses[1].courseName} (${improvableCourses[1].credits} TC)`);
    }
    suggestedCourses.push("Đăng ký thêm 2 môn mới có độ khó vừa phải (6 TC)");
  } else if (cpa4 < 2.8) {
    recommendedCredits = 17;
    focusArea = "Tăng tốc điểm số – Cân bằng giữa học lại môn kéo điểm và học môn chuyên ngành mới.";
    if (improvableCourses.length > 0) {
      suggestedCourses.push(`Cải thiện điểm: ${improvableCourses[0].courseName}`);
    }
    suggestedCourses.push("Học phần Cơ sở ngành cốt lõi (6 TC)");
    suggestedCourses.push("Học phần Tự chọn chuyên ngành (6 TC)");
  } else {
    recommendedCredits = 19;
    focusArea = "Duy trì phong độ & Tích lũy tín chỉ vượt tiến độ.";
    suggestedCourses.push("Đăng ký đủ khối kiến thức chuyên ngành bắt buộc");
    suggestedCourses.push("Xem xét đăng ký trước môn học kỳ sau hoặc chuyên đề nghiên cứu");
  }

  const nextSemesterPlan: SemesterRegistrationPlan = {
    semesterName: `Học kỳ ${profile.currentSemester + 1} (${new Date().getFullYear()}-${new Date().getFullYear() + 1})`,
    recommendedCredits,
    focusArea,
    suggestedCourses,
    maxStressThreshold: cpa4 < 2.0 ? "Không đăng ký quá 16 tín chỉ" : "Tối đa 20 tín chỉ",
  };

  // Kế hoạch hành động 4 tuần (Study Sprint)
  const weeklyActions: WeeklyStudyAction[] = [
    {
      week: 1,
      title: "Rà soát & Định hình tâm lý",
      focus: "Thiết lập kế hoạch học tập và gỡ bỏ rào cản e ngại",
      actionItems: [
        "In phiếu điểm hoặc kiểm tra chi tiết các cột điểm chưa đạt trên cổng sinh viên.",
        "Xác nhận môn học lại cần đăng ký trong đợt điều chỉnh tín chỉ.",
        "Đăng ký kết nối 1 buổi tư vấn 30 phút cùng Cố vấn học tập (CVHT).",
      ],
      completed: true,
    },
    {
      week: 2,
      title: "Kích hoạt Phương pháp Active Recall & Pomodoro",
      focus: "Đổi mới phương pháp học cho các môn nhiều lý thuyết hoặc toán",
      actionItems: [
        "Lập bộ Flashcard tóm tắt công thức và định nghĩa môn khó.",
        "Áp dụng chu kỳ Pomodoro 25/5: 25 phút tập trung cao độ, 5 phút nghỉ ngơi.",
        "Tham gia nhóm học tập trên LMS hoặc Discord sinh viên.",
      ],
      completed: false,
    },
    {
      week: 3,
      title: "Ghép đôi Học tập & Tham gia Trợ giảng Đồng cấp",
      focus: "Học cùng bạn học giỏi hơn (Peer-to-Peer Learning)",
      actionItems: [
        "Tham gia buổi Workshop ôn tập giải đề của CLB Học thuật khoa.",
        "Nhờ một bạn sinh viên khóa trên (Mentor) giải đáp các bài tập khó môn nợ.",
        "Chủ động hỏi giảng viên trong giờ tiếp sinh viên (Office hours).",
      ],
      completed: false,
    },
    {
      week: 4,
      title: "Mô phỏng Thi thử & Kiểm soát Áp lực",
      focus: "Đánh giá sự tiến bộ trước các kỳ thi chính thức",
      actionItems: [
        "Làm thử ít nhất 2 đề thi các năm trước với bấm giờ như thi thật.",
        "Sử dụng công cụ What-If trên app để tính điểm thi cần đạt cho mục tiêu kỳ này.",
        "Ngủ đủ 7-8 tiếng trước ngày thi để giữ tinh thần sảng khoái.",
      ],
      completed: false,
    },
  ];

  // Các can thiệp số theo chuẩn Chủ đề 1
  const interventionSupportActions: ImprovementRoadmap["interventionSupportActions"] = [
    {
      type: "academic_advisor",
      title: "Đặt lịch hẹn Cố vấn học tập (CVHT)",
      description: "Được tư vấn lộ trình bảo lưu học phần, giảm tải môn học hoặc làm đơn xin hoãn tiến độ đúng quy chế.",
      actionLabel: "Đặt lịch tư vấn",
    },
    {
      type: "peer_tutoring",
      title: "Ghép đôi Trợ giảng đồng cấp (Peer Tutoring)",
      description: "Nhận kèm 1-1 miễn phí từ sinh viên giỏi khóa trên cho các môn đại cương (Toán, Vật lý, Lập trình).",
      actionLabel: "Tìm gia sư bạn học",
    },
    {
      type: "psychology_counsel",
      title: "Hỗ trợ Tâm lý & Giảm tải Stress học đường",
      description: "Phòng tư vấn tâm lý học đường luôn lắng nghe ẩn danh khi bạn cảm thấy kiệt sức hoặc mất phương hướng.",
      actionLabel: "Tâm sự ẩn danh",
    },
    {
      type: "policy_support",
      title: "Tra cứu Quy chế & Phúc khảo điểm thi",
      description: "Xem quyền lợi sinh viên về thời hạn nộp đơn xin phúc khảo, hủy học phần không tính điểm F.",
      actionLabel: "Xem quyền lợi sinh viên",
    },
  ];

  // Xếp loại mục tiêu
  let targetClassification = "Khá";
  if (targetCpaGoal >= 3.6) targetClassification = "Xuất sắc";
  else if (targetCpaGoal >= 3.2) targetClassification = "Giỏi";
  else if (targetCpaGoal >= 2.5) targetClassification = "Khá";
  else targetClassification = "Trung bình";

  return {
    currentCpa: cpa4,
    targetCpa: targetCpaGoal,
    targetClassification,
    retakeCoursesPlan: improvableCourses,
    nextSemesterPlan,
    weeklyActions,
    interventionSupportActions,
  };
}
