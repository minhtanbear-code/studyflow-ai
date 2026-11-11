"use client";

import React, { useState } from "react";
import { Bot, Mic, MicOff, Send, Sparkles, Volume2, X } from "lucide-react";
import { CuBongMascot } from "./CuBongMascot";

interface CuBongChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardCoins: (amount: number) => void;
}

interface Message {
  id: string;
  sender: "user" | "cubong";
  text: string;
  pinyin?: string;
  translation?: string;
  correction?: string;
}

export function CuBongChatModal({ isOpen, onClose, onRewardCoins }: CuBongChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "cubong",
      text: "Hế nhô bạn Đô La! 🦉 Cú Bông rất vui được gặp bạn! Hôm nay chúng mình cùng luyện nói tiếng Anh hay tiếng Trung nhé?",
      translation: "Hello Do La! I'm Cu Bong! Shall we practice English or Chinese today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<"en" | "zh">("en");

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    // Simulate Cú Bông AI response
    setTimeout(() => {
      let reply: Message;
      const lower = text.toLowerCase();

      if (language === "en") {
        if (lower.includes("hello") || lower.includes("hi")) {
          reply = {
            id: `cb_${Date.now()}`,
            sender: "cubong",
            text: "Hello there! Your pronunciation is awesome! What did you do at school today?",
            translation: "Chào bạn! Phát âm của bạn rất tốt đấy! Hôm nay ở trường bạn đã làm gì thế?",
            correction: "💡 Điểm phát âm: 95/100 • Câu chuẩn xác!",
          };
        } else {
          reply = {
            id: `cb_${Date.now()}`,
            sender: "cubong",
            text: `Great sentence! Let's practice saying: "I love learning with Cu Bong everyday!"`,
            translation: "Câu nói rất hay! Hãy cùng Cú luyện câu: 'Tớ thích học cùng Cú Bông mỗi ngày!' nhé!",
            correction: "🎉 Bạn vừa nhận được +10 Xu chăm chỉ!",
          };
          onRewardCoins(10);
        }
      } else {
        reply = {
          id: `cb_${Date.now()}`,
          sender: "cubong",
          text: "你好！很高兴和你聊天！今天我们一起练习中文吧！",
          pinyin: "Nǐ hǎo! Hěn gāoxìng hé nǐ liáotiān! Jīntiān wǒmen yīqǐ liànxí zhōngwén ba!",
          translation: "Chào bạn! Rất vui được trò chuyện cùng bạn! Hôm nay chúng ta cùng luyện tiếng Trung nhé!",
          correction: "🎉 +10 Xu!",
        };
        onRewardCoins(10);
      }

      setMessages((prev) => [...prev, reply]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] shadow-2xl flex flex-col overflow-hidden border-4 border-blue-400">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white p-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center">
              <CuBongMascot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-sm">
                <span>Cú Bông Trợ Lý AI</span>
                <span className="text-[10px] bg-yellow-400 text-slate-900 font-bold px-2 py-0.2 rounded-full">
                  10p Free
                </span>
              </div>
              <div className="text-[11px] text-blue-100 flex items-center gap-2">
                <span>Nhập vai & Sửa lỗi câu</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-white/20 p-0.5 rounded-xl flex text-xs font-bold">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  language === "en" ? "bg-white text-blue-600 shadow-sm" : "text-white"
                }`}
              >
                🇬🇧 Tiếng Anh
              </button>
              <button
                onClick={() => setLanguage("zh")}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  language === "zh" ? "bg-white text-blue-600 shadow-sm" : "text-white"
                }`}
              >
                🇨🇳 Tiếng Trung
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/40 via-white to-sky-50/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {m.sender === "cubong" ? (
                <div className="w-8 h-8 shrink-0">
                  <CuBongMascot className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  ĐL
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none font-semibold"
                    : "bg-white text-slate-800 border-2 border-blue-100 rounded-tl-none space-y-1.5"
                }`}
              >
                <div className="font-bold text-[13px]">{m.text}</div>
                {m.pinyin && <div className="text-[11px] text-indigo-600 font-mono">{m.pinyin}</div>}
                {m.translation && (
                  <div className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-1">
                    👉 {m.translation}
                  </div>
                )}
                {m.correction && (
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    {m.correction}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar text-xs">
          {language === "en" ? (
            <>
              <button
                onClick={() => handleSend("Hello Cu Bong! Can you help me practice speaking English?")}
                className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium whitespace-nowrap transition-colors"
              >
                👋 "Hello Cu Bong! Practice English"
              </button>
              <button
                onClick={() => handleSend("How do I say 'chúc bạn ngày mới tốt lành' in English?")}
                className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium whitespace-nowrap transition-colors"
              >
                ❓ "Hỏi cách nói một câu"
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSend("你好！我想学中文。")}
                className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium whitespace-nowrap transition-colors"
              >
                🇨🇳 "你好！我想学中文。"
              </button>
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Ghi âm giọng nói"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              language === "en"
                ? "Gõ câu tiếng Anh hoặc hỏi Cú..."
                : "Gõ chữ Hán hoặc Pinyin để luyện cùng Cú..."
            }
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
