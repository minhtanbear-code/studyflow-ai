-- ==============================================================================
-- STUDYFLOW AI - NÂNG CẤP TÍNH NĂNG KẾT NỐI BẠN BÈ & WEBRTC VOICE 1V1
-- ==============================================================================
-- Chạy toàn bộ file này trong mục "SQL Editor" tại https://supabase.com
-- ==============================================================================

-- 1. BẬT FULL QUYỀN TRUY CẬP CHO BẢNG PROFILES (ĐỂ LƯU VÀ TÌM KIẾM BẠN BÈ)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

DROP POLICY IF EXISTS "Cho phép đọc profiles" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép tạo profiles" ON public.profiles;
DROP POLICY IF EXISTS "Cho phép sửa profiles" ON public.profiles;

CREATE POLICY "Cho phép đọc profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép sửa profiles" ON public.profiles FOR UPDATE USING (true);

-- 2. BẢNG QUẢN LÝ BẠN BÈ (FRIENDSHIPS)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    friend_id VARCHAR(100) NOT NULL,
    friend_name VARCHAR(100) NOT NULL,
    friend_major VARCHAR(100),
    friend_avatar VARCHAR(50),
    status VARCHAR(20) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cho phép đọc friendships" ON public.friendships;
DROP POLICY IF EXISTS "Cho phép tạo friendships" ON public.friendships;
DROP POLICY IF EXISTS "Cho phép xóa friendships" ON public.friendships;

CREATE POLICY "Cho phép đọc friendships" ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo friendships" ON public.friendships FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phép xóa friendships" ON public.friendships FOR DELETE USING (true);

-- 3. NÂNG CẤP BẢNG PHÒNG VOICE (PK_ROOMS) VỚI CÁC TRƯỜNG ĐỒNG BỘ THỜI GIAN THỰC
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_id VARCHAR(100);
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_id VARCHAR(100);
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_avatar VARCHAR(50) DEFAULT 'DL';
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_avatar VARCHAR(50) DEFAULT 'BN';
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_ready BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_ready BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_mic BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_mic BOOLEAN DEFAULT true;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS host_speaking BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_speaking BOOLEAN DEFAULT false;
ALTER TABLE public.pk_rooms ADD COLUMN IF NOT EXISTS guest_major VARCHAR(100);

-- Cho phép xóa phòng
DROP POLICY IF EXISTS "Cho phép xóa phòng PK" ON public.pk_rooms;
CREATE POLICY "Cho phép xóa phòng PK" ON public.pk_rooms FOR DELETE USING (true);

-- 4. BẢNG LỜI MỜI VÀO PHÒNG TRỰC TIẾP (VOICE_INVITATIONS)
CREATE TABLE IF NOT EXISTS public.voice_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_avatar VARCHAR(50),
    receiver_id VARCHAR(100) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    question_count INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.voice_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cho phép thao tác voice_invitations" ON public.voice_invitations;
CREATE POLICY "Cho phép thao tác voice_invitations" ON public.voice_invitations FOR ALL USING (true) WITH CHECK (true);

-- 5. BẢNG WEBRTC SIGNALING (TRAO ĐỔI SDP OFFER / ANSWER VÀ ICE CANDIDATES)
CREATE TABLE IF NOT EXISTS public.webrtc_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(20) NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'offer', 'answer', 'ice-candidate'
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cho phép thao tác webrtc_signals" ON public.webrtc_signals;
CREATE POLICY "Cho phép thao tác webrtc_signals" ON public.webrtc_signals FOR ALL USING (true) WITH CHECK (true);

-- Tự động dọn dẹp các tín hiệu WebRTC cũ hơn 10 phút để bảng luôn gọn nhẹ
CREATE INDEX IF NOT EXISTS idx_webrtc_room_code ON public.webrtc_signals(room_code);
CREATE INDEX IF NOT EXISTS idx_voice_invitations_receiver ON public.voice_invitations(receiver_id);
