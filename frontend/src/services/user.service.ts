import api from "@/services/api";
import type { User, UserProfile } from "@/types";

export interface LeaderboardUser {
  rank: number;
  _id: string;
  displayName: string;
  avatarUrl?: string;
  targetLevel: string;
  totalXp: number;
  streak: number;
  level: number;
  isPremium?: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
  profile?: Partial<UserProfile>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export const userService = {
  getLeaderboard: async (type: "xp" | "streak" = "xp", limit = 20): Promise<LeaderboardUser[]> => {
    try {
      const res = await api.get(`/users/leaderboard?type=${type}&limit=${limit}`);
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error("Lỗi khi tải bảng xếp hạng:", err);
      return [];
    }
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<User> => {
    const res = await api.patch("/users/me", data);
    return res.data?.user || res.data?.data || res.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    const res = await api.post("/users/change-password", data);
    return res.data;
  },
};

export default userService;
