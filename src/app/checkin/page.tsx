"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, Clock, Heart, ShieldCheck, CheckCircle2, RotateCcw, Play, Pause } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { getRecommendedMicroAction, MicroActionItem } from "@/core/services/microaction.service";

export default function CheckinPage() {
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [shortNote, setShortNote] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recommendedAction, setRecommendedAction] = useState<MicroActionItem | null>(null);

  // Bộ đếm tương tác cho bài tập thở 4-7-8
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<"Hít vào (4s)" | "Giữ hơi (7s)" | "Thở ra (8s)">("Hít vào (4s)");
  const [breathCount, setBreathCount] = useState<number>(4);

  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Vòng lặp đếm thở 4-7-8
  useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev > 1) return prev - 1;
        // Đổi pha
        if (breathPhase === "Hít vào (4s)") {
          setBreathPhase("Giữ hơi (7s)");
          return 7;
        } else if (breathPhase === "Giữ hơi (7s)") {
          setBreathPhase("Thở ra (8s)");
          return 8;
        } else {
          setBreathPhase("Hít vào (4s)");
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  const energyDescriptions = [
    { level: 1, emoji: "🌧️", title: "Rất đuối sức", subtitle: "Cảm thấy kiệt quệ, khó tập trung và cần được nghỉ ngơi", color: "from-blue-500/20 to-slate-200 border-blue-300 text-blue-900" },
    { level: 2, emoji: "🍂", title: "Khá áp lực", subtitle: "Deadline dồn dập, bài vở đang vượt quá tầm kiểm soát", color: "from-amber-500/20 to-orange-100 border-amber-300 text-amber-900" },
    { level: 3, emoji: "⚖️", title: "Vừa sức • Ổn định", subtitle: "Tiến độ học tập đang diễn ra bình thường, kiểm soát được", color: "from-slate-100 to-indigo-50 border-slate-300 text-slate-800" },
    { level: 4, emoji: "🌤️", title: "Khá tốt", subtitle: "Đang có động lực học tập tốt, các môn học tiến triển thuận lợi", color: "from-violet-500/20 to-purple-100 border-violet-300 text-violet-900" },
    { level: 5, emoji: "⚡", title: "Tràn đầy năng lượng", subtitle: "Tập trung cao độ, sẵn sàng chinh phục mọi đồ án và mục tiêu", color: "from-emerald-500/20 to-teal-100 border-emerald-300 text-emerald-900" },
  ];

  const currentEnergy = energyDescriptions[energyLevel - 1];

  const commonTopics = [
    "Đồ án / Bài tập lập trình",
    "Toán cao cấp / Xác suất",
    "Thuyết trình & Làm việc nhóm",
    "Quy chế tín chỉ & Học phần",
    "Mất ngủ & Quản lý thời gian",
    "Chưa tìm được cách tự học",
  ];

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleCompleteCheckin = () => {
    const action = getRecommendedMicroAction(energyLevel, selectedTopics);
    setRecommendedAction(action);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setElapsedSeconds(0);
    setEnergyLevel(3);
    setSelectedTopics([]);
    setShortNote("");
    setRecommendedAction(null);
    setBreathingActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header & Back */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang chủ</span>
            </Link>

            <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thời gian: {elapsedSeconds}s</span>
            </div>
          </div>

          {!isCompleted ? (
            /* BƯỚC CHECK-IN FORM */
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
                  <Heart className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trạm Dừng Tiếp Sức • Lắng nghe bản thân</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Hôm nay năng lượng học tập của bạn thế nào?
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  Đây là không gian riêng của bạn. Không dán nhãn, không phán xét, không gửi cho giảng viên chấm điểm.
                </p>
              </div>

              {/* THANH TRƯỢT NĂNG LƯỢNG */}
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border transition-all bg-gradient-to-r ${currentEnergy.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{currentEnergy.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-md shadow-xs">
                      Mức {energyLevel} / 5
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-3">{currentEnergy.title}</h3>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">{currentEnergy.subtitle}</p>
                </div>

                <div className="pt-2 px-1">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
                    <span>1: Cần nghỉ ngơi</span>
                    <span>3: Ổn định</span>
                    <span>5: Cực kỳ sung sức</span>
                  </div>
                </div>
              </div>

              {/* CHỌN NHANH ĐIỂM NGHẼN */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <label className="block text-sm font-bold text-slate-900">
                  Điều gì đang làm bạn bận tâm nhất lúc này? (Chọn 1 hoặc 2)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {commonTopics.map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        selectedTopics.includes(topic)
                          ? "bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold"
                          : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{topic}</span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          selectedTopics.includes(topic)
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedTopics.includes(topic) ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GHI CHÚ VI MÔ */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ghi chú 1 dòng cho bản thân hôm nay (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={shortNote}
                  onChange={(e) => setShortNote(e.target.value)}
                  placeholder="Ví dụ: Cần hoàn thành nốt slide bài giảng trước 5h chiều..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Nút Hoàn Tất */}
              <button
                type="button"
                onClick={handleCompleteCheckin}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Nhận Giải Pháp Hành Động Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* MÀN HÌNH INSTANT MICRO-ACTION CARD (KẾT QUẢ BƯỚC 5) */
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Check-in hoàn tất trong {elapsedSeconds}s</h4>
                    <p className="text-[11px] text-slate-500">Trạng thái: {currentEnergy.emoji} {currentEnergy.title}</p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-indigo-600 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Check-in lại</span>
                </button>
              </div>

              {/* KHỐI HÀNH ĐỘNG VI MÔ CÁ NHÂN HÓA */}
              {recommendedAction && (
                <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-6 sm:p-8 rounded-2xl border border-indigo-100 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{recommendedAction.badge}</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 flex items-center space-x-2">
                        <span>{recommendedAction.icon}</span>
                        <span>{recommendedAction.title}</span>
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                    {recommendedAction.headline}
                  </p>

                  {/* Checklist hướng dẫn */}
                  <div className="space-y-2.5 bg-white/90 p-4 sm:p-5 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                    {recommendedAction.instruction.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          •
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* CÔNG CỤ TƯƠNG TÁC NẾU LÀ BÀI TẬP THỞ */}
                  {recommendedAction.actionType === "breathe" && (
                    <div className="p-6 rounded-2xl bg-indigo-900 text-white text-center space-y-4 shadow-inner">
                      <div className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
                        Công Cụ Thư Giãn Tức Thì
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-indigo-300">
                        {breathPhase}
                      </div>
                      <div className="text-5xl sm:text-6xl font-extrabold text-white animate-pulse">
                        {breathCount}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setBreathingActive(!breathingActive)}
                          className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{breathingActive ? "Tạm dừng" : "Bắt đầu chu kỳ thở"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nút hành động */}
                  {recommendedAction.actionType === "link" && recommendedAction.targetUrl && (
                    <div className="pt-2">
                      <Link
                        href={recommendedAction.targetUrl}
                        className="inline-flex items-center justify-center space-x-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all"
                      >
                        <span>{recommendedAction.actionBtnText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Điều hướng tiếp */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span>Hành động tiếp theo của bạn:</span>
                <div className="flex items-center space-x-3">
                  <Link href="/" className="hover:text-indigo-600 font-medium">
                    Về Trang chủ
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
