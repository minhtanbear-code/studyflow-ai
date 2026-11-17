"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PKDocumentUploadScreen } from "@/components/pk/PKDocumentUploadScreen";
import { PKDocumentAnalysisScreen } from "@/components/pk/PKDocumentAnalysisScreen";
import { PKQuestionRecommendation } from "@/components/pk/PKQuestionRecommendation";
import { PKQuestionReviewScreen } from "@/components/pk/PKQuestionReviewScreen";
import { PKGameplaySelectionScreen, GameplayModeId } from "@/components/pk/PKGameplaySelectionScreen";
import { PKActiveGameplayQuiz } from "@/components/pk/PKActiveGameplayQuiz";
import { PKGamificationSummaryScreen, QuizSessionSummaryData } from "@/components/pk/PKGamificationSummaryScreen";
import { PKSubjectSelectionScreen } from "@/components/pk/PKSubjectSelectionScreen";
import { PKStudyModeSelectionScreen } from "@/components/pk/PKStudyModeSelectionScreen";
import { PKFriendModeSelectionScreen } from "@/components/pk/PKFriendModeSelectionScreen";
import { PKVoiceLearningContainer } from "@/components/pk/PKVoiceLearningContainer";
import { PKJoinCodeModal, RoomDetails } from "@/components/pk/PKJoinCodeModal";
import { PKIncomingInviteModal } from "@/components/pk/PKIncomingInviteModal";
import { supabaseService } from "@/core/services/supabaseClient";
import { userService } from "@/core/services/userService";
import { voiceRealtimeService, VoiceInvitation } from "@/core/services/voiceRealtimeService";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";
import { QuizQuestion } from "@/core/data/quizQuestions";
import {
  UploadedDocumentFile,
  DocumentAnalysisResult,
  AIQuestionRecommendation,
  DocumentQuizCustomConfig,
  GeneratedQuestionWithSource,
} from "@/core/domain/documentLearning.types";
import { documentAnalysisService } from "@/core/services/documentAnalysisService";

