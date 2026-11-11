export type RoomType = "lecture" | "peer_tutoring" | "pomodoro" | "exam_prep";

export interface ClassroomMember {
  id: string;
  name: string;
  role: "host" | "mentor" | "student";
  status: "focusing" | "asking" | "completed" | "idle";
  goal?: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface ClassroomMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  time: string;
  isHost?: boolean;
  isMentor?: boolean;
  isAi?: boolean;
}

export interface ClassroomResource {
  id: string;
  title: string;
  type: "pdf" | "link" | "notes";
  size?: string;
  author: string;
}

export interface ClassroomRoom {
  id: string;
  code: string; // Mã phòng 6 ký tự để tham gia, vd: MATH-99, CODE-88
  title: string;
  courseCode: string;
  courseName: string;
  hostName: string;
  hostRole: "Giảng viên" | "Trợ giảng Mentor" | "Nhóm trưởng";
  roomType: RoomType;
  description: string;
  totalMembers: number;
  onlineCount: number;
  isPrivate: boolean;
  password?: string;
  activeMembers: ClassroomMember[];
  messages: ClassroomMessage[];
  resources: ClassroomResource[];
  attendanceChecked: boolean;
  pomodoroMinutesLeft: number;
  isPomodoroRunning: boolean;
  createdAt: string;
}
