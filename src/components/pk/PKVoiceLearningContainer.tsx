"use client";

import React, { useState, useEffect } from "react";
import { PKSubject } from "@/core/domain/pk.types";
import { PKQuizConfigurationScreen, QuizConfigData } from "./PKQuizConfigurationScreen";
import { PKVoiceRoomSetup } from "./PKVoiceRoomSetup";
import { PKActiveVoiceQuiz } from "./PKActiveVoiceQuiz";
import { RoomDetails } from "./PKJoinCodeModal";

interface PKVoiceLearningContainerProps {
  subject: PKSubject;
  onLeave: () => void;
  initialJoinedRoom?: RoomDetails | null;
}

export function PKVoiceLearningContainer({ subject, onLeave, initialJoinedRoom }: PKVoiceLearningContainerProps) {
  // Navigation step inside Voice Learning: "config" (Step 1) | "invitation" (Step 2) | "active" (Step 3)
  const [containerStep, setContainerStep] = useState<"config" | "invitation" | "active">(
    initialJoinedRoom ? "active" : "config"
  );

  // Preserved quiz configuration from Step 1
  const [quizConfig, setQuizConfig] = useState<QuizConfigData>({
    questionCount: initialJoinedRoom?.questionCount || 10,
    isCustomCount: false,
    difficulty: (initialJoinedRoom?.difficulty as any) || "medium",
    questionTypes: ["single_choice"],
    includeImages: true,
  });

  const [activeSession, setActiveSession] = useState<{
    roomName: string;
    roomCode: string;
    friendName: string;
    friendAvatar: string;
  } | null>(() => {
    if (initialJoinedRoom) {
      return {
        roomName: initialJoinedRoom.roomName,
        roomCode: initialJoinedRoom.roomCode,
        friendName: initialJoinedRoom.hostName || "Chủ phòng",
        friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };
    }
    return null;
  });

  // Đồng bộ khi có phòng mới được gia nhập qua mã hoặc URL
  useEffect(() => {
    if (initialJoinedRoom) {
      setActiveSession({
        roomName: initialJoinedRoom.roomName,
        roomCode: initialJoinedRoom.roomCode,
        friendName: initialJoinedRoom.hostName || "Chủ phòng",
        friendAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });
      if (initialJoinedRoom.questionCount) {
        setQuizConfig((prev) => ({
          ...prev,
          questionCount: initialJoinedRoom.questionCount || prev.questionCount,
          difficulty: (initialJoinedRoom.difficulty as any) || prev.difficulty,
        }));
      }
      setContainerStep("active");
    }
  }, [initialJoinedRoom]);

  // STEP 1: Quiz Configuration Screen
  if (containerStep === "config") {
    return (
      <PKQuizConfigurationScreen
        subject={subject}
        onBack={onLeave}
        onConfirmConfig={(config) => {
          setQuizConfig(config);
          setContainerStep("invitation");
        }}
      />
    );
  }

  // STEP 3: Active Voice Learning Quiz Room
  if (containerStep === "active" && activeSession) {
    return (
      <PKActiveVoiceQuiz
        subject={subject}
        roomName={activeSession.roomName}
        roomCode={activeSession.roomCode}
        friendName={activeSession.friendName}
        friendAvatar={activeSession.friendAvatar}
        config={quizConfig}
        onLeave={() => {
          setActiveSession(null);
          if (initialJoinedRoom) {
            onLeave();
          } else {
            setContainerStep("invitation");
          }
        }}
      />
    );
  }

  // STEP 2: Room Invitation & Waiting Room (Default)
  return (
    <PKVoiceRoomSetup
      subject={subject}
      config={quizConfig}
      onBack={() => setContainerStep("config")}
      onStartSession={(data) => {
        setActiveSession(data);
        setContainerStep("active");
      }}
    />
  );
}
