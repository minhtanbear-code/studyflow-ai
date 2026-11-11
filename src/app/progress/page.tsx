"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Calendar, Target, Award, ShieldAlert, Filter } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

interface GoalItem {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  category: string;
}

export default function ProgressPage() {
  const [goals, setGoals] = useState<GoalItem[]>([
    {
      id: "1",
      title: "Ôn tập 3 dạng bài tập Chương 2 môn Giải tích",
      deadline: "Hôm nay, 18:00",
      priority: "high",
      completed: true,
      category: "Toán cao cấp",
    },
    {
      id: "2",
      title: "Viết hàm xác thực đăng nhập cho Đồ án Web",
      deadline: "Ngày mai, 22:00",
      priority: "high",
      completed: false,
      category: "Đồ án chuyên ngành",
    },
    {
      id: "3",
      title: "Đọc trước Slide bài giảng buổi tới",
      deadline: "Chủ nhật",
      priority: "medium",
      completed: false,
      category: "Tự học",
    },
  ]);

  const [newTitle, setNewTitle] = useState<string>("");
  const [newDeadline, setNewDeadline] = useState<string>("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [filterType, setFilterType] = useState<"all" | "active" | "completed">("all");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: GoalItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      deadline: newDeadline.trim() || "Trong tuần",
      priority: newPriority,
      completed: false,
      category: "Mục tiêu cá nhân",
    };

    setGoals([newGoal, ...goals]);
    setNewTitle("");
    setNewDeadline("");
  };

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const filteredGoals = goals.filter((g) => {
    if (filterType === "active") return !g.completed;
    if (filterType === "completed") return g.completed;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
              href="/checkin"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <span>Qua Trạm Check-in 45s</span>
            </Link>
          </div>

          {/* Tiêu đề & Disclaimer Quản trị */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
              <Target className="w-3.5 h-3.5" />
              <span>Theo Dõi Tiến Trình Tự Quản • Self-Paced Progress</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bảng Mục Tiêu & Kế Hoạch Học Tập
            </h1>

            {/* Disclaimer minh bạch */}
            <div className="mt-3 p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý minh bạch:</strong> Đây là không gian riêng để bạn tự quản lý và giữ nhịp học tập. Dữ liệu này là tự khai báo (<code className="text-slate-800 font-mono">self_reported</code>), hoàn toàn không phải điểm số chính thức từ phòng đào tạo.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI (2/3): THÊM & DANH SÁCH MỤC TIÊU */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form thêm mục tiêu mới */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Thêm Mục Tiêu / Nhiệm Vụ Mới</span>
                </h3>

                <form onSubmit={handleAddGoal} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ví dụ: Làm bài tập 1 đến 5 môn Lập trình Web..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        placeholder="Hạn chót: Tối nay 21h, Thứ Sáu..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                      >
                        <option value="high">Ưu tiên: Cao (Quan trọng)</option>
                        <option value="medium">Ưu tiên: Vừa (Bình thường)</option>
                        <option value="low">Ưu tiên: Thấp (Lúc rảnh)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-98 flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu Mục Tiêu</span>
                  </button>
                </form>
              </div>

              {/* Danh sách mục tiêu & Bộ lọc */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">Danh Sách Nhiệm Vụ</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {filteredGoals.length}
                    </span>
                  </div>

                  {/* Bộ lọc */}
                  <div className="flex items-center space-x-1 text-xs">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterType === "all" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFilterType("active")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterType === "active" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Đang làm
                    </button>
                    <button
                      onClick={() => setFilterType("completed")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterType === "completed" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      Đã xong
                    </button>
                  </div>
                </div>

                {filteredGoals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không có nhiệm vụ nào trong mục này. Hãy thêm mục tiêu mới phía trên!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                          goal.completed
                            ? "bg-slate-50/70 border-slate-200/80 opacity-60"
                            : "bg-white border-slate-200/90 hover:border-indigo-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0 mr-2">
                          <button
                            type="button"
                            onClick={() => toggleGoal(goal.id)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                          >
                            {goal.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs sm:text-sm font-medium leading-snug truncate ${
                                goal.completed ? "line-through text-slate-400" : "text-slate-800"
                              }`}
                            >
                              {goal.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{goal.deadline}</span>
                              </span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  goal.priority === "high"
                                    ? "text-rose-500"
                                    : goal.priority === "medium"
                                    ? "text-amber-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {goal.priority === "high" ? "Ưu tiên cao" : goal.priority === "medium" ? "Bình thường" : "Lúc rảnh"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                          title="Xóa mục tiêu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI (1/3): TIẾN ĐỘ & MẸO CALM TECH */}
            <div className="space-y-6">
              {/* Thẻ tỷ lệ hoàn thành */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Nhịp Độ Tuần Này</h3>
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>

                {/* Vòng / Thanh tiến độ */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">{progressPercent}%</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {completedGoals}/{totalGoals} hoàn thành
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {progressPercent === 100
                    ? "🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ mục tiêu đề ra."
                    : progressPercent >= 50
                    ? "👏 Tuyệt vời! Bạn đang duy trì phong độ rất ổn định."
                    : "🌱 Cứ bình tĩnh làm từng việc một, không cần vội vã."}
                </p>
              </div>

              {/* Thẻ Mẹo Nhỏ Chia Nhỏ Việc */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 p-6 rounded-2xl border border-indigo-100 space-y-3">
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mẹo Học Tập Không Áp Lực</span>
                </span>
                <h4 className="text-sm font-bold text-slate-900">Quy tắc &quot;Miếng bánh 15 phút&quot;</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thay vì đặt mục tiêu lớn như &quot;Học hết môn Giải tích&quot;, hãy chia thành &quot;Làm 2 bài tập ví dụ trang 45&quot;. Não bộ rất thích những chiến thắng nhỏ dễ đạt được!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
