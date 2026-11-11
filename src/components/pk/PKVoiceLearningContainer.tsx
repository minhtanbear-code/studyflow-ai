"use client";

import React, { useState } from "react";
import { PKSubject } from "@/core/domain/pk.types";
import { PKQuizConfigurationScreen, QuizConfigData } from "./PKQuizConfigurationScreen";
import { PKVoiceRoomSetup } from "./PKVoiceRoomSetup";
import { PKActiveVoiceQuiz } from "./PKActiveVoiceQuiz";

interface PKVoiceLearningContainerProps {
  subject: PKSubject;
  onLeave: () => void;
}

export function PKVoiceLearningContainer({ subject, onLeave }: PKVoiceLearningContainerProps) {
  // Navigation step inside Voice Learning: "config" (Step 1) | "invitation" (Step 2) | "active" (Step 3)
  const [containerStep, setContainerStep] = useState<"config" | "invitation" | "active">("config");

  // Preserved quiz configuration from Step 1
  const [quizConfig, setQuizConfig] = useState<QuizConfigData>({
    questionCount: 10,
    isCustomCount: false,
    difficulty: "medium",
    questionTypes: ["single_choice"],
    includeImages: true,
  });

  const [activeSession, setActiveSession] = useState<{
    roomName: string;
    roomCode: string;
    friendName: string;
    friendAvatar: string;
  } | null>(null);

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
          setContainerStep("invitation");
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
