import Link from "next/link";
import { Sparkles, Shield, HeartHandshake, Compass, ArrowRight, Smartphone } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-baseline">
            <span className="text-lg font-bold tracking-tight text-slate-900">STUDYFLOW</span>
            <span className="text-lg font-light text-indigo-600 ml-1">AI</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <Link href="/mobile" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            <span>App Dự Báo & Lộ Trình</span>
          </Link>
          <a href="/#tru-cot" className="hover:text-indigo-600 transition-colors">
            4 Trụ cột Cảnh báo sớm
          </a>
          <Link href="/survey" className="hover:text-indigo-600 transition-colors flex items-center space-x-1">
            <span>Khảo sát nhu cầu</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold border border-indigo-100">Mới</span>
          </Link>
          <Link href="/navigator" className="hover:text-indigo-600 transition-colors">
            Cẩm nang Hỗ trợ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            href="/mobile"
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mở App Điện Thoại</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
