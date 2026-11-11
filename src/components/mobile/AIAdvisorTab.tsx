"use client";

import React, { useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { StudentProfile } from "@/core/domain/academic.types";
import { calculateCumulativeCpa } from "@/core/services/academicCalculator.service";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: string[];
}

interface AIAdvisorTabProps {
  profile: StudentProfile;
}

export function AIAdvisorTab({ profile }: AIAdvisorTabProps) {
  const { cpa4, passedCredits, debtCredits } = calculateCumulativeCpa(profile.semesters);

  const initialGreeting: Message = {
    id: "m_init",
    sender: "ai",
    text: `Chào bạn ${profile.name}! Tôi là Cố vấn Học vụ AI của bạn. 
Dựa trên dữ liệu học tập hiện tại, điểm tích lũy CPA của bạn đang là **${cpa4.toFixed(2)}/4.00**, tích lũy **${passedCredits}/${profile.totalRequiredCredits} tín chỉ**${
      debtCredits > 0 ? ` và đang còn **${debtCredits} tín chỉ nợ**` : ""
    }. 

Tôi có thể giúp bạn giải đáp quy chế học vụ, tính toán điểm thi, tư vấn đăng ký môn học hoặc phân tích phương án thoát cảnh báo học vụ. Bạn đang băn khoăn điều gì nhất?`,
    timestamp: "Vừa xong",
    citations: ["Thông tư 17/2021/TT-BGDĐT Quy chế đào tạo đại học", "Sổ tay sinh viên"],
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    "Làm sao để thoát cảnh báo học vụ nhanh nhất?",
    "Em nên học lại môn nào trước để tăng CPA?",
    "Quy chế bảo lưu điểm hoặc hoãn thi ra sao?",
    "Cách tính điểm thi cuối kỳ để đạt loại B?",
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Vừa xong",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "";
      let citations = ["Quy chế đào tạo theo hệ thống tín chỉ"];

      const lower = text.toLowerCase();
      if (lower.includes("thoát cảnh báo") || lower.includes("cảnh báo học vụ")) {
        aiResponseText = `Để thoát cảnh báo học vụ, bạn cần đạt hai mục tiêu:
1. **Nâng GPA học kỳ kế tiếp lên $\\ge 1.50$ (hoặc $\\ge 2.00$ tùy trường):** Tập trung cao độ vào các môn đang học, tránh để phát sinh thêm điểm F mới.
2. **Học trả nợ ngay các môn điểm F:** Điểm F kéo lùi CPA rất nặng vì hệ số 0.0. Khi học lại đạt B (3.0) hoặc C (2.0), điểm mới sẽ thay thế điểm cũ, giúp CPA nhảy vọt ngay lập tức!
3. **Giảm tải số tín chỉ:** Kỳ này bạn chỉ nên đăng ký tối đa 14-15 tín chỉ để không bị quá tải.`;
        citations = ["Điều 11, Quy chế 17/2021/TT-BGDĐT", "Quy định cảnh báo học vụ nhà trường"];
      } else if (lower.includes("học lại") || lower.includes("tăng cpa") || lower.includes("môn nào")) {
        aiResponseText = `Theo thuật toán tối ưu ROI học tập:
- Bạn nên ưu tiên học lại các môn **3 hoặc 4 tín chỉ đang bị điểm F** (ví dụ môn Giải tích). 
- Vì số tín chỉ lớn, chỉ cần cải thiện từ F (0.0) lên B (3.0), CPA của bạn có thể tăng trực tiếp thêm **+0.2 đến +0.35 điểm** trên toàn khóa!
- Các môn điểm D (1.0) nên cải thiện sau khi đã thanh toán hết các môn điểm F.`;
        citations = ["Thuật toán tối ưu hóa CPA StudyFlow AI"];
      } else if (lower.includes("bảo lưu") || lower.includes("hoãn thi")) {
        aiResponseText = `Về thủ tục **Bảo lưu kết quả học tập & Nghỉ học tạm thời**:
- **Điều kiện:** Đã học ít nhất 1 học kỳ và không thuộc diện bị buộc thôi học.
- **Lý do hợp lệ:** Được điều động nghĩa vụ quân sự, lý do sức khỏe có xác nhận của cơ sở y tế có thẩm quyền, hoặc hoàn cảnh gia đình đặc biệt.
- **Hồ sơ:** Đơn xin nghỉ học tạm thời (mẫu phòng Đào tạo/CTSV) + Giấy tờ minh chứng đính kèm. 
- *Lưu ý:* Cần nộp đơn trước khi học kỳ bắt đầu hoặc trước đợt thi kết thúc học phần.`;
        citations = ["Điều 15, Thông tư 17/2021/TT-BGDĐT"];
      } else if (lower.includes("tính điểm") || lower.includes("cuối kỳ")) {
        aiResponseText = `Bạn có thể dùng ngay thẻ **"Tính điểm"** trên thanh công cụ của app:
- Mở môn học cần tính, chọn mục tiêu điểm mong muốn (ví dụ điểm B hoặc A).
- Hệ thống sẽ tự động dùng công thức:
  $$Điểm\\_Cuối\\_Kỳ = \\frac{Ngưỡng\\_Điểm - (Chuyên\\_Cần \\times w_1 + Giữa\\_Kỳ \\times w_2)}{w_{cuối\\_kỳ}}$$
- Giúp bạn biết chính xác cần bao nhiêu điểm để vào phòng thi với tâm lý tự tin nhất!`;
      } else {
        aiResponseText = `Cảm ơn câu hỏi của bạn! Với tình hình học tập hiện tại, lời khuyên tốt nhất là:
1. Bạn hãy vào tab **"Lộ trình"** để xem chi tiết môn cần học lại và lịch trình Sprint 4 tuần.
2. Nếu cảm thấy áp lực bài vở quá lớn, hãy bấm nút **"Đặt lịch Cố vấn học tập (CVHT)"** ngay trên ứng dụng để được khoa hỗ trợ riêng nhé. Tôi luôn đồng hành cùng bạn!`;
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: "Vừa xong",
        citations,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[540px] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Trợ lý AI Cố vấn Học vụ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-500">Phân tích dữ liệu học tập cá nhân hóa</div>
          </div>
        </div>

        <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          Chủ đề 1 AI
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === "user"
                  ? "bg-slate-800 text-white"
                  : "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none space-y-2"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Căn cứ quy chế & nguồn tham chiếu:</span>
                  </div>
                  {m.citations.map((cite, cIdx) => (
                    <div
                      key={cIdx}
                      className="text-[10px] text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded-md inline-block mr-1"
                    >
                      § {cite}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-medium text-slate-500">AI đang phân tích dữ liệu...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-white/70 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
        {samplePrompts.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Nhập câu hỏi quy chế, điểm số..."
          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
