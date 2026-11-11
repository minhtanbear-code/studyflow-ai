export interface SupportTicketItem {
  id: string;
  category: "rules" | "methods" | "psychology" | "meeting";
  categoryLabel: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  blindAliasId: string;
  tier: "peer" | "advisor";
  tierLabel: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  advisorReply?: {
    advisorName: string;
    advisorRole: string;
    message: string;
    repliedAt: string;
  };
}

// Bộ lưu trữ bộ nhớ chia sẻ giữa Sinh viên (/help) và Cố vấn (/advisor)
let globalTickets: SupportTicketItem[] = [
  {
    id: "TCK-101",
    category: "rules",
    categoryLabel: "Quy chế đào tạo",
    title: "Xin tư vấn điều kiện hủy học phần sau tuần rút môn",
    description: "Em bị trùng lịch thực tập đột xuất nên muốn hỏi thủ tục xin rút học phần muộn có được bảo lưu học phí không ạ?",
    isAnonymous: true,
    blindAliasId: "Học viên #8291",
    tier: "advisor",
    tierLabel: "Cố vấn học tập khoa",
    status: "open",
    createdAt: "Hôm nay, 10:15",
  },
  {
    id: "TCK-102",
    category: "methods",
    categoryLabel: "Phương pháp học",
    title: "Cần tìm bạn khóa trên hỗ trợ ôn thi Giải tích 2",
    description: "Em học phần Tích phân đường mặt thấy quá khó, muốn tham gia nhóm học kèm của các anh chị Peer Mentor.",
    isAnonymous: false,
    blindAliasId: "Nguyễn Văn A (K68)",
    tier: "peer",
    tierLabel: "Sinh viên trợ giảng",
    status: "in_progress",
    createdAt: "Hôm qua, 15:30",
    advisorReply: {
      advisorName: "Trần Minh Đức",
      advisorRole: "Peer Mentor CLB Tin học",
      message: "Chào bạn, tối thứ 5 tuần này lúc 19h30 nhóm mình có buổi kèm nhóm tại tầng 2 Thư viện. Bạn ghé tham gia nhé!",
      repliedAt: "Hôm qua, 16:45",
    },
  },
];

export function getTicketsList(): SupportTicketItem[] {
  return globalTickets;
}

export function createNewTicket(data: {
  category: "rules" | "methods" | "psychology" | "meeting";
  title: string;
  description: string;
  isAnonymous: boolean;
}): SupportTicketItem {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const blindAliasId = data.isAnonymous ? `Học viên #${randomNum}` : "Sinh viên ẩn danh";

  const categoryLabels = {
    rules: "Quy chế đào tạo",
    methods: "Phương pháp học",
    psychology: "Tâm lý & Áp lực",
    meeting: "Đặt lịch gặp trực tiếp",
  };

  const isFacultyCase = data.category === "rules" || data.category === "meeting";

  const newTicket: SupportTicketItem = {
    id: `TCK-${Math.floor(200 + Math.random() * 800)}`,
    category: data.category,
    categoryLabel: categoryLabels[data.category],
    title: data.title,
    description: data.description,
    isAnonymous: data.isAnonymous,
    blindAliasId: blindAliasId,
    tier: isFacultyCase ? "advisor" : "peer",
    tierLabel: isFacultyCase ? "Cố vấn học tập khoa" : "Sinh viên trợ giảng (Peer)",
    status: "open",
    createdAt: "Vừa xong",
  };

  globalTickets = [newTicket, ...globalTickets];
  return newTicket;
}

export function replyToTicket(
  ticketId: string,
  replyText: string,
  advisorName: string = "ThS. Nguyễn Văn Bình (CVHT Khoa)"
): boolean {
  const ticket = globalTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;

  ticket.status = "in_progress";
  ticket.advisorReply = {
    advisorName,
    advisorRole: ticket.tier === "advisor" ? "Cố vấn học tập khoa" : "Peer Mentor",
    message: replyText,
    repliedAt: "Vừa xong",
  };

  return true;
}
