"use client";

import React, { useState } from "react";
import { PKSubjectSelectionScreen } from "@/components/pk/PKSubjectSelectionScreen";
import { PKStudyModeSelectionScreen } from "@/components/pk/PKStudyModeSelectionScreen";
import { PKFriendModeSelectionScreen } from "@/components/pk/PKFriendModeSelectionScreen";
import { PKVoiceLearningContainer } from "@/components/pk/PKVoiceLearningContainer";
import { MOCK_PK_SUBJECTS } from "@/core/data/mockPkData";
import { PKSubject } from "@/core/domain/pk.types";

export default function PKPage() {
  const [step, setStep] = useState<"subject" | "mode" | "friend_mode" | "voice_learning">("subject");
  const [selectedSubject, setSelectedSubject] = useState<PKSubject>(
    MOCK_PK_SUBJECTS.find((s) => s.id === "eco101") || MOCK_PK_SUBJECTS[1]
  );
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>("");

  if (step === "voice_learning" && selectedSubject) {
    return (
      <PKVoiceLearningContainer
        subject={selectedSubject}
        onLeave={() => setStep("friend_mode")}
      />
    );
  }

  if (step === "friend_mode" && selectedSubject) {
    return (
      <PKFriendModeSelectionScreen
        subject={selectedSubject}
        onBack={() => setStep("mode")}
        onSelectFriendMode={(mode) => {
          if (mode === "voice") {
            setStep("voice_learning");
          }
        }}
      />
    );
  }

  if (step === "mode" && selectedSubject) {
    return (
      <PKStudyModeSelectionScreen
        subject={selectedSubject}
        onBack={() => setStep("subject")}
        onSelectMode={(modeId) => {
          if (modeId === "friend") {
            setStep("friend_mode");
          }
        }}
      />
    );
  }

  return (
    <PKSubjectSelectionScreen
      initialSubjectId={selectedSubject?.id}
      initialSearchQuery={savedSearchQuery}
      onSelectSubject={(subj, query) => {
        setSelectedSubject(subj);
        if (query !== undefined) {
          setSavedSearchQuery(query);
        }
        setStep("mode");
      }}
    />
  );
}
