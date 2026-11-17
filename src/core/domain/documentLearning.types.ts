// ==============================================================================
// STUDYFLOW AI - DOCUMENT LEARNING DOMAIN TYPES
// ==============================================================================
// Định nghĩa cấu trúc dữ liệu cho pipeline:
// TÀI LIỆU -> PHÂN TÍCH -> ĐỀ XUẤT CÂU HỎI -> TÙY CHỈNH -> GENERATION -> REVIEW -> GAMEPLAY
// ==============================================================================

export interface UploadedDocumentFile {
  id: string;
  name: string;
  size: number;
  type: string; // "pdf" | "docx" | "pptx" | "image"
  rawFile?: File;
  uploadedAt: string;
  status: "ready" | "processing" | "analyzed" | "error";
  errorMessage?: string;
  extractedText?: string;
}

export interface DocumentChapter {
  id: string;
  title: string;
  topics: string[];
}

export interface DocumentAnalysisResult {
  identifiedSubjectName: string | null;
  identifiedSubjectId: string | null;
  confidenceScore: number; // 0 - 1
  chapters: DocumentChapter[];
  totalTopicsCount: number;
  keyConceptsSummary: string[];
  extractedWordCount: number;
  rawText: string;
}

export interface AIQuestionRecommendation {
  title: string;
  description: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "expert" | "adaptive";
  scopeDescription: string;
  targetChapterIds: string[];
  focusNotes: string;
}

export interface DocumentQuizCustomConfig {
  selectedChapterIds: string[];
  selectedTopics: string[];
  isAllDocument: boolean;
  questionCount: number; // 5, 10, 15, 20 or custom
  difficulty: "easy" | "medium" | "hard" | "expert" | "adaptive";
  questionTypes: ("single_choice" | "multiple_choice" | "image_chart")[];
}

export interface GeneratedQuestionWithSource {
  id: string;
  questionText: string;
  options: string[];
  correctAnswers: number[]; // Index của đáp án đúng (hỗ trợ cả single & multiple)
  explanation: string;
  sourceReference: {
    fileName: string;
    chapterOrSection?: string;
    excerpt: string; // Đoạn trích dẫn nguyên văn từ tài liệu nguồn
  };
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "expert" | "adaptive";
  validationStatus: "ai_generated_unverified" | "user_verified" | "teacher_verified";
  createdAt: string;
}

export type DocumentLearningStep =
  | "upload"
  | "analyzing"
  | "recommendation"
  | "generating"
  | "review"
  | "gameplay_select"
  | "gameplay_active";