export default function PKPage() {
  const [step, setStep] = useState<
    | "upload"
    | "analyzing"
    | "recommendation"
    | "review"
    | "gameplay_select"
    | "gameplay_active"
    | "gameplay_summary"
    | "subject"
    | "mode"
    | "friend_mode"
    | "voice_learning"
  >("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocumentFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIQuestionRecommendation | null>(null);
  const [activeConfig, setActiveConfig] = useState<DocumentQuizCustomConfig | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionWithSource[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSetConfirmedModalOpen, setIsSetConfirmedModalOpen] = useState(false);

  // Gameplay session & Gamification state
  const [activeGameplayMode, setActiveGameplayMode] = useState<GameplayModeId>("solo");
  const [quizSummaryData, setQuizSummaryData] = useState<QuizSessionSummaryData | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<PKSubject>(
    MOCK_PK_SUBJECTS.find((s) => s.id === "eco101") || MOCK_PK_SUBJECTS[1]
  );
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>("");
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [joinedRoomData, setJoinedRoomData] = useState<RoomDetails | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<VoiceInvitation | null>(null);

  // Lắng nghe lời mời tham gia phòng gửi từ bạn bè (Incoming Invitations)
  useEffect(() => {
    const user = userService.getCurrentUser();
    const unsubscribe = voiceRealtimeService.subscribeToIncomingInvitations(user.id, (invite) => {
      setIncomingInvite(invite);
    });
    return () => unsubscribe();
  }, []);

  const handleJoinCode = async (code: string): Promise<boolean> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    const currentUser = userService.getCurrentUser();

    // 1. Tra cứu trực tiếp trên Database Supabase PostgreSQL
    try {
      const remoteRoom = await voiceRealtimeService.getRoom(clean);
      if (remoteRoom) {
        // Cập nhật trạng thái người tham gia lên Supabase với thông tin sinh viên thật
        await voiceRealtimeService.joinRoom(remoteRoom.room_code, {
          id: currentUser.id,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
          major: `${currentUser.university} • ${currentUser.major}`,
        });

        const matchedSubject =
          MOCK_PK_SUBJECTS.find((s) => s.id === remoteRoom.subject_id) ||
          MOCK_PK_SUBJECTS.find((s) => s.name.toLowerCase().includes(remoteRoom.subject_id.toLowerCase())) ||
          selectedSubject;

        setSelectedSubject(matchedSubject);

        setJoinedRoomData({
          roomCode: remoteRoom.room_code,
          roomName: remoteRoom.room_name,
          subjectId: remoteRoom.subject_id,
          subjectName: matchedSubject.name,
          hostName: remoteRoom.host_name,
          questionCount: remoteRoom.question_count,
          difficulty: remoteRoom.difficulty,
          mode: "voice",
        });

        setStep("voice_learning");
        return true;
      }
    } catch (e) {
      console.warn("Supabase lookup error, fallback to local mocks:", e);
    }

    // 2. Tra cứu mã mẫu dự phòng khi offline
    const sampleCodes: Record<string, RoomDetails> = {
      "VH-1024": {
        roomCode: "VH-1024",
        roomName: "Phòng Voice Ôn Thi: Kinh tế vi mô",
        subjectId: "eco101",
        subjectName: "Kinh tế vi mô",
        hostName: "Minh Tân (UEH)",
        mode: "voice",
      },
      "VH-2048": {
        roomCode: "VH-2048",
        roomName: "Phòng Thảo Luận: Nguyên lý kế toán",
        subjectId: "acc101",
        subjectName: "Nguyên lý kế toán",
        hostName: "Thu Hà (NEU)",
        mode: "voice",
      },
      "PK-3096": {
        roomCode: "PK-3096",
        roomName: "Leo Rank 1v1: Kinh tế vĩ mô",
        subjectId: "eco102",
        subjectName: "Kinh tế vĩ mô",
        hostName: "Hoàng Nam (FTU)",
        mode: "competition",
      },
    };

    const targetRoom = sampleCodes[clean];
    if (targetRoom) {
      setJoinedRoomData(targetRoom);
      const matchedSubject = MOCK_PK_SUBJECTS.find((s) => s.id === targetRoom.subjectId);
      if (matchedSubject) {
        setSelectedSubject(matchedSubject);
      }
      setStep("voice_learning");
      return true;
    }

    // If starts with VH- or PK- with at least 4 chars
    if (clean.length >= 4) {
      setJoinedRoomData({
        roomCode: clean,
        roomName: `Phòng Bạn Bè: ${clean}`,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        hostName: "Bạn đồng hành",
        mode: "voice",
      });
      setStep("voice_learning");
      return true;
    }

    return false;
  };

  // Tự động nhận diện link mời qua URL (?room=VH-1024 hoặc ?code=VH-1024)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room") || params.get("code");
      if (roomParam) {
        handleJoinCode(roomParam);
      }
    }
  }, []);

  const handleAcceptInvite = async (invite: VoiceInvitation) => {
    await voiceRealtimeService.respondInvitation(invite.id, true);
    setIncomingInvite(null);
    handleJoinCode(invite.room_code);
  };

  const handleDeclineInvite = async (invite: VoiceInvitation) => {
    await voiceRealtimeService.respondInvitation(invite.id, false);
    setIncomingInvite(null);
  };

  const handleGenerateQuestions = async (config: DocumentQuizCustomConfig) => {
    if (!analysisResult) return;
    setIsGeneratingQuestions(true);
    setActiveConfig(config);
    try {
      const generated = await documentAnalysisService.generateQuestions(
        analysisResult,
        config,
        uploadedFiles[0]?.name || "Tài liệu học tập"
      );
      setGeneratedQuestions(generated);
      setStep("review");

      // Lưu trữ phiên học tập vào sessionStorage
      try {
        sessionStorage.setItem(
          "studyflow_doc_session",
          JSON.stringify({
            subject: selectedSubject,
            analysis: analysisResult,
            config,
            questions: generated,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Lỗi lưu sessionStorage:", e);
      }
    } catch (err) {
      console.error("Lỗi tạo câu hỏi:", err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleRegenerateSingle = (questionId: string, index: number) => {
    if (!analysisResult) return;
    const cfg = activeConfig || {
      selectedChapterIds: [],
      selectedTopics: [],
      isAllDocument: true,
      questionCount: generatedQuestions.length,
      difficulty: "medium",
      questionTypes: ["single_choice"],
    };
    const newQuestion = documentAnalysisService.regenerateSingleQuestion(
      analysisResult,
      cfg,
      uploadedFiles[0]?.name || "Tài liệu học tập",
      index
    );
    const updated = generatedQuestions.map((q) => (q.id === questionId ? newQuestion : q));
    setGeneratedQuestions(updated);
  };

  const handleRegenerateAll = async () => {
    if (!analysisResult) return;
    const cfg = activeConfig || {
      selectedChapterIds: [],
      selectedTopics: [],
      isAllDocument: true,
      questionCount: generatedQuestions.length,
      difficulty: "medium",
      questionTypes: ["single_choice"],
    };
    try {
      const generated = await documentAnalysisService.generateQuestions(
        analysisResult,
        cfg,
        uploadedFiles[0]?.name || "Tài liệu học tập"
      );
      setGeneratedQuestions(generated);
    } catch (e) {
      console.error("Lỗi tạo lại tất cả câu hỏi:", e);
    }
  };

  const handleConfirmQuestionSet = (confirmedQuestions: GeneratedQuestionWithSource[]) => {
    setGeneratedQuestions(confirmedQuestions);
    setIsSetConfirmedModalOpen(true);
  };

  // Convert generated questions for Voice Learning compatibility
  const convertedVoiceQuestions: QuizQuestion[] = useMemo(() => {
    return generatedQuestions.map((g) => ({
      id: g.id,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      topic: g.topic,
      q: g.questionText,
      options: g.options,
      correct: g.correctAnswers[0] ?? 0,
      explanation: g.explanation,
      takeaway: `Trích từ tài liệu: ${g.sourceReference.excerpt || g.sourceReference.fileName}`,
    }));
  }, [generatedQuestions, selectedSubject]);

  return (
    <>
      <PKJoinCodeModal
        isOpen={isJoinCodeOpen}
        onClose={() => setIsJoinCodeOpen(false)}
        onJoinCode={handleJoinCode}
      />

      <PKIncomingInviteModal
        invitation={incomingInvite}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />

      {/* MODAL THÔNG BÁO XÁC NHẬN BỘ CÂU HỎI THÀNH CÔNG (PHASE 3 -> PHASE 4) */}
      {isSetConfirmedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-purple-200 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="text-3xl">🎯</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-[#17133B]">Bộ câu hỏi đã được xác nhận!</h3>
              <p className="text-xs text-[#77738F] font-medium leading-relaxed">
                Đã sẵn sàng <strong>{generatedQuestions.length} câu hỏi</strong> bám sát tài liệu cho môn{" "}
                <strong className="text-[#7C3AED]">{selectedSubject.name}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] text-left text-xs space-y-1.5 font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-[#77738F]">Môn học:</span>
                <span className="font-black text-[#7C3AED]">{selectedSubject.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Số lượng câu:</span>
                <span className="font-bold">{generatedQuestions.length} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Đã xác minh bởi bạn:</span>
                <span className="font-bold text-emerald-700">
                  {generatedQuestions.filter((q) => q.validationStatus === "user_verified").length} /{" "}
                  {generatedQuestions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Tài liệu nguồn:</span>
                <span className="font-bold truncate max-w-[180px]">
                  {uploadedFiles[0]?.name || "Tài liệu tải lên"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSetConfirmedModalOpen(false);
                  setStep("gameplay_select");
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
              >
                Tiến hành chọn chế độ học (Gameplay) &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsSetConfirmedModalOpen(false)}
                className="text-xs font-bold text-[#77738F] hover:text-[#17133B] py-1 cursor-pointer"
              >
                Tiếp tục xem lại bộ câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW FLOW - STEP 4.3: GAMIFICATION SUMMARY SCREEN */}
      {step === "gameplay_summary" && selectedSubject && quizSummaryData && (
        <PKGamificationSummaryScreen
          subject={selectedSubject}
          sourceFileName={uploadedFiles[0]?.name || "Tài liệu học tập"}
          questions={generatedQuestions}
          summaryData={quizSummaryData}
          onPlayAgain={() => setStep("gameplay_active")}
          onNewDocument={() => {
            setUploadedFiles([]);
            setAnalysisResult(null);
            setGeneratedQuestions([]);
            setStep("upload");
          }}
          onBackToModes={() => setStep("gameplay_select")}
        />
      )}

      {/* NEW FLOW - STEP 4.2: ACTIVE GAMEPLAY QUIZ ENGINE */}
      {step === "gameplay_active" && selectedSubject && generatedQuestions.length > 0 && (
        <PKActiveGameplayQuiz
          subject={selectedSubject}
          mode={activeGameplayMode}
          questions={generatedQuestions}
          sourceFileName={uploadedFiles[0]?.name || "Tài liệu học tập"}
          onFinish={(summary) => {
            setQuizSummaryData(summary);
            setStep("gameplay_summary");
          }}
          onLeave={() => setStep("gameplay_select")}
        />
      )}

      {/* NEW FLOW - STEP 4.1: GAMEPLAY SELECTION (5 MODES) */}
      {step === "gameplay_select" && selectedSubject && generatedQuestions.length > 0 && (
        <PKGameplaySelectionScreen
          subject={selectedSubject}
          questions={generatedQuestions}
          sourceFileName={uploadedFiles[0]?.name || "Tài liệu học tập"}
          onSelectMode={(modeId) => {
            setActiveGameplayMode(modeId);
            if (modeId === "voice_study") {
              setStep("voice_learning");
            } else {
              setStep("gameplay_active");
            }
          }}
          onBackToReview={() => setStep("review")}
        />
      )}

      {/* STEP 1: VOICE LEARNING / ROOMS (Preserved & Consumes Generated Questions) */}
      {step === "voice_learning" && selectedSubject && (
        <PKVoiceLearningContainer
          subject={selectedSubject}
          initialJoinedRoom={joinedRoomData}
          customQuestions={convertedVoiceQuestions.length > 0 ? convertedVoiceQuestions : undefined}
          onLeave={() => {
            setJoinedRoomData(null);
            setStep(generatedQuestions.length > 0 ? "gameplay_select" : "friend_mode");
          }}
        />
      )}

      {/* STEP 2: FRIEND MODE (Preserved) */}
      {step === "friend_mode" && selectedSubject && (
        <PKFriendModeSelectionScreen
          subject={selectedSubject}
          onBack={() => setStep("mode")}
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
          onSelectFriendMode={(mode) => {
            if (mode === "voice") {
              setStep("voice_learning");
            }
          }}
        />
      )}

      {/* STEP 3: STUDY MODE (Preserved) */}
      {step === "mode" && selectedSubject && (
        <PKStudyModeSelectionScreen
          subject={selectedSubject}
          onBack={() => setStep("subject")}
          onSelectMode={(modeId) => {
            if (modeId === "friend") {
              setStep("friend_mode");
            }
          }}
        />
      )}

      {/* STEP 4: MANUAL SUBJECT SELECTION (Preserved) */}
      {step === "subject" && (
        <PKSubjectSelectionScreen
          initialSubjectId={selectedSubject?.id}
          initialSearchQuery={savedSearchQuery}
          onBack={() => setStep("upload")}
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
          onSelectSubject={(subj, query) => {
            setSelectedSubject(subj);
            setSavedSearchQuery(query || "");
            setStep("mode");
          }}
        />
      )}

      {/* NEW FLOW - STEP 3: QUESTION GENERATION & REVIEW BEFORE PLAY */}
      {step === "review" && analysisResult && generatedQuestions.length > 0 && (
        <PKQuestionReviewScreen
          subject={selectedSubject}
          analysis={analysisResult}
          config={
            activeConfig || {
              selectedChapterIds: [],
              selectedTopics: [],
              isAllDocument: true,
              questionCount: generatedQuestions.length,
              difficulty: "medium",
              questionTypes: ["single_choice"],
            }
          }
          sourceFileName={uploadedFiles[0]?.name || "Tài liệu học tập"}
          questions={generatedQuestions}
          onUpdateQuestions={(updated) => {
            setGeneratedQuestions(updated);
            try {
              sessionStorage.setItem(
                "studyflow_doc_session",
                JSON.stringify({
                  subject: selectedSubject,
                  analysis: analysisResult,
                  config: activeConfig,
                  questions: updated,
                  timestamp: Date.now(),
                })
              );
            } catch (e) {
              console.warn("Lỗi lưu sessionStorage:", e);
            }
          }}
          onRegenerateSingle={handleRegenerateSingle}
          onRegenerateAll={handleRegenerateAll}
          onConfirmSet={handleConfirmQuestionSet}
          onBackToConfig={() => setStep("recommendation")}
        />
      )}

      {/* NEW FLOW - STEP 2.2: AI QUESTION RECOMMENDATION & CUSTOMIZATION */}
      {step === "recommendation" && analysisResult && aiRecommendation && (
        <PKQuestionRecommendation
          analysis={analysisResult}
          recommendation={aiRecommendation}
          onGenerate={handleGenerateQuestions}
          onBack={() => setStep("analyzing")}
        />
      )}

      {/* NEW FLOW - STEP 2.1: DOCUMENT ANALYSIS PROCESSING SCREEN */}
      {step === "analyzing" && uploadedFiles.length > 0 && (
        <PKDocumentAnalysisScreen
          files={uploadedFiles}
          onAnalysisComplete={(result) => {
            setAnalysisResult(result);

            // Đồng bộ môn học nếu nhận diện chính xác
            if (result.identifiedSubjectId) {
              const matched = MOCK_PK_SUBJECTS.find((s) => s.id === result.identifiedSubjectId);
              if (matched) {
                setSelectedSubject(matched);
              }
            } else if (result.identifiedSubjectName) {
              const matchedByName = MOCK_PK_SUBJECTS.find(
                (s) => s.name.toLowerCase() === result.identifiedSubjectName?.toLowerCase()
              );
              if (matchedByName) {
                setSelectedSubject(matchedByName);
              }
            }

            // Sinh đề xuất thông minh
            const rec = documentAnalysisService.getRecommendation(result);
            setAiRecommendation(rec);
            setStep("recommendation");
          }}
          onCancel={() => setStep("upload")}
        />
      )}

      {/* NEW FLOW - STEP 1: DOCUMENT UPLOAD UI */}
      {step === "upload" && (
        <PKDocumentUploadScreen
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
          onAnalyzeFiles={(files) => {
            setUploadedFiles(files);
            setStep("analyzing");
          }}
          onFallbackSelectSubject={() => setStep("subject")}
        />
      )}
    </>
  );
}
