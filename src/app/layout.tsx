import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STUDYFLOW AI — Nền tảng Hỗ trợ & Đồng hành Sinh viên",
  description: "Rights-aware Student Early Support Platform — Nhận diện khó khăn học tập, kết nối nguồn lực hỗ trợ và quản trị dữ liệu có trách nhiệm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
