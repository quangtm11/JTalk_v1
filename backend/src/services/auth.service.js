import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";
import config from "../config/index.js";

/**
 * Service for user authentication and session management
 */
export class AuthService {
  /**
   * Register a new user account
   */
  static async register({ username, password, email, firstName, lastName, displayName }) {
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check duplicate username
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      const error = new Error("Tên đăng nhập đã được sử dụng.");
      error.statusCode = 409;
      throw error;
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      const error = new Error("Email đã được đăng ký tài khoản khác.");
      error.statusCode = 409;
      throw error;
    }

    // Hash password with bcrypt (salt = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const resolvedDisplayName = displayName || `${firstName || ""} ${lastName || ""}`.trim() || trimmedUsername;

    const user = await User.create({
      username: trimmedUsername,
      hashedPassword,
      email: trimmedEmail,
      displayName: resolvedDisplayName,
    });

    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Sign in with username and password
   */
  static async login({ username, password }) {
    const trimmedUsername = username.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: trimmedUsername }, { email: trimmedUsername }],
    });

    if (!user) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      const error = new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
      error.statusCode = 401;
      throw error;
    }

    // Generate short-lived Access Token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwt.accessTokenSecret,
      { expiresIn: config.jwt.accessTokenTtl }
    );

    // Generate secure random Refresh Token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Persist Refresh Token in sessions collection
    const expiresAt = new Date(Date.now() + config.jwt.refreshTokenTtlMs);
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt,
    });

    const userObj = user.toObject();
    delete userObj.hashedPassword;

    return {
      user: userObj,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Refresh access token using a valid session
   */
  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error("Không tìm thấy Refresh Token.");
      error.statusCode = 401;
      throw error;
    }

    // Find token in sessions collection
    const session = await Session.findOne({ refreshToken }).populate("userId", "-hashedPassword");

    if (!session) {
      const error = new Error("Refresh Token không hợp lệ hoặc đã bị thu hồi.");
      error.statusCode = 403;
      throw error;
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      const error = new Error("Refresh Token đã hết hạn. Vui lòng đăng nhập lại.");
      error.statusCode = 403;
      throw error;
    }

    const user = session.userId;
    if (!user) {
      const error = new Error("Người dùng của phiên đăng nhập không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    // Issue new Access Token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwt.accessTokenSecret,
      { expiresIn: config.jwt.accessTokenTtl }
    );

    return {
      accessToken: newAccessToken,
      user,
    };
  }

  /**
   * Change user password securely
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const error = new Error("Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.");
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error("Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.");
      error.statusCode = 400;
      throw error;
    }

    if (currentPassword === newPassword) {
      const error = new Error("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy thông tin người dùng.");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch) {
      const error = new Error("Mật khẩu hiện tại không chính xác.");
      error.statusCode = 400;
      throw error;
    }

    user.hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Đổi mật khẩu thành công!" };
  }
}

export default AuthService;
