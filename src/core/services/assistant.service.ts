export interface CitationDetail {
  docCode: string;
  docTitle: string;
  issuingOrg: string;
  signDate: string;
  article: string;
  clause: string;
  fullExcerpt: string;
  highlightWords: string[];
  status: "approved";
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: CitationDetail[];
}

export const mockCitations: Record<string, CitationDetail> = {
  "qd-124-d18": {
    docCode: "QĐ 124/QĐ-ĐH",
    docTitle: "Quy chế Đào tạo Trình độ Đại học theo Hệ thống Tín chỉ",
    issuingOrg: "Hiệu trưởng Trường Đại học ký ban hành",
    signDate: "15/08/2024 (Đang có hiệu lực)",
    article: "Điều 18",
    clause: "Khoản 2: Xử lý kết quả học tập và Cảnh báo học vụ",
    fullExcerpt:
      "Sinh viên bị cảnh báo kết quả học tập nếu thuộc một trong các trường hợp sau: a) Điểm trung bình chung học kỳ đạt dưới 0.80 đối với học kỳ đầu của khóa học, dưới 1.00 đối với các học kỳ tiếp theo; b) Điểm trung bình chung tích lũy đạt dưới 1.20 đối với sinh viên năm thứ nhất, dưới 1.40 đối với sinh viên năm thứ hai, dưới 1.60 đối với sinh viên năm thứ ba. Sinh viên bị cảnh báo học vụ liên tiếp 03 lần thì mới thuộc diện xem xét buộc thôi học.",
    highlightWords: ["dưới 1.00", "cảnh báo học vụ liên tiếp 03 lần", "xem xét buộc thôi học"],
    status: "approved",
  },
  "qd-124-d14": {
    docCode: "QĐ 124/QĐ-ĐH",
    docTitle: "Quy chế Đào tạo Trình độ Đại học theo Hệ thống Tín chỉ",
    issuingOrg: "Hiệu trưởng Trường Đại học ký ban hành",
    signDate: "15/08/2024 (Đang có hiệu lực)",
    article: "Điều 14",
    clause: "Khoản 3: Đánh giá học phần và thi lại / cải thiện",
    fullExcerpt:
      "Học phần đạt điểm F (dưới 4.0 thang điểm 10) là học phần chưa tích lũy. Sinh viên bắt buộc phải đăng ký học lại nếu đó là học phần bắt buộc, hoặc có thể học môn học khác thay thế tương đương nếu là môn tự chọn. Điểm số của học phần học lại sẽ được ghi nhận vào học kỳ học lại và thay thế điểm F trong việc tính điểm tích lũy tốt nghiệp.",
    highlightWords: ["điểm F", "đăng ký học lại", "thay thế điểm F trong việc tính điểm tích lũy"],
    status: "approved",
  },
  "qd-88-d22": {
    docCode: "QĐ 88/QĐ-ĐH",
    docTitle: "Quy định Chuẩn đầu ra và Điều kiện Công nhận Tốt nghiệp",
    issuingOrg: "Hội đồng Khoa học & Đào tạo phê duyệt",
    signDate: "10/01/2025 (Đang có hiệu lực)",
    article: "Điều 22",
    clause: "Khoản 1: Điều kiện xét tốt nghiệp",
    fullExcerpt:
      "Sinh viên được công nhận tốt nghiệp khi thỏa mãn đồng thời: 1) Tích lũy đủ số tín chỉ quy định của chương trình đào tạo; 2) Điểm trung bình chung tích lũy toàn khóa đạt từ 2.00 trở lên; 3) Có chứng chỉ Giáo dục Quốc phòng - An ninh và Giáo dục Thể chất; 4) Đạt chuẩn đầu ra Ngoại ngữ (tương đương B1/IELTS 5.0) và Tin học (MOS/IC3). Sinh viên chưa đạt chuẩn đầu ra điều kiện sẽ được tạm hoãn xét tốt nghiệp tối đa 02 năm.",
    highlightWords: ["từ 2.00 trở lên", "chuẩn đầu ra Ngoại ngữ", "tạm hoãn xét tốt nghiệp tối đa 02 năm"],
    status: "approved",
  },
};

export function getAIAnswerForQuery(query: string): { text: string; citations: CitationDetail[] } {
  const q = query.toLowerCase();

  if (q.includes("cảnh báo") || q.includes("thôi học") || q.includes("đuổi học")) {
    return {
      text: "Bạn đừng quá lo lắng! Việc bị cảnh báo học vụ là tín hiệu nhắc nhở để bạn điều chỉnh kế hoạch học tập, hoàn toàn không phải bị thôi học ngay lập tức. Theo quy chế đào tạo, bạn chỉ bị xem xét thôi học nếu bị cảnh báo liên tiếp 3 học kỳ. Hãy xem chi tiết căn cứ pháp quy bên dưới:",
      citations: [mockCitations["qd-124-d18"]],
    };
  }

  if (q.includes("rớt") || q.includes("nợ môn") || q.includes("điểm f") || q.includes("học lại")) {
    return {
      text: "Môn học bị điểm F (dưới 4.0) nghĩa là bạn chưa tích lũy được tín chỉ môn đó. Bạn hoàn toàn có quyền đăng ký học lại ở kỳ hè hoặc học kỳ chính tiếp theo. Khi học lại và đạt điểm cao hơn, điểm mới sẽ thay thế điểm F để kéo GPA tích lũy của bạn lên. Chi tiết quy định được trích dẫn dưới đây:",
      citations: [mockCitations["qd-124-d14"]],
    };
  }

  if (q.includes("tốt nghiệp") || q.includes("treo bằng") || q.includes("chuẩn đầu ra") || q.includes("bằng")) {
    return {
      text: "Để được nhận bằng tốt nghiệp chính thức, bạn cần đạt GPA tích lũy từ 2.00 trở lên và hoàn thành các chứng chỉ điều kiện: Tiếng Anh (chuẩn B1), Tin học, GDTC và GDQP. Nếu chưa kịp nộp chứng chỉ, bạn được phép hoãn xét tối đa 2 năm để bổ sung mà không bị hủy kết quả học tập.",
      citations: [mockCitations["qd-88-d22"]],
    };
  }

  // Mặc định
  return {
    text: "Cảm ơn bạn đã hỏi. Về vấn đề này, quy chế đào tạo tín chỉ đại học hiện hành có những quy định cụ thể nhằm hỗ trợ tối đa quyền lợi của người học. Dưới đây là trích dẫn văn bản quy chế chính thức liên quan:",
    citations: [mockCitations["qd-124-d14"], mockCitations["qd-124-d18"]],
  };
}
