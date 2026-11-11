export type PKMode = "solo" | "team";
export type PKTeamSize = "1v1" | "2v2" | "3v3";
export type PKRoomStatus = "waiting" | "in_progress" | "finished";
export type PKTabType = "public" | "my_rooms" | "history";
export type BotDifficulty = "easy" | "medium" | "hard" | "adaptive";
export type SoloSubOption = "pvp" | "bot_practice";

export interface BotPracticeConfig {
  subjectId: string;
  subjectName: string;
  difficulty: BotDifficulty;
  durationMinutes: number;
  questionsCount: number;
}

export interface PKSubject {
  id: string;
  code: string;
  name: string;
  icon: string;
  activeRoomsCount: number;
  description?: string;
  tag?: string;
}

export interface PKRoom {
  id: string;
  roomCode: string;
  title: string;
  subjectId: string;
  subjectName: string;
  mode: PKMode;
  teamSize: PKTeamSize;
  currentPlayers: number;
  maxPlayers: number;
  isPrivate: boolean;
  status: PKRoomStatus;
  hostName: string;
  hostAvatar?: string;
  durationMinutes: number;
  questionsCount: number;
  createdAt: string;
}

export interface PKLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  university: string;
  rating: number;
  winRate: number; // e.g. 72%
  streak: number;
  tier: "Đồng" | "Bạc" | "Vàng" | "Bạch Kim" | "Kim Cương" | "Cao Thủ";
}

export interface PKUserStats {
  id: string;
  name: string;
  studentId: string;
  university: string;
  avatar: string;
  rating: number;
  tier: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteSubject: string;
}

export interface PKSubjectProgress {
  subjectId: string;
  subjectName: string;
  code: string;
  masteredPercentage: number;
  matchesPlayed: number;
  accuracyRate: number;
}

export interface PKStudyRecommendation {
  id: string;
  subjectCode: string;
  subjectName: string;
  topic: string;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedAction: string;
}

export interface PKHistoryEntry {
  id: string;
  roomCode: string;
  subjectName: string;
  mode: PKMode;
  teamSize: PKTeamSize;
  result: "win" | "loss" | "draw";
  score: string; // e.g. "8/10"
  opponentOrTeam: string;
  ratingDelta: number; // e.g. +24 or -12 (0 for bot practice)
  date: string;
  isBotPractice?: boolean;
  botDifficulty?: BotDifficulty;
  feedbackNotes?: string;
}
