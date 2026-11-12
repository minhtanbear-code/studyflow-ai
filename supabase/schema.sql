-- ==============================================================================
-- STUDYFLOW AI - SUPABASE DATABASE & STORAGE SCHEMA (100% MIỄN PHÍ)
-- ==============================================================================
-- Chạy script này trong mục "SQL Editor" trên trang quản trị https://supabase.com
-- ==============================================================================

-- 1. BẢNG HỒ SƠ SINH VIÊN (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    major VARCHAR(100),
    academic_year VARCHAR(20),
    pk_points INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM (QUIZ_QUESTIONS)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    topic VARCHAR(100),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    image_url TEXT, -- Link ảnh minh họa lưu trên Supabase Storage
    audio_url TEXT, -- Link file audio giải thích lưu trên Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BẢNG PHÒNG VOICE HỌC 1 VS 1 (PK_ROOMS)
CREATE TABLE IF NOT EXISTS public.pk_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) UNIQUE NOT NULL,
    room_name VARCHAR(150) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    host_name VARCHAR(100) NOT NULL,
    guest_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'reviewing', 'ready', 'active', 'completed')),
    question_count INTEGER DEFAULT 10,
    difficulty VARCHAR(20) DEFAULT 'medium',
    include_images BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BẢNG LỊCH SỬ LUYỆN TẬP & KẾT QUẢ PK (STUDY_RECORDS)
CREATE TABLE IF NOT EXISTS public.study_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(100) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    study_mode VARCHAR(50) DEFAULT 'voice_learning',
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    score_percentage NUMERIC(5, 2) NOT NULL,
    duration_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. THIẾT LẬP BẢO MẬT ROW LEVEL SECURITY (RLS) - MIỄN PHÍ & AN TOÀN
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pk_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai (Read Access)
CREATE POLICY "Cho phép đọc dữ liệu công khai" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Cho phép đọc phòng PK" ON public.pk_rooms FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo phòng PK" ON public.pk_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép cập nhật phòng PK" ON public.pk_rooms FOR UPDATE USING (true);
CREATE POLICY "Cho phép ghi nhận lịch sử học" ON public.study_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép xem bảng xếp hạng" ON public.study_records FOR SELECT USING (true);
