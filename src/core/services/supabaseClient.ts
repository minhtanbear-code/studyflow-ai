// ==============================================================================
// STUDYFLOW AI - SUPABASE CLIENT SERVICE (REST API - ZERO DEPENDENCY)
// ==============================================================================
// Cho phép ứng dụng truy vấn dữ liệu từ Supabase PostgreSQL & Storage hoàn toàn miễn phí.
// Hoạt động độc lập qua Fetch API mà không làm tăng dung lượng bundle của web.
// ==============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("your-project-id")
  );
};

export interface RemoteQuizQuestion {
  id: string;
  subject_id: string;
  subject_name: string;
  topic?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string;
  difficulty?: string;
  image_url?: string;
  audio_url?: string;
}

export const supabaseService = {
  /**
   * Lấy danh sách câu hỏi trắc nghiệm từ Supabase Database
   */
  async getQuestionsBySubject(subjectId: string, limit: number = 10): Promise<RemoteQuizQuestion[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/quiz_questions?subject_id=eq.${subjectId}&limit=${limit}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Supabase fetch warning:", response.statusText);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn("Supabase fetch error, fallback to local mock questions:", error);
      return [];
    }
  },

  /**
   * Lấy đường link CDN trực tiếp cho file ảnh/video/nhạc lưu trong Supabase Storage
   */
  getMediaPublicUrl(bucketName: string, filePath: string): string {
    if (!SUPABASE_URL) return "";
    return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
  },

  /**
   * Lưu kết quả phiên học hoặc thi đấu PK lên Supabase
   */
  async recordStudyResult(record: {
    student_name: string;
    subject_name: string;
    study_mode: string;
    total_questions: number;
    correct_count: number;
    score_percentage: number;
    duration_seconds: number;
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/study_records`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(record),
      });

      return response.ok;
    } catch (error) {
      console.error("Error saving study record to Supabase:", error);
      return false;
    }
  },
};
