"use client";

import React, { useState } from "react";
import { PKSubjectSelectionScreen } from "@/components/pk/PKSubjectSelectionScreen";
import { PKStudyModeSelectionScreen } from "@/components/pk/PKStudyModeSelectionScreen";
import { PKFriendModeSelectionScreen } from "@/components/pk/PKFriendModeSelectionScreen";
import { PKVoiceLearningContainer } from "@/components/pk/PKVoiceLearningContainer";
import { PKJoinCodeModal, RoomDetails } from "@/components/pk/PKJoinCodeModal";
import { supabaseService } from "@/core/services/supabaseClient";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";

export default function PKPage() {
  const [step, setStep] = useState<"subject" | "mode" | "friend_mode" | "voice_learning">("subject");
  const [selectedSubject, setSelectedSubject] = useState<PKSubject>(
    MOCK_PK_SUBJECTS.find((s) => s.id === "eco101") || MOCK_PK_SUBJECTS[1]
  );
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>("");
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [joinedRoomData, setJoinedRoomData] = useState<RoomDetails | null>(null);

  const handleJoinCode = async (code: string): Promise<boolean> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    // 1. Tra cứu trực tiếp trên Database Supabase PostgreSQL
    try {
      const remoteRoom = await supabaseService.getPKRoomByCode(clean);
      if (remoteRoom) {
        // Cập nhật trạng thái người tham gia lên Supabase
        await supabaseService.joinPKRoom(remoteRoom.room_code, "Bạn đồng hành");

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

  return (
    <>
      <PKJoinCodeModal
        isOpen={isJoinCodeOpen}
        onClose={() => setIsJoinCodeOpen(false)}
        onJoinCode={handleJoinCode}
      />

      {step === "voice_learning" && selectedSubject && (
        <PKVoiceLearningContainer
          subject={selectedSubject}
          onLeave={() => setStep("friend_mode")}
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
          onOpenJoinCode={() => setIsJoinCodeOpen(true)}
          onSelectSubject={(subj, query) => {
            setSelectedSubject(subj);
            if (query !== undefined) {
              setSavedSearchQuery(query);
            }
            setStep("mode");
          }}
        />
      )}
    </>
  );
}
