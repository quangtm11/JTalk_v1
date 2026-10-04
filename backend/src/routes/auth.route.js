import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  changePassword,
  signUp,
  signIn,
  signOut,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Production endpoints (/api/v1/auth)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/change-password", protectedRoute, changePassword);

// Backward-compatible aliases for existing client
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);

export default router;
