export interface CampusSlang {
  slang: string;
  formalTerm: string;
  explanation: string;
  targetDocCode: string;
}

export interface SupportResource {
  id: string;
  title: string;
  category: "academic_rules" | "peer_support" | "advisor" | "wellbeing";
  categoryLabel: string;
  badge: string;
  description: string;
  contactInfo: {
    office: string;
    email: string;
    hours: string;
  };
  relatedSlangs: string[];
  docRef?: string;
  actionText: string;
  actionUrl?: string;
}

export const campusSlangsData: CampusSlang[] = [
  {
    slang: "rớt môn",
    formalTerm: "Học phần chưa đạt (Điểm F)",
    explanation: "Khi tổng kết môn dưới 4.0 (thang 10) hoặc điểm F (thang chữ). Bạn có quyền đăng ký học lại hoặc thi cải thiện ở học kỳ tiếp theo.",
    targetDocCode: "QĐ-124/Điều-14",
  },
  {
    slang: "nợ môn",
    formalTerm: "Tích lũy học phần chưa hoàn thành",
    explanation: "Chưa hoàn tất các môn tiên quyết hoặc môn bắt buộc trong khung chương trình đào tạo của ngành.",
    targetDocCode: "QĐ-124/Điều-10",
  },
  {
    slang: "treo bằng",
    formalTerm: "Hoãn xét công nhận tốt nghiệp",
    explanation: "Đã hoàn thành các tín chỉ chuyên môn nhưng còn thiếu chuẩn đầu ra điều kiện (chứng chỉ Tiếng Anh B1, Tin học MOS/IC3, GDQP hoặc GDTC).",
    targetDocCode: "QĐ-88/Điều-22",
  },
  {
    slang: "học vượt",
    formalTerm: "Đăng ký học vượt tiến độ",
    explanation: "Sinh viên có điểm tích lũy GPA từ Khá trở lên được phép đăng ký tối đa 24-28 tín chỉ/kỳ để hoàn thành chương trình trước hạn.",
    targetDocCode: "QĐ-124/Điều-8",
  },
  {
    slang: "cảnh báo học vụ",
    formalTerm: "Cảnh báo kết quả học tập định kỳ",
    explanation: "Áp dụng khi điểm GPA kỳ dưới 1.0 hoặc GPA tích lũy dưới 1.2 (năm 1), 1.4 (năm 2), 1.6 (năm 3). Bị cảnh báo 3 lần liên tiếp mới xem xét buộc thôi học.",
    targetDocCode: "QĐ-124/Điều-18",
  },
  {
    slang: "bảo lưu",
    formalTerm: "Nghỉ học tạm thời và bảo lưu kết quả",
    explanation: "Quyền xin tạm dừng tiến độ học tập tối đa 2 học kỳ (do lý do sức khỏe, gia đình hoặc nghĩa vụ) mà vẫn giữ nguyên điểm số đã tích lũy.",
    targetDocCode: "QĐ-124/Điều-16",
  },
];

export const supportResourcesData: SupportResource[] = [
  {
    id: "res-1",
    title: "Phòng Quản Lý Đào Tạo & Khảo Thí",
    category: "academic_rules",
    categoryLabel: "Quy chế học vụ",
    badge: "Văn bản chính thức",
    description: "Giải quyết các thủ tục: phúc khảo bài thi, đăng ký học lại/cải thiện, cấp bảng điểm, xét miễn giảm học phần và đăng ký thi tốt nghiệp.",
    contactInfo: {
      office: "Phòng 102 - Tòa nhà Điều hành",
      email: "daotao@daihoc.edu.vn",
      hours: "Thứ 2 - Thứ 6: 08h00 - 16h30",
    },
    relatedSlangs: ["rớt môn", "nợ môn", "treo bằng", "học vượt", "bảo lưu"],
    docRef: "Quyết định 124/QĐ-ĐH ban hành Quy chế đào tạo tín chỉ",
    actionText: "Tải mẫu đơn học vụ",
  },
  {
    id: "res-2",
    title: "Đội Ngũ Cố Vấn Học Tập (CVHT) Khoa",
    category: "advisor",
    categoryLabel: "Cố vấn khoa",
    badge: "Hỗ trợ 1-1",
    description: "Tư vấn lộ trình học tập, định hướng chọn chuyên ngành, tháo gỡ điểm nghẽn học tập và xác nhận các đơn từ học vụ cá nhân.",
    contactInfo: {
      office: "Văn phòng Khoa chuyên môn",
      email: "covanhoctap@daihoc.edu.vn",
      hours: "Tiếp sinh viên theo lịch hẹn hoặc thứ 3 & thứ 5 hàng tuần",
    },
    relatedSlangs: ["cảnh báo học vụ", "bảo lưu", "học vượt"],
    docRef: "Quy chế công tác Cố vấn học tập",
    actionText: "Đặt lịch hẹn cố vấn",
    actionUrl: "/help",
  },
  {
    id: "res-3",
    title: "Mạng Lưới Sinh Viên Trợ Giảng (Peer Mentors)",
    category: "peer_support",
    categoryLabel: "Đồng cấp hỗ trợ",
    badge: "Gần gũi • Thân thiện",
    description: "Nhóm sinh viên khóa trên học lực giỏi hỗ trợ kèm cặp các môn khó nhằn: Giải tích, Đại số, Lập trình C/Python, Kỹ thuật số.",
    contactInfo: {
      office: "Không gian Tự học - Tầng 2 Thư viện",
      email: "peer.mentors@student.edu.vn",
      hours: "Hàng ngày: 17h30 - 20h30",
    },
    relatedSlangs: ["rớt môn", "nợ môn"],
    actionText: "Xem lịch kèm học",
  },
  {
    id: "res-4",
    title: "CLB Học Thuật & Tin Học Sinh Viên",
    category: "peer_support",
    categoryLabel: "Đồng cấp hỗ trợ",
    badge: "Tài liệu & Đề thi",
    description: "Kho tổng hợp đề thi mẫu có lời giải chi tiết, slide bài giảng tóm tắt và diễn đàn hỏi đáp bài tập lớn cho sinh viên.",
    contactInfo: {
      office: "Văn phòng Đoàn - Hội Sinh viên",
      email: "clb.hocthuat@student.edu.vn",
      hours: "Online 24/7 trên Diễn đàn sinh viên",
    },
    relatedSlangs: ["rớt môn", "nợ môn"],
    actionText: "Mở kho đề thi mẫu",
  },
  {
    id: "res-5",
    title: "Trung Tâm Tham Vấn Tâm Lý Học Đường",
    category: "wellbeing",
    categoryLabel: "Chăm sóc tâm lý",
    badge: "Bảo mật 100%",
    description: "Lắng nghe và hỗ trợ sinh viên vượt qua căng thẳng mùa thi, áp lực đồng trang lứa (peer pressure), mất ngủ và khủng hoảng định hướng.",
    contactInfo: {
      office: "Phòng Tham vấn - Tầng 3 Nhà Thể thao",
      email: "thamvantamly@daihoc.edu.vn",
      hours: "Thứ 2 - Thứ 7: 09h00 - 17h00",
    },
    relatedSlangs: ["cảnh báo học vụ"],
    actionText: "Đăng ký tư vấn kín",
  },
];
