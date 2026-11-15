# STUDYFLOW AI 🎓⚡
> **Nền tảng Ôn thi Đại học & Học phần Thông minh ứng dụng AI — Vận hành 100% Miễn phí (Zero-Cost Architecture)**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://vercel.com/)

---

## 🌐 Đường dẫn Trực tuyến (Live Production)
- **Trang chủ Website**: [https://studyflow-ai-git-main-tan-dcc2.vercel.app](https://studyflow-ai-git-main-tan-dcc2.vercel.app)
- **Sảnh Voice Học 1v1 & Nhập mã phòng**: [https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk](https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk)
- **Ví dụ Link mời vào phòng trực tiếp**: [https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk?room=VH-1024](https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk?room=VH-1024)
- **Mã nguồn GitHub**: [https://github.com/minhtanbear-code/studyflow-ai](https://github.com/minhtanbear-code/studyflow-ai)

---

## 📖 Giới thiệu Dự án

**STUDYFLOW AI** là nền tảng luyện thi trắc nghiệm và ôn tập đại học thông minh, hướng tới đối tượng sinh viên các trường đại học (UEH, NEU, FTU, v.v.). Dự án được xây dựng với mục tiêu giải quyết bài toán học nhóm nhàm chán bằng cách kết hợp **tương tác Voice trực tiếp**, **chế độ bạn bè/PK thách đấu kiến thức**, và **hệ thống gợi ý học tập cá nhân hóa**.

Đặc biệt, toàn bộ kiến trúc hạ tầng của dự án được tối ưu hóa để vận hành **hoàn toàn 0 đồng (Zero-Cost Operation)** thông qua sự kết hợp của Next.js 16, Supabase Cloud Free Tier và Vercel Hosting.

---

## ✨ Tính năng Nổi bật

### 1. 🎙️ Phòng Voice Học 1 vs 1 & Thách Đấu (PK Mode)
- **Phòng học thoại đôi**: Hai sinh viên cùng vào phòng ôn tập, cùng theo dõi một bộ đề câu hỏi theo thời gian thực.
- **Microphone Live WebRTC & Visualizer**: Tự động nhận diện tín hiệu âm thanh giọng nói với hiệu ứng sóng âm động trực quan.
- **Nhạc nền Lofi thư giãn**: Tích hợp các giai điệu nhẹ nhàng giúp tăng độ tập trung và giảm căng thẳng khi giải đề.

### 2. 🔑 Nhập mã phòng & Tự động kết nối qua Link mời
- **Modal Nhập mã Calm UI**: Thiết kế hiện đại, tối giản, tự động viết hoa mã phòng, kiểm tra tính hợp lệ.
- **Nút dán Clipboard thông minh**: Cho phép sinh viên dán nhanh mã phòng chỉ bằng một cú nhấp.
- **Tự động nhận diện URL (`?room=CODE`)**: Chủ phòng bấm "Sao chép link mời" gửi cho bạn bè; bạn bè nhấp vào link sẽ được hệ thống tự động tra cứu và đưa thẳng vào phòng học 1v1 mà không cần thao tác thiết lập lại.
- **Gợi ý mã nhanh**: Hỗ trợ các phòng mẫu như `VH-1024` (Kinh tế vi mô), `VH-2048` (Nguyên lý kế toán), `PK-3096` (Kinh tế vĩ mô).

### 3. ⚙️ Tùy biến Cấu hình Đề thi Chuyên sâu
- **Số lượng câu hỏi linh hoạt**: Chọn nhanh 5, 10, 15, 20 câu hoặc nhập số lượng tùy chọn mong muốn.
- **4 Cấp độ khó**: Dễ (Easy), Trung bình (Medium), Khó (Hard), Chuyên gia (Expert).
- **Phân loại câu hỏi**: Lựa chọn câu hỏi đơn (Single choice), đa lựa chọn (Multiple choices), câu hỏi đính kèm sơ đồ/hình ảnh minh họa.

### 4. 📚 Ngân hàng Môn học & Đề thi Đại học
- Kho đề trắc nghiệm chuẩn hóa cho các môn đại cương và chuyên ngành:
  - *Kinh tế vi mô (Microeconomics)*
  - *Kinh tế vĩ mô (Macroeconomics)*
  - *Nguyên lý kế toán (Financial Accounting)*
  - *Marketing căn bản*
  - *Triết học Mác - Lênin*

### 5. 🤖 Hệ sinh thái Trợ lý & Tiện ích Học tập
- **Check-in Thói quen học tập**: Theo dõi chuỗi ngày học tập (streak) và tạo động lực rèn luyện mỗi ngày.
- **Khảo sát & Lộ trình Cá nhân hóa**: Đo lường nhu cầu ôn thi và đề xuất lộ trình cải thiện điểm GPA.
- **SchoolGenZ & Progress Tracking**: Báo cáo tiến độ hoàn thành môn học và biểu đồ thống kê kết quả.

---

## 🛠️ Ngăn xếp Công nghệ (Tech Stack)

| Thành phần | Công nghệ / Dịch vụ | Mục đích |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.4.6** (Turbopack, App Router) | SSR/SSG tối ưu tốc độ, chuẩn bảo mật không CVE |
| **Giao diện (UI)** | **React 19**, **Tailwind CSS 3.4.17** | Thiết kế phong cách Calm UI, responsive mobile-first |
| **Bộ Icon** | **Lucide React** | Hệ thống biểu tượng vector sắc nét, nhẹ |
| **Database** | **Supabase PostgreSQL** | Cơ sở dữ liệu đám mây miễn phí, bảo mật Row Level Security |
| **Storage** | **Supabase Storage** (`studyflow-media`) | Lưu trữ hình ảnh đề thi, tài liệu minh họa |
| **API Client** | **Supabase REST Client** (Zero-Dependency) | Truy vấn trực tiếp qua HTTP REST, tối ưu hóa bundle size |
| **Triển khai (CI/CD)** | **Vercel Cloud** | Tự động build & phát hành khi đẩy code lên nhánh `main` |

---

## 🗄️ Cấu trúc Cơ sở Dữ liệu (Supabase PostgreSQL)

Dự án sử dụng 4 bảng chính được tối ưu hóa trong Supabase:
- `profiles`: Hồ sơ sinh viên, điểm kinh nghiệm, trường đại học.
- `quiz_questions`: Ngân hàng câu hỏi trắc nghiệm kèm lời giải và hình ảnh minh họa.
- `pk_rooms`: Quản lý phòng Voice/PK, mã phòng (`room_code`), chủ phòng, khách tham gia, trạng thái phòng.
- `study_records`: Lịch sử buổi học và kết quả làm bài trắc nghiệm.

---

## 📂 Cấu trúc Thư mục Dự án

```
Studytips/
├── src/
│   ├── app/                          # Next.js App Router (12 routes)
│   │   ├── layout.tsx                # Layout dùng chung cho toàn website
│   │   ├── page.tsx                  # Trang chủ StudyFlow AI
│   │   ├── pk/
│   │   │   └── page.tsx              # Sảnh chính PK, Voice Learning & URL Query Router
│   │   ├── checkin/                  # Điểm danh thói quen học tập
│   │   ├── survey/                   # Khảo sát nhu cầu ôn tập
│   │   ├── progress/                 # Tiến độ & thống kê kết quả
│   │   ├── assistant/                # Trợ lý thông minh
│   │   ├── navigator/                # Định hướng học tập
│   │   ├── schoolgenz/               # Cộng đồng sinh viên
│   │   └── help/                     # Trung tâm trợ giúp
│   ├── components/
│   │   ├── pk/                       # Cụm thành phần Voice & PK
│   │   │   ├── PKSubjectSelectionScreen.tsx    # Màn hình chọn môn học
│   │   │   ├── PKStudyModeSelectionScreen.tsx  # Chọn chế độ học tập
│   │   │   ├── PKFriendModeSelectionScreen.tsx # Chế độ ghép bạn & mời
│   │   │   ├── PKJoinCodeModal.tsx             # Modal Calm UI nhập mã phòng
│   │   │   ├── PKQuizConfigurationScreen.tsx   # Thiết lập cấu hình đề thi
│   │   │   ├── PKVoiceRoomSetup.tsx            # Phòng chờ & chia sẻ link
│   │   │   ├── PKActiveVoiceQuiz.tsx           # Phòng học Voice 1v1 trực tiếp
│   │   │   └── PKVoiceLearningContainer.tsx    # Bộ điều phối các bước phòng Voice
│   │   └── ...                       # Các component giao diện dùng chung khác
│   └── core/
│       ├── domain/                   # Định nghĩa kiểu dữ liệu TypeScript (pk.types.ts, ...)
│       ├── data/                     # Dữ liệu đề thi mẫu & danh mục môn học
│       └── services/
│           └── supabaseClient.ts     # Dịch vụ kết nối Supabase REST API
├── public/                           # Tài nguyên tĩnh (âm thanh, ảnh nền, logo)
├── next.config.js                    # Cấu hình Next.js (CommonJS, React StrictMode)
├── tailwind.config.ts                # Cấu hình giao diện Tailwind CSS
├── postcss.config.js                 # Cấu hình PostCSS
└── package.json                      # Quản lý phụ thuộc dự án (Next.js 16.4.6, React 19)
```

---

## 💻 Hướng dẫn Cài đặt & Chạy Cục bộ (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/minhtanbear-code/studyflow-ai.git
cd studyflow-ai

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy dev server
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 👨‍💻 Tác giả & Giấy phép
- **Tác giả**: [minhtanbear-code](https://github.com/minhtanbear-code)
- **Giấy phép**: MIT License
