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

```sql
-- 1. Bảng hồ sơ sinh viên
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  university TEXT,
  major TEXT,
  avatar_url TEXT,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ngân hàng câu hỏi trắc nghiệm
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quản lý phòng Voice / PK thời gian thực
CREATE TABLE IF NOT EXISTS pk_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  guest_name TEXT,
  status TEXT DEFAULT 'waiting',
  question_count INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'medium',
  include_images BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Nhật ký kết quả học tập
CREATE TABLE IF NOT EXISTS study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📂 Cấu trúc Thư mục Dự án

```
Studytips/
├── src/
│   ├── app/                          # Next.js App Router
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

### 1. Yêu cầu Hệ thống
- **Node.js**: Phiên bản `20.x` trở lên (Khuyến nghị `20.18.0` hoặc `22.x`)
- **NPM**: Phiên bản `10.x` trở lên
- **Git**

### 2. Cài đặt các gói phụ thuộc
```bash
# Clone dự án từ GitHub
git clone https://github.com/minhtanbear-code/studyflow-ai.git

# Di chuyển vào thư mục dự án
cd studyflow-ai

# Cài đặt thư viện
npm install
```

### 3. Cấu hình Biến Môi trường (.env.local)
Tạo file `.env.local` tại thư mục gốc của dự án:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zvnmnbhoywksqhjjifff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu
```

### 4. Khởi động Máy chủ Thử nghiệm
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000` (hoặc `http://localhost:3000/pk`).

### 5. Kiểm thử Bản dựng Production
```bash
npm run build
npm run start
```

---

## 🚀 Quy trình Triển khai 5 Bước Miễn phí (Zero-Cost Deployment Lifecycle)

Toàn bộ dự án tuân theo tiêu chuẩn phát hành 5 bước độc lập:
1. **Bước 1: Lập trình Giao diện & Tính năng** &rarr; Thiết kế kiến trúc Next.js App Router chuẩn Calm UI.
2. **Bước 2: Kiểm thử Cục bộ (Localhost 3000)** &rarr; Xác nhận 12/12 trang tĩnh kết xuất hoàn hảo.
3. **Bước 3: Đồng bộ Mã nguồn GitHub** &rarr; Đẩy mã nguồn lên kho lưu trữ `minhtanbear-code/studyflow-ai`.
4. **Bước 4: Thiết lập Database & Media Supabase** &rarr; Khởi tạo bảng PostgreSQL và bucket lưu trữ media miễn phí.
5. **Bước 5: Phát hành Tên miền Vercel Cloud** &rarr; Tự động kết nối Vercel với GitHub, chứng chỉ SSL miễn phí, CDN toàn cầu.

---

## 👨‍💻 Tác giả & Giấy phép
- **Tác giả**: [minhtanbear-code](https://github.com/minhtanbear-code)
- **Đơn vị phát triển**: Nhóm nghiên cứu STUDYFLOW AI
- **Giấy phép**: MIT License (Tự do học tập, nghiên cứu và phát triển phi thương mại).
