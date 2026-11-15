-- ==============================================================================
-- STUDYFLOW AI - AUTHENTICATION & USER PROFILE SCHEMA
-- ==============================================================================
-- Chạy toàn bộ file này trong mục "SQL Editor" tại https://supabase.com
-- ==============================================================================

-- 1. BẢNG PROFILES ĐỒNG BỘ 1-1 VỚI AUTH.USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    university VARCHAR(100),
    major VARCHAR(100),
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ràng buộc định dạng Username (khi thiết lập: >= 3 ký tự, chỉ gồm chữ, số và dấu gạch dưới)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_username;
ALTER TABLE public.profiles ADD CONSTRAINT valid_username 
CHECK (username IS NULL OR (char_length(username) >= 3 AND username ~ '^[a-zA-Z0-9_]+$'));

-- 2. DATABASE TRIGGER: TỰ ĐỘNG TẠO PROFILES KHI CÓ USER ĐĂNG KÝ (EMAIL HOẶC GOOGLE OAUTH)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_full_name TEXT;
    initial_avatar TEXT;
BEGIN
    initial_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );
    initial_avatar := COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture',
        upper(substring(initial_full_name from 1 for 2))
    );

    INSERT INTO public.profiles (id, email, full_name, avatar_url, profile_completed)
    VALUES (
        new.id,
        new.email,
        initial_full_name,
        initial_avatar,
        false
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn Trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. THIẾT LẬP ROW LEVEL SECURITY (RLS) AN TOÀN CHO PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cho phép đọc profiles công khai" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép người dùng sửa profile của mình" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép người dùng tạo profile của mình" ON public.profiles;

-- Người dùng đã xác thực được xem profile của nhau (để tìm bạn, hiển thị tên trong phòng Voice)
CREATE POLICY "Cho phép đọc profiles công khai"
ON public.profiles FOR SELECT
USING (true);

-- Chỉ chính chủ mới có quyền sửa đổi hồ sơ của mình
CREATE POLICY "Cho phép người dùng sửa profile của mình"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Cho phép insert hồ sơ chính chủ
CREATE POLICY "Cho phép người dùng tạo profile của mình"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. BỔ SUNG TRƯỜNG CHO PK_ROOMS VÀ TÍN HIỆU
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_id VARCHAR(100);
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_id VARCHAR(100);
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_avatar VARCHAR(50) DEFAULT 'SV';
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_avatar VARCHAR(50) DEFAULT 'BN';
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_ready BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_ready BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_mic BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_mic BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_speaking BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_speaking BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_major VARCHAR(100);
