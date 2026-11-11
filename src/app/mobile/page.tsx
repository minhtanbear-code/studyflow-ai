import { MobileAppContainer } from "@/components/mobile/MobileAppContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STUDYFLOW AI - Ứng dụng Dự báo Học tập & Lộ trình Cải thiện",
  description: "Ứng dụng di động dự báo kết quả học tập, cảnh báo sớm học vụ, tính điểm linh hoạt và xây dựng lộ trình cải thiện cá nhân hóa cho sinh viên.",
};

export default function MobilePage() {
  return <MobileAppContainer />;
}
