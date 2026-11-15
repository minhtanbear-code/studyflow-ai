// ==============================================================================
// STUDYFLOW AI - VOICE REALTIME & INVITATION SERVICE
// ==============================================================================
// Điều phối đồng bộ trạng thái phòng Voice 1v1, gửi nhận lời mời và dọn dẹp phòng.
// Hoạt động 100% miễn phí thông qua Supabase REST API Polling (chu kỳ 1.5s).
// ==============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvnmnbhoywksqhjjifff.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_CWa2l7VillbirjwL2wfrBg_nT5caIuu";

export interface RealtimeVoiceRoom {
  id: string;
  room_code: string;
  room_name: string;
  subject_id: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  host_ready: boolean;
  host_mic: boolean;
  host_speaking?: boolean;
  guest_id?: string | null;
  guest_name?: string | null;
  guest_avatar?: string | null;
  guest_major?: string | null;
  guest_ready?: boolean;
  guest_mic?: boolean;
  guest_speaking?: boolean;
  status: "waiting" | "friend_reviewing" | "ready" | "active" | "closed";
  question_count: number;
  difficulty: string;
  include_images?: boolean;
  created_at?: string;
}

export interface VoiceInvitation {
  id: string;
  room_code: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_id: string;
  subject_name: string;
  question_count?: number;
  difficulty?: string;
  status: "pending" | "accepted" | "declined";
  created_at?: string;
}

export const voiceRealtimeService = {
  /**
   * Tạo phòng Voice mới trên Supabase
   */
  async createRoom(room: {
    room_code: string;
    room_name: string;
    subject_id: string;
    host_id: string;
    host_name: string;
    host_avatar: string;
    question_count: number;
    difficulty: string;
    include_images: boolean;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/pk_rooms`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          room_code: room.room_code,
          room_name: room.room_name,
          subject_id: room.subject_id,
          host_id: room.host_id,
          host_name: room.host_name,
          host_avatar: room.host_avatar,
          host_ready: true,
          host_mic: true,
          status: "waiting",
          question_count: room.question_count,
          difficulty: room.difficulty,
          include_images: room.include_images,
        }),
      });
      return res.ok;
    } catch (e) {
      console.warn("createRoom error:", e);
      return false;
    }
  },

  /**
   * Lấy thông tin phòng hiện tại
   */
  async getRoom(roomCode: string): Promise<RealtimeVoiceRoom | null> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (e) {
      console.warn("getRoom error:", e);
      return null;
    }
  },

  /**
   * Khách tham gia vào phòng (khi nhập mã, mở link hoặc chấp nhận lời mời)
   */
  async joinRoom(roomCode: string, guest: {
    id: string;
    fullName: string;
    avatar: string;
    major: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            guest_id: guest.id,
            guest_name: guest.fullName,
            guest_avatar: guest.avatar,
            guest_major: guest.major,
            guest_ready: false,
            guest_mic: true,
            status: "friend_reviewing",
          }),
        }
      );
      return res.ok;
    } catch (e) {
      console.warn("joinRoom error:", e);
      return false;
    }
  },

  /**
   * Khách xác nhận đồng ý cấu hình đề thi
   */
  async guestAcceptConfig(roomCode: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            guest_ready: true,
            status: "ready",
          }),
        }
      );
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Khách từ chối cấu hình đề thi (yêu cầu host đổi đề)
   */
  async guestDeclineConfig(roomCode: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            guest_name: null,
            guest_id: null,
            status: "waiting",
          }),
        }
      );
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Bắt đầu phiên làm bài trực tiếp
   */
  async startActiveSession(roomCode: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "active",
          }),
        }
      );
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Cập nhật trạng thái microphone của một người trong phòng
   */
  async updateMicState(roomCode: string, isHost: boolean, isMicOn: boolean): Promise<boolean> {
    try {
      const body = isHost ? { host_mic: isMicOn } : { guest_mic: isMicOn };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(body),
        }
      );
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Rời phòng và đóng kết nối
   */
  async leaveRoom(roomCode: string, isHost: boolean): Promise<boolean> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/pk_rooms?room_code=eq.${encodeURIComponent(roomCode.trim().toUpperCase())}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "closed",
            guest_name: isHost ? null : null,
          }),
        }
      );
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Lắng nghe đồng bộ trạng thái phòng liên tục mỗi 1.5 giây
   */
  subscribeToRoom(roomCode: string, onUpdate: (room: RealtimeVoiceRoom) => void): () => void {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      const room = await this.getRoom(roomCode);
      if (room && isActive) {
        onUpdate(room);
      }
    };

    poll();
    const interval = setInterval(poll, 1500);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  },

  /**
   * Gửi lời mời trực tiếp đến một người bạn
   */
  async sendDirectInvitation(invitation: {
    room_code: string;
    sender_id: string;
    sender_name: string;
    sender_avatar: string;
    receiver_id: string;
    subject_name: string;
    question_count: number;
    difficulty: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/voice_invitations`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          ...invitation,
          status: "pending",
        }),
      });
      return res.ok;
    } catch (e) {
      console.warn("sendDirectInvitation error:", e);
      return false;
    }
  },

  /**
   * Lắng nghe các lời mời gửi đến người dùng hiện tại
   */
  subscribeToIncomingInvitations(receiverId: string, onInvite: (invite: VoiceInvitation) => void): () => void {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/voice_invitations?receiver_id=eq.${encodeURIComponent(receiverId)}&status=eq.pending&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0 && isActive) {
            onInvite(list[0]);
          }
        }
      } catch (e) {}
    };

    poll();
    const interval = setInterval(poll, 2500);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  },

  /**
   * Trả lời lời mời (Chấp nhận hoặc Từ chối)
   */
  async respondInvitation(inviteId: string, accept: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/voice_invitations?id=eq.${inviteId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: accept ? "accepted" : "declined",
        }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },
};
