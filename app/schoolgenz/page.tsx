import { SchoolGenZDashboard } from "@/components/schoolgenz/SchoolGenZDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Gen Z - Nền Tảng Học Tập Số & Cú Bông AI",
  description: "Giao diện School Gen Z: Sân trường, Lớp học chung, Học cùng Cú Bông AI, Đấu trường PK và Quản lý kết quả học tập.",
};

export default function SchoolGenZPage() {
  return <SchoolGenZDashboard />;
}
