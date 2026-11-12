"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Search, Compass, BookOpen, Users, HeartHandshake, ShieldCheck, MapPin, Mail, Clock, ExternalLink, Lightbulb } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { supportResourcesData, campusSlangsData, CampusSlang, SupportResource } from "@/core/services/navigator.service";

export default function NavigatorPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Kiểm tra xem từ khóa tìm kiếm có khớp với tiếng lóng nào không
  const matchedSlang: CampusSlang | undefined = campusSlangsData.find((item) =>
    searchQuery.trim().toLowerCase().includes(item.slang.toLowerCase()) ||
    item.slang.toLowerCase().includes(searchQuery.trim().toLowerCase()) && searchQuery.trim().length >= 2
  );

  // Lọc tài nguyên
  const filteredResources = supportResourcesData.filter((res) => {
    // Lọc theo danh mục
    if (selectedCategory !== "all" && res.category !== selectedCategory) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const matchTitle = res.title.toLowerCase().includes(query);
    const matchDesc = res.description.toLowerCase().includes(query);
    const matchSlang = res.relatedSlangs.some((s) => s.toLowerCase().includes(query) || query.includes(s.toLowerCase()));

    return matchTitle || matchDesc || matchSlang;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang chủ</span>
            </Link>

            <Link
              href="/assistant"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hỏi Trợ lý AI Trích Dẫn Quy Chế</span>
            </Link>
          </div>

          {/* Tiêu đề Cổng Navigator */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Support Navigator • Cẩm Nang Học Đường</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Điều Hướng Nguồn Lực & Kênh Hỗ Trợ
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Tìm kiếm quy chế, phòng ban chức năng hoặc nhóm hỗ trợ học tập bằng ngôn ngữ gần gũi nhất của bạn.
            </p>

            {/* Ô TÌM KIẾM THÔNG MINH */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Thử gõ: 'rớt môn', 'nợ tín', 'treo bằng', 'cảnh báo học vụ'..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm transition-all"
                />
              </div>

              {/* Gợi ý từ khóa nhanh */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
                <span>Gợi ý tiếng lóng:</span>
                {["rớt môn", "nợ môn", "treo bằng", "cảnh báo học vụ", "bảo lưu"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BANNER ÁNH XẠ TIẾNG LÓNG NẾU KHỚP */}
          {matchedSlang && (
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Ánh xạ văn hóa học đường
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Căn cứ: <code className="font-mono text-indigo-700">{matchedSlang.targetDocCode}</code>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Tiếng lóng &quot;<span className="text-amber-700">{matchedSlang.slang}</span>&quot; là:{" "}
                    <span className="text-indigo-900 underline decoration-indigo-300">{matchedSlang.formalTerm}</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {matchedSlang.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BỘ LỌC DANH MỤC */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 text-xs font-semibold">
            {[
              { id: "all", label: "Tất cả nguồn lực" },
              { id: "academic_rules", label: "Quy chế học vụ" },
              { id: "peer_support", label: "Sinh viên & CLB hỗ trợ" },
              { id: "advisor", label: "Cố vấn khoa (1-1)" },
              { id: "wellbeing", label: "Tâm lý học đường" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* DANH SÁCH THẺ TÀI NGUYÊN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {res.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {res.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {res.description}
                  </p>

                  {/* Thông tin liên hệ */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{res.contactInfo.office}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{res.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{res.contactInfo.hours}</span>
                    </div>
                  </div>
                </div>

                {/* Footer thẻ */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {res.docRef || "Hỗ trợ cộng đồng"}
                  </span>

                  {res.actionUrl ? (
                    <Link
                      href={res.actionUrl}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>{res.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert(`Đã kích hoạt liên kết: ${res.actionText}`)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>{res.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Không tìm thấy kênh hỗ trợ nào phù hợp với từ khóa &quot;{searchQuery}&quot;. Hãy thử từ khóa khác!
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
