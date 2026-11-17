"use client";

import React, { useState, useEffect } from "react";
import { PKDocumentUploadScreen } from "@/components/pk/PKDocumentUploadScreen";
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
import { UploadedDocumentFile } from "@/core/domain/documentLearning.types";

export default function PKPage() {
  const [step, setStep] = useState<"upload" | "subject" | "mode" | "friend_mode" | "voice_learning">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocumentFile[]>([]);
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

      {step === "upload" && (
        <PKDocumentUploadScreen
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
          onAnalyzeFiles={(files) => {
            setUploadedFiles(files);
            // Phase 1: Lưu trữ danh sách file đã xác thực thành công
          }}
          onFallbackSelectSubject={() => setStep("subject")}
        />
      )}
    </>
  );
}
