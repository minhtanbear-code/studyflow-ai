export type UserRole = "student" | "peer_mentor" | "advisor" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
}

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface CheckinSubmission {
  id: string;
  userId: string;
  energyLevel: EnergyLevel;
  difficultyTags: string[];
  note?: string;
  createdAt: string;
  sourceTag: "self_reported";
}

export interface MicroAction {
  id: string;
  title: string;
  category: "calm" | "study_hack" | "resource" | "advisor";
  durationMinutes: number;
  description: string;
  actionUrl?: string;
  tag: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  blindAliasId?: string;
  isAnonymous: boolean;
  category: "academic_rules" | "methods" | "psychological";
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  assignedTo?: string;
  createdAt: string;
}
