import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import StudyLog from "../models/StudyLog.js";
import { getTodayDateString, getActiveStreak } from "../utils/dateUtils.js";
import config from "../config/index.js";

export class UserService {
  /**
   * Retrieves comprehensive user profile with live subscription and streak data
   */
  static async getMe(userId) {
    const user = await User.findById(userId).select("-hashedPassword");
    if (!user) {
      const error = new Error("Không tìm thấy thông tin người dùng.");
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();

    // Query active subscription from subscriptions collection
    const activeSub = await Subscription.findOne({
      userId,
      status: { $in: ["active", "ACTIVE"] },
      endDate: { $gt: now },
    }).sort({ endDate: -1 });

    const isPremium = !!activeSub;

    // Calculate today's quota usage
    const todayStr = getTodayDateString();
    const todayLog = await StudyLog.findOne({ userId, date: todayStr });
    const usedToday = todayLog ? todayLog.practiceCount : 0;
    const limit = config.quota.freeDailyPracticeLimit;
    const remaining = isPremium ? Infinity : Math.max(0, limit - usedToday);

    const subscriptionInfo = {
      isPremium,
      tier: isPremium ? "premium" : "free",
      status: activeSub ? activeSub.status : "free",
      planType: activeSub ? activeSub.planType : null,
      startDate: activeSub ? activeSub.startDate : null,
      endDate: activeSub ? activeSub.endDate : null,
      expires_at: activeSub ? activeSub.endDate : null,
    };

    // Verify if streak is still active or expired (missed yesterday)
    let currentStreak = user.gamification?.streak || 0;
    const lastActiveDate = user.gamification?.lastActiveDate;
    const activeStreak = getActiveStreak(lastActiveDate, currentStreak);

    if (currentStreak > 0 && activeStreak === 0) {
      user.gamification.streak = 0;
      await user.save();
      currentStreak = 0;
    } else {
      currentStreak = activeStreak;
    }

    const userObj = user.toObject();

    return {
      ...userObj,
      dailyUsage: {
        date: todayStr,
        practiceCount: usedToday,
        minutesSpent: todayLog ? todayLog.minutesSpent : (user.dailyUsage?.minutesSpent || 0),
      },
      streak_count: currentStreak,
      streak: currentStreak,
      gamification: {
        ...userObj.gamification,
        streak: currentStreak,
      },
      subscription: subscriptionInfo,
      quota: {
        isUnlimited: isPremium,
        limit: isPremium ? "unlimited" : limit,
        usedToday,
        remaining: isPremium ? "unlimited" : remaining,
      },
    };
  }

  /**
   * Updates user profile fields and JLPT targets safely
   */
  static async updateProfile(userId, updateData) {
    const updates = {};

    if (updateData.displayName !== undefined) {
      const trimmedName = String(updateData.displayName).trim();
      if (!trimmedName) {
        const error = new Error("Tên hiển thị không được để trống.");
        error.statusCode = 400;
        throw error;
      }
      updates.displayName = trimmedName;
    }

    if (updateData.avatarUrl !== undefined) {
      updates.avatarUrl = updateData.avatarUrl;
    }

    if (updateData.avatarId !== undefined) {
      updates.avatarId = updateData.avatarId;
    }

    if (updateData.bio !== undefined) {
      updates.bio = String(updateData.bio).slice(0, 500);
    }

    if (updateData.phone !== undefined) {
      updates.phone = String(updateData.phone).trim();
    }

    if (updateData.profile && typeof updateData.profile === "object") {
      const { targetLevel, goal, occupation, dailyTargetMinutes } = updateData.profile;

      if (targetLevel !== undefined) {
        const validLevels = ["N5", "N4", "N3", "N2", "N1"];
        if (!validLevels.includes(targetLevel)) {
          const error = new Error("Trình độ mục tiêu JLPT không hợp lệ (hỗ trợ N5, N4, N3, N2, N1).");
          error.statusCode = 400;
          throw error;
        }
        updates["profile.targetLevel"] = targetLevel;
      }

      if (goal !== undefined) {
        const validGoals = ["daily_conversation", "interview", "business", "travel"];
        if (!validGoals.includes(goal)) {
          const error = new Error("Mục tiêu học không hợp lệ.");
          error.statusCode = 400;
          throw error;
        }
        updates["profile.goal"] = goal;
      }

      if (occupation !== undefined) {
        const validOccupations = ["student", "working", "other"];
        if (!validOccupations.includes(occupation)) {
          const error = new Error("Nghề nghiệp không hợp lệ.");
          error.statusCode = 400;
          throw error;
        }
        updates["profile.occupation"] = occupation;
      }

      if (dailyTargetMinutes !== undefined) {
        const minutes = Number(dailyTargetMinutes);
        if (isNaN(minutes) || minutes < 5 || minutes > 300) {
          const error = new Error("Thời gian luyện tập mỗi ngày phải từ 5 đến 300 phút.");
          error.statusCode = 400;
          throw error;
        }
        updates["profile.dailyTargetMinutes"] = minutes;
      }
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: updates }, { runValidators: true });
    }

    return await UserService.getMe(userId);
  }

  /**
   * Retrieves leaderboard sorted by total XP or streak
   * @param {string} type - 'xp' | 'streak'
   * @param {number} limit - number of users (default 20)
   */
  static async getLeaderboard(type = "xp", limit = 20) {
    const sortField = type === "streak" ? "gamification.streak" : "gamification.totalXp";
    const users = await User.find({})
      .select("displayName avatarUrl profile.targetLevel gamification subscription.tier")
      .sort({ [sortField]: -1 })
      .limit(Math.min(limit, 50))
      .lean();

    return users.map((u, index) => ({
      rank: index + 1,
      _id: u._id,
      displayName: u.displayName || "Học viên JTalk",
      avatarUrl: u.avatarUrl,
      targetLevel: u.profile?.targetLevel || "N5",
      totalXp: u.gamification?.totalXp || 0,
      streak: u.gamification?.streak || 0,
      level: u.gamification?.level || 1,
      isPremium: u.subscription?.tier === "premium",
    }));
  }
}

export default UserService;
