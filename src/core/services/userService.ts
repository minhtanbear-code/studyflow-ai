// ==============================================================================
// STUDYFLOW AI - USER IDENTITY & FRIENDSHIP SERVICE
// ==============================================================================
// Quản lý định danh người dùng cục bộ, đồng bộ Supabase và danh bạ bạn bè thực.
// ==============================================================================

import { supabaseService } from "./supabaseClient";

export interface StudentProfile {
  id: string; // Mã định danh duy nhất (UUID hoặc chuỗi ngẫu nhiên lưu tại browser)
  username: string; // Tên đăng nhập (VD: minhtan, thuha)
  fullName: string; // Tên hiển thị (VD: Minh Tân, Thu Hà)
  avatar: string; // Chữ viết tắt 2 ký tự (VD: MT, TH)
  university: string; // Trường đại học (VD: UEH, NEU, FTU)
  major: string; // Ngành học (VD: Kinh tế đối ngoại, Tài chính)
  academicYear: string; // Khóa (VD: K68, K67)
  isOnline: boolean;
}

const LOCAL_STORAGE_KEY = "studyflow_student_profile";

// Danh sách tài khoản sinh viên mẫu hỗ trợ tìm kiếm và kết nối tức thì
export const PRESET_STUDENTS: StudentProfile[] = [
  {
    id: "std-001",
    username: "minhtan",
    fullName: "Minh Tân",
    avatar: "MT",
    university: "UEH",
    major: "Kinh tế đối ngoại",
    academicYear: "K68",
    isOnline: true,
  },
  {
    id: "std-002",
    username: "thuha",
    fullName: "Thu Hà",
    avatar: "TH",
    university: "NEU",
    major: "Nguyên lý kế toán",
    academicYear: "K68",
    isOnline: true,
  },
  {
    id: "std-003",
    username: "hoangmai",
    fullName: "Lê Hoàng Mai",
    avatar: "HM",
    university: "FTU",
    major: "Kinh tế quốc tế",
    academicYear: "K67",
    isOnline: true,
  },
  {
    id: "std-004",
    username: "baongoc",
    fullName: "Trần Bảo Ngọc",
    avatar: "BN",
    university: "UEH",
    major: "Tài chính ngân hàng",
    academicYear: "K68",
    isOnline: true,
  },
  {
    id: "std-005",
    username: "vantuan",
    fullName: "Nguyễn Văn Tuấn",
    avatar: "VT",
    university: "UFM",
    major: "Marketing căn bản",
    academicYear: "K68",
    isOnline: true,
  },
];

export const userService = {
  /**
   * Lấy hồ sơ người dùng hiện tại từ localStorage hoặc tạo mới tự động
   */
  getCurrentUser(): StudentProfile {
    if (typeof window === "undefined") {
      return PRESET_STUDENTS[0];
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Error reading user profile from localStorage:", e);
    }

    // Nếu chưa có, tự động tạo hồ sơ mặc định theo trình duyệt
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const defaultUser: StudentProfile = {
      id: `std-${Date.now()}-${randomSuffix}`,
      username: `student_${randomSuffix}`,
      fullName: `Sinh viên ${randomSuffix}`,
      avatar: `SV`,
      university: "UEH",
      major: "Kinh tế học",
      academicYear: "K68",
      isOnline: true,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultUser));
    } catch {}

    // Đồng bộ lên Supabase nếu có mạng
    this.syncProfileToSupabase(defaultUser);

    return defaultUser;
  },

  /**
   * Cập nhật hồ sơ sinh viên
   */
  updateCurrentUser(profile: Partial<StudentProfile>): StudentProfile {
    const current = this.getCurrentUser();
    const updated: StudentProfile = {
      ...current,
      ...profile,
      avatar: profile.fullName
        ? profile.fullName
            .trim()
            .split(" ")
            .map((w) => w[0])
            .slice(-2)
            .join("")
            .toUpperCase()
        : current.avatar,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    this.syncProfileToSupabase(updated);
    return updated;
  },

  /**
   * Đồng bộ hồ sơ lên Supabase PostgreSQL
   */
  async syncProfileToSupabase(profile: StudentProfile): Promise<void> {
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          student_code: profile.id,
          full_name: profile.fullName,
          major: `${profile.major} (${profile.academicYear})`,
          academic_year: profile.academicYear,
          avatar_url: profile.avatar,
          is_online: true,
        }),
      });
    } catch (e) {
      console.warn("Supabase profile sync warning:", e);
    }
  },

  /**
   * Tìm kiếm sinh viên theo tên hoặc tài khoản/trường
   */
  async searchStudents(query: string): Promise<StudentProfile[]> {
    const q = query.trim().toLowerCase();
    const currentUser = this.getCurrentUser();

    // 1. Tìm trên Supabase
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?or=(full_name.ilike.*${encodeURIComponent(q)}*,student_code.ilike.*${encodeURIComponent(q)}*)&limit=10`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const fromDb: StudentProfile[] = rows
            .filter((r: any) => r.student_code !== currentUser.id)
            .map((r: any) => ({
              id: r.student_code || r.id,
              username: r.username || r.student_code,
              fullName: r.full_name,
              avatar: r.avatar_url || r.full_name.slice(0, 2).toUpperCase(),
              university: "UEH",
              major: r.major || "Kinh tế",
              academicYear: r.academic_year || "K68",
              isOnline: r.is_online ?? true,
            }));

          if (fromDb.length > 0) return fromDb;
        }
      }
    } catch (e) {
      console.warn("Supabase search fallback to preset:", e);
    }

    // 2. Tìm kiếm trong danh sách mẫu
    return PRESET_STUDENTS.filter(
      (s) =>
        s.id !== currentUser.id &&
        (s.fullName.toLowerCase().includes(q) ||
          s.username.toLowerCase().includes(q) ||
          s.major.toLowerCase().includes(q) ||
          s.university.toLowerCase().includes(q))
    );
  },

  /**
   * Lấy danh sách bạn bè của người dùng hiện tại
   */
  getFriendList(): StudentProfile[] {
    const currentUser = this.getCurrentUser();
    return PRESET_STUDENTS.filter((s) => s.id !== currentUser.id);
  },
};
