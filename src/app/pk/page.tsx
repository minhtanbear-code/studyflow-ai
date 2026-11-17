"use client";

import React, { useState, useEffect } from "react";
import { PKDocumentUploadScreen } from "@/components/pk/PKDocumentUploadScreen";
import { PKDocumentAnalysisScreen } from "@/components/pk/PKDocumentAnalysisScreen";
import { PKQuestionRecommendation } from "@/components/pk/PKQuestionRecommendation";
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
    "upload" | "analyzing" | "recommendation" | "subject" | "mode" | "friend_mode" | "voice_learning"
  >("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocumentFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIQuestionRecommendation | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionWithSource[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationSuccessInfo, setGenerationSuccessInfo] = useState<{ count: number; config: DocumentQuizCustomConfig } | null>(null);

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
    try {
      const generated = await documentAnalysisService.generateQuestions(
        analysisResult,
        config,
        uploadedFiles[0]?.name || "Tài liệu học tập"
      );
      setGeneratedQuestions(generated);
      setGenerationSuccessInfo({ count: generated.length, config });

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

      {/* MODAL THÔNG BÁO HOÀN TẤT TẠO BỘ CÂU HỎI (PHASE 2 SUCCESS) */}
      {generationSuccessInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-purple-200 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="text-3xl">✨</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-[#17133B]">Bộ câu hỏi đã được tạo thành công!</h3>
              <p className="text-xs text-[#77738F] font-medium">
                AI đã trích xuất và sinh <strong>{generationSuccessInfo.count} câu hỏi</strong> trắc nghiệm bám sát nội dung tài liệu.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8FF] rounded-2xl border border-[#EDE9FE] text-left text-xs space-y-1.5 font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-[#77738F]">Môn học:</span>
                <span className="font-black text-[#7C3AED]">{selectedSubject.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Số lượng:</span>
                <span className="font-bold">{generationSuccessInfo.count} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Mức độ:</span>
                <span className="font-bold capitalize">{generationSuccessInfo.config.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77738F]">Trạng thái:</span>
                <span className="text-amber-700 font-bold">AI tạo – chưa xác minh</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setGenerationSuccessInfo(null)}
                className="w-full py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
              >
                Tiếp tục xem & chỉnh sửa câu hỏi (Phase 3)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenerationSuccessInfo(null);
                  setStep("recommendation");
                }}
                className="text-xs font-bold text-[#77738F] hover:text-[#17133B] py-1 cursor-pointer"
              >
                Cấu hình lại bộ câu hỏi khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: VOICE LEARNING / ROOMS (Preserved) */}
      {step === "voice_learning" && selectedSubject && (
        <PKVoiceLearningContainer
          subject={selectedSubject}
          initialJoinedRoom={joinedRoomData}
          onLeave={() => {
            setJoinedRoomData(null);
            setStep("friend_mode");
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
