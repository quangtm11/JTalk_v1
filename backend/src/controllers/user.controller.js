import UserService from "../services/user.service.js";
import AuthService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * GET /api/v1/users/me (or /api/users/me)
 * Retrieves user profile, active subscription details from subscriptions collection, and streak
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userData = await UserService.getMe(userId);

    // Provide both user object format and wrapped format for full compatibility
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công!",
      data: userData,
      user: userData, // For frontend compatibility (res.data.user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/users/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updatedUser = await UserService.updateProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      data: updatedUser,
      user: updatedUser, // For frontend compatibility (res.data.user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/users/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, "Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      return errorResponse(res, "Mật khẩu xác nhận không khớp.", 400);
    }

    await AuthService.changePassword(userId, { currentPassword, newPassword });

    return successResponse(res, null, "Đổi mật khẩu thành công!");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/users/leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const type = req.query.type || "xp"; // "xp" | "streak"
    const limit = parseInt(req.query.limit, 10) || 20;
    const leaderboard = await UserService.getLeaderboard(type, limit);

    return successResponse(res, leaderboard, "Lấy bảng xếp hạng thành công!");
  } catch (error) {
    next(error);
  }
};

// Aliases for compatibility
export const authMe = getMe;
