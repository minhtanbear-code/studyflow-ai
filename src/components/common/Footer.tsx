import Link from "next/link";
import { Sparkles, ShieldCheck, FileText, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Cột 1: Thông tin dự án */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">STUDYFLOW AI</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed">
              Nền tảng số lấy sinh viên làm trung tâm hỗ trợ nhận diện khó khăn học tập, tiếp cận đúng nguồn hỗ trợ và theo dõi quá trình hỗ trợ với nguyên tắc <strong>Service-first, Evidence-driven, Rights-aware</strong>.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs bg-slate-800/80 text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tuân thủ Luật Bảo vệ dữ liệu cá nhân & Luật Trí tuệ nhân tạo</span>
            </div>
          </div>

          {/* Cột 2: Cổng chức năng */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Phân hệ Sản phẩm</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/checkin" className="hover:text-indigo-400 transition-colors">Micro Check-in 45s</Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-indigo-400 transition-colors">Theo dõi tiến độ cá nhân</Link>
              </li>
              <li>
                <Link href="/navigator" className="hover:text-indigo-400 transition-colors">Cẩm nang Support Navigator</Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-indigo-400 transition-colors">Trợ lý AI tra cứu quy chế</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-indigo-400 transition-colors">Phiếu yêu cầu ẩn danh</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Quản trị & Bản quyền */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Minh bạch & Bản quyền</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/transparency" className="hover:text-indigo-400 transition-colors">Bản Cam kết 3 Không</Link>
              </li>
              <li>
                <Link href="/transparency#privacy" className="hover:text-indigo-400 transition-colors">Chính sách xử lý dữ liệu</Link>
              </li>
              <li>
                <Link href="/transparency#sbom" className="hover:text-indigo-400 transition-colors">Danh mục giấy phép SBOM</Link>
              </li>
              <li>
                <Link href="/transparency#credits" className="hover:text-indigo-400 transition-colors">Tác giả & Nguồn tri thức</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh cuối */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 STUDYFLOW AI Research Team. Nghiên cứu và phát triển vì cộng đồng người học.</p>
          <p className="mt-2 md:mt-0 flex items-center space-x-1">
            <span>Thiết kế theo triết lý Calm Technology</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" />
            <span>cho sinh viên Việt Nam</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
