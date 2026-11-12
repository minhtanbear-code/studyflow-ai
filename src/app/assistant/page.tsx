"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Send, Bot, User, FileText, ShieldCheck, ChevronRight, CornerDownLeft } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CitationDrawer } from "@/components/common/CitationDrawer";
import { getAIAnswerForQuery, AssistantMessage, CitationDetail, mockCitations } from "@/core/services/assistant.service";

export default function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Chào bạn! Tôi là Trợ lý Học vụ STUDYFLOW AI. Tôi có thể giúp bạn giải đáp quy chế đào tạo, thủ tục thi lại, học cải thiện, cảnh báo học vụ và điều kiện tốt nghiệp. Mọi câu trả lời của tôi đều có trích dẫn văn bản mộc đỏ chính thức để bạn đối chiếu.",
      timestamp: "Vừa xong",
      citations: [mockCitations["qd-124-d18"]],
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [activeCitation, setActiveCitation] = useState<CitationDetail | null>(null);

  const samplePrompts = [
    "Em bị cảnh báo học vụ thì có bị thôi học ngay không?",
    "Môn học bị điểm F thì tính điểm tích lũy thế nào?",
    "Điều kiện để được xét tốt nghiệp ra trường là gì?",
    "Em muốn bảo lưu kết quả học tập thì làm thủ tục ra sao?",
  ];

  const handleSendMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: queryText.trim(),
      timestamp: "Vừa xong",
    };

    const aiResponse = getAIAnswerForQuery(queryText);

    const aiMsg: AssistantMessage = {
      id: (Date.now() + 1).toString(),
      sender: "assistant",
      text: aiResponse.text,
      timestamp: "Vừa xong",
      citations: aiResponse.citations,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputQuery);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 md:py-12 flex flex-col">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex-1 flex flex-col">
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang chủ</span>
            </Link>

            <div className="inline-flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RAG Guardrails Active • Dẫn nguồn mộc đỏ</span>
            </div>
          </div>

          {/* Tiêu đề & Thông điệp */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Trợ Lý AI Quy Chế & Thủ Tục Học Vụ</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Mọi câu trả lời đều được đối chiếu từ kho quy chế chính thức. Bạn có thể bấm vào nhãn trích dẫn để trượt ngăn kéo xem toàn văn bản gốc.
            </p>
          </div>

          {/* KHUNG TRÒ CHUYỆN (CHAT CONTAINER) */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            {/* Vùng tin nhắn */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.sender === "user"
                        ? "bg-slate-800 text-white"
                        : "bg-indigo-600 text-white shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                          : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* CITATION PILLS NẾU LÀ TIN NHẮN TỪ AI */}
                    {msg.sender === "assistant" && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Căn cứ trích dẫn:
                        </span>
                        {msg.citations.map((cite, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveCitation(cite)}
                            className="inline-flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all active:scale-95 group shadow-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{cite.docCode} • {cite.article}</span>
                            <ChevronRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Gợi ý câu hỏi nhanh (Prompt Starters) */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-semibold shrink-0 pl-2">Gợi ý nhanh:</span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Khung nhập liệu */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white flex items-center space-x-3">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Nhập thắc mắc học vụ của bạn (ví dụ: 'cảnh báo học vụ', 'học lại điểm F')..."
                className="flex-1 text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className={`p-3.5 rounded-2xl transition-all ${
                  inputQuery.trim()
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* SLIDE-OVER CITATION DRAWER KHI BẤM VÀO PILL */}
      <CitationDrawer
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      <Footer />
    </div>
  );
}
