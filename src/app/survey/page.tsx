"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export default function SurveyPage() {
  // Trạng thái form
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [timing, setTiming] = useState<string>("");
  const [barriers, setBarriers] = useState<string[]>([]);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(4);
  const [feedback, setFeedback] = useState<string>("");

  // Trạng thái Consent Modal & Thành công
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const difficultyOptions = [
    "Quá tải đồ án & bài tập lớn",
    "Khó khăn về phương pháp tự học đại học",
    "Áp lực phân bổ thời gian & việc làm thêm",
    "Chưa hiểu rõ quy chế học vụ & đăng ký tín chỉ",
    "Mất động lực học tập hoặc căng thẳng tâm lý",
  ];

  const timingOptions = [
    "Ngay từ đầu kỳ khi nhận đề cương môn học",
    "Giữa kỳ khi làm bài kiểm tra hoặc bài tập lớn",
    "Khoảng 2-3 tuần trước kỳ thi kết thúc học phần",
    "Chỉ khi nhận điểm kém hoặc bị cảnh báo học vụ",
  ];

  const barrierOptions = [
    "E ngại bị thầy cô/bạn bè đánh giá là yếu kém",
    "Không biết cố vấn học tập là ai hoặc liên hệ ở đâu",
    "Thủ tục hành chính và hẹn gặp quá rườm rà",
    "Cảm thấy cố vấn quá bận rộn để giải quyết việc nhỏ",
    "Thích tự tìm cách giải quyết hoặc hỏi bạn bè hơn",
  ];

  const toggleDifficulty = (item: string) => {
    setDifficulties((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleBarrier = (item: string) => {
    setBarriers((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (difficulties.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất 1 khó khăn bạn thường gặp.");
      return;
    }
    if (!timing) {
      setErrorMsg("Vui lòng chọn thời điểm bạn thường nhận ra mình cần hỗ trợ.");
      return;
    }
    if (barriers.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất 1 rào cản bạn gặp phải.");
      return;
    }

    setErrorMsg("");
    // Mở popup Consent để xác nhận
    setShowConsentModal(true);
  };

  const handleFinalSubmit = () => {
    if (!consentAgreed) {
      return;
    }
    setShowConsentModal(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Nút quay lại */}
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang chủ</span>
          </Link>

          {!submitted ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
              {/* Header khảo sát */}
              <div className="border-b border-slate-100 pb-6 mb-8">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Nghiên cứu Độc lập • Hoàn toàn Ẩn danh</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Khảo Sát Khó Khăn Học Tập & Nhu Cầu Hỗ Trợ
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Ý kiến của bạn là cơ sở khoa học để chúng tôi xây dựng nền tảng <strong>STUDYFLOW AI</strong> phục vụ cộng đồng sinh viên tốt hơn. Khảo sát chỉ mất khoảng 2 phút.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitAttempt} className="space-y-8">
                {/* Câu hỏi 1 */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    1. Trong quá trình học đại học, bạn thường gặp phải những trở ngại nào? (Chọn các phương án phù hợp)
                  </label>
                  <div className="space-y-2 mt-3">
                    {difficultyOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleDifficulty(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                          difficulties.includes(opt)
                            ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm"
                            : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                        }`}
                      >
                        <span>{opt}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            difficulties.includes(opt)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {difficulties.includes(opt) ? "✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Câu hỏi 2 */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    2. Bạn thường nhận ra mình thực sự cần sự trợ giúp vào thời điểm nào?
                  </label>
                  <div className="space-y-2 mt-3">
                    {timingOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setTiming(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                          timing === opt
                            ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm"
                            : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                        }`}
                      >
                        <span>{opt}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            timing === opt
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {timing === opt ? "✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Câu hỏi 3 */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    3. Điều gì khiến bạn ngần ngại hoặc khó tiếp cận cố vấn học tập / nhà trường?
                  </label>
                  <div className="space-y-2 mt-3">
                    {barrierOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleBarrier(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                          barriers.includes(opt)
                            ? "bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm"
                            : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                        }`}
                      >
                        <span>{opt}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            barriers.includes(opt)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {barriers.includes(opt) ? "✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Câu hỏi 4 */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    4. Mức độ mong muốn có một nền tảng số hỗ trợ tra cứu quy chế và kết nối trợ giúp ẩn danh?
                  </label>
                  <div className="flex items-center justify-between mt-4 px-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setSatisfactionScore(num)}
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm transition-all ${
                          satisfactionScore === num
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 px-2 mt-2">
                    <span>1: Rất ít cần</span>
                    <span>3: Bình thường</span>
                    <span>5: Cực kỳ cần thiết</span>
                  </div>
                </div>

                {/* Câu hỏi 5 */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    5. Bạn có đề xuất hoặc mong muốn tính năng nào khác cho STUDYFLOW AI? (Tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Chia sẻ thêm suy nghĩ hoặc khó khăn cụ thể của bạn..."
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  ></textarea>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center space-x-2"
                  >
                    <span>Gửi Ý Kiến Khảo Sát</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Màn hình thành công */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cảm Ơn Bạn Đã Đóng Góp!
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Phản hồi ẩn danh của bạn đã được ghi nhận an toàn vào cơ sở dữ liệu nghiên cứu. Ý kiến của bạn sẽ trực tiếp định hình các tính năng hỗ trợ của <strong>STUDYFLOW AI</strong>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/checkin"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:bg-indigo-700 transition-all"
                >
                  <span>Trải nghiệm thử Check-in 45s</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all"
                >
                  <span>Quay về Trang chủ</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* POPUP CONSENT (ĐỒNG THUẬN DỮ LIỆU) */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Xác Nhận Đồng Thuận Tự Nguyện
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Theo quy định của <strong>Luật Bảo vệ dữ liệu cá nhân</strong>, chúng tôi cam kết:
            </p>

            <ul className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Dữ liệu được thu thập hoàn toàn ẩn danh, không lưu IP hoặc thông tin định danh cá nhân.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Chỉ sử dụng cho mục đích phân tích nhu cầu và cải thiện sản phẩm STUDYFLOW AI.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Tuyệt đối không chia sẻ cho bên thứ ba hoặc sử dụng vào mục đích thương mại.</span>
              </li>
            </ul>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 mb-6">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Tôi đồng ý tham gia khảo sát tự nguyện này.
              </span>
            </label>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!consentAgreed}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  consentAgreed
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Xác nhận & Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
