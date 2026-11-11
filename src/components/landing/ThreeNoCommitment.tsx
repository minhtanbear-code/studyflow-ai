import { ShieldCheck, EyeOff, Award, CheckCircle2 } from "lucide-react";

export function ThreeNoCommitment() {
  const commitments = [
    {
      icon: EyeOff,
      title: "Không chia sẻ dữ liệu chấm điểm",
      description: "Dữ liệu tự đánh giá, khó khăn và tâm trạng học tập của bạn hoàn toàn tách biệt với giảng viên giảng dạy và hệ thống chấm điểm học phần.",
      badge: "Bảo mật danh tính",
      color: "from-blue-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200",
      iconColor: "text-indigo-600 bg-indigo-100",
    },
    {
      icon: Award,
      title: "Không làm căn cứ kỷ luật hay học bổng",
      description: "STUDYFLOW AI tuyệt đối không dán nhãn 'rủi ro' hay 'yếu kém' để đánh giá con người bạn. Mọi ghi nhận chỉ phục vụ duy nhất mục đích hỗ trợ.",
      badge: "Không định kiến",
      color: "from-purple-500/10 to-violet-500/10 text-violet-700 border-violet-200",
      iconColor: "text-violet-600 bg-violet-100",
    },
    {
      icon: ShieldCheck,
      title: "Hoàn toàn tự nguyện & tự chủ",
      description: "Bạn có toàn quyền quyết định chia sẻ thông tin gì, ẩn danh khi gửi câu hỏi, và yêu cầu xóa dữ liệu của mình bất cứ lúc nào theo luật định.",
      badge: "Quyền tự chủ",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-600 bg-emerald-100",
    },
  ];

  return (
    <section id="cam-ket" className="py-16 md:py-24 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>An Toàn Tâm Lý • Psychological Safety by Design</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bản Cam Kết &quot;3 Không&quot; Của STUDYFLOW AI
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Chúng tôi hiểu việc thừa nhận khó khăn học tập cần rất nhiều sự dũng cảm. Nền tảng được xây dựng với các rào chắn kỹ thuật kiên cố để bảo vệ bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative p-7 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconColor} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.color}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
