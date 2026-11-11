export interface MicroActionItem {
  id: string;
  title: string;
  category: "calm" | "focus" | "guide" | "cheer";
  badge: string;
  duration: string;
  icon: string;
  headline: string;
  instruction: string[];
  actionBtnText: string;
  actionType: "breathe" | "timer" | "link";
  targetUrl?: string;
}

export function getRecommendedMicroAction(
  energyLevel: number,
  selectedTopics: string[]
): MicroActionItem {
  // Kịch bản 1: Đuối sức / Kiệt quệ (Mức 1)
  if (energyLevel === 1) {
    return {
      id: "breathe-478",
      title: "Bài tập thở 4-7-8 giải phóng căng thẳng",
      category: "calm",
      badge: "Xoa dịu thần kinh • 2 phút",
      duration: "2 phút",
      icon: "🌬️",
      headline: "Đừng ép bản thân cố học lúc này. Hãy cho não bộ 2 phút 'hạ nhiệt' trước:",
      instruction: [
        "1. Hít vào nhẹ nhàng bằng mũi trong 4 giây.",
        "2. Giữ hơi thở lại trong 7 giây.",
        "3. Thở ra từ từ bằng miệng tạo âm thanh êm dịu trong 8 giây.",
        "Lặp lại 3 chu kỳ này để đưa nhịp tim và hệ thần kinh về trạng thái an toàn.",
      ],
      actionBtnText: "Bắt đầu bài tập thở ngay",
      actionType: "breathe",
    };
  }

  // Kịch bản 2: Áp lực / Quá tải (Mức 2)
  if (energyLevel === 2) {
    if (selectedTopics.some((t) => t.includes("lập trình") || t.includes("Đồ án"))) {
      return {
        id: "chunking-code",
        title: "Kỹ thuật 'Cắt nhỏ Task' giải cứu Đồ án",
        category: "focus",
        badge: "Gỡ rối đồ án • 5 phút",
        duration: "5 phút",
        icon: "🧩",
        headline: "Khi đồ án quá lớn làm bạn choáng ngợp, hãy áp dụng quy tắc 1 chức năng:",
        instruction: [
          "Đừng nghĩ về toàn bộ đồ án nữa.",
          "Chỉ chọn DUY NHẤT 1 việc nhỏ làm được trong 15 phút (ví dụ: tạo 1 giao diện nút bấm hoặc viết 1 hàm test).",
          "Tắt hết tab khác, hoàn thành việc nhỏ đó để lấy lại đà tự tin.",
        ],
        actionBtnText: "Xem cẩm nang gỡ rối đồ án",
        actionType: "link",
        targetUrl: "/navigator",
      };
    }

    if (selectedTopics.some((t) => t.includes("Quy chế") || t.includes("tín chỉ"))) {
      return {
        id: "academic-rules-faq",
        title: "Tra cứu Quy chế đào tạo có mộc đỏ",
        category: "guide",
        badge: "Giải tỏa băn khoăn • 1 phút",
        duration: "1 phút",
        icon: "📜",
        headline: "Nhiều băn khoăn học vụ có thể giải quyết nhanh bằng căn cứ chính thức:",
        instruction: [
          "Mọi quy định về thi lại, học cải thiện và cảnh báo học vụ đều có văn bản rõ ràng.",
          "Bạn có thể tra cứu nhanh với Trợ lý AI để có trích dẫn điều khoản chính xác.",
        ],
        actionBtnText: "Hỏi Trợ lý AI ngay",
        actionType: "link",
        targetUrl: "/assistant",
      };
    }

    return {
      id: "brain-dump",
      title: "Kỹ thuật 'Xả não' (Brain Dump) giảm tải",
      category: "calm",
      badge: "Sắp xếp suy nghĩ • 3 phút",
      duration: "3 phút",
      icon: "📝",
      headline: "Đầu óc đang chứa quá nhiều việc dở dang. Hãy đổ hết ra ngoài:",
      instruction: [
        "Lấy 1 tờ giấy hoặc ghi chú trên máy.",
        "Viết ra toàn bộ 5 việc đang làm bạn lo lắng nhất trong đầu.",
        "Gạch bỏ 3 việc không cần nộp ngay trong hôm nay. Chỉ tập trung việc số 1.",
      ],
      actionBtnText: "Tạo ghi chú mục tiêu",
      actionType: "link",
      targetUrl: "/progress",
    };
  }

  // Kịch bản 3: Vừa sức / Ổn định (Mức 3)
  if (energyLevel === 3) {
    return {
      id: "pomodoro-25",
      title: "Khởi động 1 phiên Pomodoro 25 phút",
      category: "focus",
      badge: "Duy trì nhịp độ • 25 phút",
      duration: "25 phút",
      icon: "⏱️",
      headline: "Phong độ học tập của bạn đang rất ổn định. Hãy kích hoạt đà tập trung:",
      instruction: [
        "Đặt hẹn giờ 25 phút tập trung cao độ cho môn học bạn vừa chọn.",
        "Nghỉ giải lao 5 phút uống nước sau khi kết thúc phiên.",
        "Sau 4 phiên, tự thưởng cho mình một khoảng nghỉ dài 15 phút.",
      ],
      actionBtnText: "Mở bảng tiến độ mục tiêu",
      actionType: "link",
      targetUrl: "/progress",
    };
  }

  // Kịch bản 4 & 5: Năng lượng tốt & Tràn đầy (Mức 4, 5)
  return {
    id: "eat-that-frog",
    title: "Chiến thuật 'Nuốt con ếch' (Eat That Frog)",
    category: "cheer",
    badge: "Bứt phá mục tiêu • Hôm nay",
    duration: "Ưu tiên số 1",
    icon: "🚀",
    headline: "Năng lượng của bạn đang ở đỉnh cao! Đây là thời điểm vàng để làm việc khó nhất:",
    instruction: [
      "Xác định 1 môn học hoặc bài tập khó nhằn nhất mà bạn đã trì hoãn mấy ngày qua.",
      "Tận dụng ngay 60 phút sung sức này để giải quyết nó trước tiên.",
      "Cảm giác chinh phục được việc khó sẽ giúp bạn duy trì hưng phấn suốt cả tuần!",
    ],
    actionBtnText: "Lên danh sách nhiệm vụ ngay",
    actionType: "link",
    targetUrl: "/progress",
  };
}
