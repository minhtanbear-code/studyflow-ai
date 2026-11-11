import { Sparkles, Compass, BookOpenCheck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PillarsSection() {
  const pillars = [
    {
      icon: Sparkles,
      title: "1. Tự Đánh Giá 45 Giây (Micro Check-in)",
      desc: "Chỉ 1 thanh trượt năng lượng và chọn nhanh môn học bế tắc. Nhận ngay 1 hành động vi mô (Micro-Action) giúp giải tỏa áp lực tức thì.",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/checkin",
      actionText: "Thử Check-in",
    },
    {
      icon: Compass,
      title: "2. Cẩm Nang Hỗ Trợ & Từ Điển Tiếng Lóng",
      desc: "Tìm kiếm mọi kênh hỗ trợ bằng từ ngữ gần gũi. Tự động ánh xạ 'rớt môn', 'nợ tín' sang quy chế đào tạo chính xác.",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/navigator",
      actionText: "Khám phá cẩm nang",
    },
    {
      icon: BookOpenCheck,
      title: "3. Trợ Lý AI Có Trích Dẫn Minh Bạch",
      desc: "Giải đáp mọi thắc mắc học vụ bằng AI. Mỗi câu trả lời đều đi kèm nhãn trích dẫn; click trượt ngăn kéo xem toàn văn bản gốc.",
      color: "text-violet-600 bg-violet-50 border-violet-200",
      link: "/assistant",
      actionText: "Hỏi đáp AI",
    },
    {
      icon: ShieldCheck,
      title: "4. Tam Giác Hỗ Trợ Ẩn Danh",
      desc: "Gửi câu hỏi hỗ trợ với mã số ẩn danh (Blind Token). Cố vấn và sinh viên trợ giảng phản hồi nhanh qua các mẫu hướng dẫn chuẩn.",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/help",
      actionText: "Gửi câu hỏi ẩn danh",
    },
  ];

  return (
    <section id="tru-cot" className="py-16 md:py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            Hệ sinh thái Hỗ trợ Sinh viên
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Bốn Trụ Cột Đồng Hành Cùng Bạn
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Thiết kế theo triết lý Service-first, tập trung vào việc giải quyết khó khăn thực tế của sinh viên thay vì giám sát học vụ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors pt-3 border-t border-slate-100"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
