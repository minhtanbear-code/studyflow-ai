"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, Lock, EyeOff, Send, MessageSquare, CheckCircle2, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { getTicketsList, createNewTicket, SupportTicketItem } from "@/core/services/ticket.service";

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Form states
  const [category, setCategory] = useState<"rules" | "methods" | "psychology" | "meeting">("rules");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [successTicket, setSuccessTicket] = useState<SupportTicketItem | null>(null);

  const [ticketList, setTicketList] = useState<SupportTicketItem[]>(getTicketsList());

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const created = createNewTicket({
      category,
      title: title.trim(),
      description: description.trim(),
      isAnonymous,
    });

    setSuccessTicket(created);
    setTicketList(getTicketsList());
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang chủ</span>
            </Link>

            <Link
              href="/advisor"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Chuyển sang Cổng Cố Vấn (Advisor Hub)</span>
            </Link>
          </div>

          {/* Tiêu đề trang */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Blind Token Encryption • Ẩn danh tuyệt đối</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gửi Yêu Cầu Hỗ Trợ Đến Cố Vấn & Trợ Giảng
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Bạn có thể hoàn toàn yên tâm chia sẻ những bế tắc trong học tập. Mọi thắc mắc được giải đáp bởi Đội ngũ Cố vấn khoa hoặc Sinh viên trợ giảng theo nguyện vọng của bạn.
            </p>
          </div>

          {/* Tabs chuyển đổi */}
          <div className="flex border-b border-slate-200 mb-8 space-x-4">
            <button
              onClick={() => { setActiveTab("create"); setSuccessTicket(null); }}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
                activeTab === "create"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tạo Yêu Cầu Mới</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
                activeTab === "history"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Hộp Thư Yêu Cầu Của Bạn ({ticketList.length})</span>
            </button>
          </div>

          {/* TAB 1: FORM TẠO YÊU CẦU MỚI */}
          {activeTab === "create" && (
            <div>
              {!successTicket ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                  {/* BẬT TẮT CHẾ ĐỘ ẨN DANH */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-start space-x-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <EyeOff className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Chế Độ Bảo Vệ Danh Tính (Blind Token)
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {isAnonymous
                            ? "Đang BẬT: Tên và mã sinh viên của bạn sẽ được thay thế bằng biệt danh ẩn danh như 'Học viên #8291'. Cố vấn hoàn toàn không biết bạn là ai."
                            : "Đang TẮT: Cố vấn sẽ thấy thông tin tài khoản của bạn để liên hệ trực tiếp."}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Danh mục */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Nhóm vấn đề bạn cần trợ giúp
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "rules", label: "Quy chế đào tạo & Tín chỉ", desc: "Chuyển về Cố vấn học tập khoa" },
                          { id: "methods", label: "Phương pháp & Môn học khó", desc: "Chuyển về Sinh viên trợ giảng (Peer)" },
                          { id: "psychology", label: "Căng thẳng & Áp lực thi cử", desc: "Chuyển về Phòng tham vấn tâm lý" },
                          { id: "meeting", label: "Hẹn gặp trực tiếp Cố vấn", desc: "Xếp lịch hẹn tại văn phòng khoa" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCategory(item.id as any)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              category === item.id
                                ? "bg-indigo-50 border-indigo-400 shadow-xs"
                                : "bg-slate-50/60 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900">{item.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tiêu đề câu hỏi */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tóm tắt câu hỏi hoặc bế tắc của bạn
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Xin hướng dẫn làm đơn phúc khảo bài thi Giải tích..."
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>

                    {/* Chi tiết nội dung */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Mô tả chi tiết hoàn cảnh hoặc khó khăn
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Hãy chia sẻ rõ tình huống của bạn để người phụ trách đưa ra giải pháp chính xác nhất..."
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gửi Phiếu Yêu Cầu {isAnonymous ? "(Ẩn danh)" : ""}</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* MÀN HÌNH BÁO GỬI THÀNH CÔNG */
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Mã phiếu: {successTicket.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-3">
                      Đã Gửi Yêu Cầu Thành Công!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                      Biệt danh ẩn danh của bạn là:{" "}
                      <strong className="text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                        {successTicket.blindAliasId}
                      </strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5">
                    <p className="font-semibold text-slate-800">Quy trình xử lý tiếp theo:</p>
                    <p>• Phiếu được chuyển đến: <strong>{successTicket.tierLabel}</strong></p>
                    <p>• Thời gian dự kiến phản hồi: Trong vòng 24 giờ</p>
                    <p>• Bạn có thể theo dõi câu trả lời tại tab &quot;Hộp Thư Yêu Cầu Của Bạn&quot;</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("history")}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                    >
                      Xem trong Hộp Thư
                    </button>
                    <Link
                      href="/advisor"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mở Cổng Cố Vấn (Xem ca vừa gửi)
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HỘP THƯ LỊCH SỬ YÊU CẦU */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {ticketList.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {ticket.categoryLabel}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        ticket.status === "open"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {ticket.status === "open" ? "Chờ phản hồi" : "Đã có phản hồi"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ticket.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticket.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>Người gửi: <strong className="text-slate-600">{ticket.blindAliasId}</strong></span>
                      <span>•</span>
                      <span>Điều phối: {ticket.tierLabel}</span>
                      <span>•</span>
                      <span>{ticket.createdAt}</span>
                    </div>
                  </div>

                  {/* KHỐI PHẢN HỒI NẾU CÓ */}
                  {ticket.advisorReply && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-indigo-900 font-bold">
                        <span className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{ticket.advisorReply.advisorName} ({ticket.advisorReply.advisorRole})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{ticket.advisorReply.repliedAt}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pt-1">
                        &quot;{ticket.advisorReply.message}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
