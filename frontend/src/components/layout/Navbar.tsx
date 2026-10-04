"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/lib/react-router-compat";
import {
  Search,
  Flame,
  Sparkles,
  Mic,
  Gift,
  Sun,
  Moon,
  Menu,
  Trophy,
  ShieldCheck,
  User as UserIcon,
  KeyRound,
  Target,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useThemeStore } from "@/stores/useThemeStore";
import Logout from "../auth/Logout";
import { PremiumModal } from "@/components/common/PremiumModal";
import { DailyCheckInModal } from "@/components/gamification/DailyCheckInModal";
import { Badge } from "@/components/common/Badge";
import { ProfileModal, ProfileModalTab } from "@/components/profile/ProfileModal";
import { CommandSearchDialog } from "@/components/common/CommandSearchDialog";

export default function Navbar() {
  const { user, isPremium, streak, remainingFreePractices } = useAuth();
  const { toggleSidebar } = useSidebarStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<ProfileModalTab>("profile");
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenProfileModal = (tab: ProfileModalTab = "profile") => {
    setProfileModalTab(tab);
    setShowProfileModal(true);
    setShowUserDropdown(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchDialog((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const targetLevel = user?.profile?.targetLevel || "N5";
  const xpPoints = user?.gamification?.totalXp || 0;

  return (
    <>
      <header className="sticky top-0 z-30 h-18 px-4 sm:px-8 flex items-center justify-between gap-4 bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs font-sans transition-colors duration-200">
        {/* Left Section: Mobile Menu Trigger & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            type="button"
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearchDialog(true)}
            type="button"
            className="sm:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tìm kiếm nhanh toàn trang"
            title="Tìm kiếm nhanh (Cmd+K)"
          >
            <Search size={17} />
          </button>

          {/* Search Button - Rounded full pill with keyboard shortcut */}
          <button
            onClick={() => setShowSearchDialog(true)}
            type="button"
            className="relative w-full hidden sm:flex items-center h-10 rounded-full bg-slate-100/90 dark:bg-slate-800/70 pl-10 pr-12 text-xs font-medium border border-transparent dark:text-slate-300 text-slate-500 hover:border-rose-400/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group text-left"
          >
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 dark:group-hover:text-rose-400 transition-colors"
            />
            <span className="truncate">Tìm bài học, kịch bản phỏng vấn, từ vựng...</span>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-3xs font-bold text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-slate-700/80 px-1.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-600 shadow-2xs">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Section: Badges, Actions, Theme Toggle & User */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Admin Portal Quick Link (Only visible to admin) */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md hover:shadow-indigo-500/25 active:scale-97 transition-all cursor-pointer"
              title="Truy cập Cổng Quản trị viên"
            >
              <ShieldCheck size={14} />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Quick Action: Start AI Speaking */}
          <Link
            to="/speaking"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md hover:shadow-rose-500/20 active:scale-97 transition-all cursor-pointer"
          >
            <Mic size={14} className="animate-pulse" />
            <span>Luyện nói AI</span>
          </Link>

          {/* Daily Streak Badge */}
          <button
            onClick={() => setShowCheckInModal(true)}
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1.5 text-xs font-black text-rose-900 dark:text-rose-200 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xs hover:bg-rose-100/80 dark:hover:bg-rose-900/40"
            title={`Chuỗi ${streak} ngày học liên tiếp! Bấm để xem Thẻ điểm danh 7 ngày.`}
          >
            <Flame size={15} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>{streak} ngày</span>
          </button>

          {/* XP Pill (Hidden on mobile) */}
          {xpPoints > 0 && (
            <div
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-full text-xs font-black text-amber-900 dark:text-amber-200 shrink-0"
              title={`Tổng điểm kinh nghiệm: ${xpPoints} XP`}
            >
              <Trophy size={13} className="text-amber-500" />
              <span>{xpPoints} XP</span>
            </div>
          )}

          {/* Quota / Premium Badge (Không hiển thị cho Admin vì Admin đã có toàn quyền) */}
          {user?.role === "admin" ? null : isPremium ? (
            <Badge variant="premium" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              PRO Vô Hạn
            </Badge>
          ) : (
            <button
              onClick={() => setShowPremiumModal(true)}
              type="button"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                remainingFreePractices > 0
                  ? "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60"
                  : "bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 border-rose-300/80 dark:border-rose-800/60 animate-pulse"
              }`}
            >
              <Gift
                size={13}
                className="text-rose-600 dark:text-rose-400"
              />
              <span>
                {remainingFreePractices > 0
                  ? `Còn ${remainingFreePractices}/2 lượt`
                  : "Hết lượt (0/2)"}
              </span>
              <span className="font-extrabold underline underline-offset-2 ml-0.5">
                Nâng cấp
              </span>
            </button>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
            aria-label="Toggle color theme"
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400 animate-spin-slow" />
            ) : (
              <Moon size={16} className="text-slate-600" />
            )}
          </button>

          {/* User Profile Avatar with Level Ring & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              type="button"
              className="flex items-center gap-2 group relative p-0.5 rounded-full cursor-pointer focus:outline-hidden"
              title="Tùy chọn tài khoản & bảo mật"
              aria-expanded={showUserDropdown}
            >
              <div className="h-9 w-9 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 group-hover:scale-105 transition-transform shadow-2xs">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || "Avatar"}
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0f172a]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-rose-600 dark:bg-slate-900 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-[#0f172a]">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "J"}
                  </div>
                )}
              </div>
              <span className="hidden xl:inline-block text-2xs font-extrabold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {targetLevel}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "J"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.displayName || user?.username || "Học viên JTalk"}
                      </p>
                      <p className="text-3xs text-slate-400 dark:text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-3xs font-extrabold border border-rose-200 dark:border-rose-800">
                      Mục tiêu: JLPT {targetLevel}
                    </span>
                    {isPremium && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-3xs font-extrabold border border-amber-200 dark:border-amber-800">
                        PRO
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-rose-500" />
                    <span>Trang cá nhân & Thống kê</span>
                  </Link>

                  <button
                    onClick={() => handleOpenProfileModal("profile")}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>

                  <button
                    onClick={() => handleOpenProfileModal("goals")}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Target className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mục tiêu JLPT & Luyện tập</span>
                  </button>

                  <button
                    onClick={() => handleOpenProfileModal("security")}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Đổi mật khẩu & Bảo mật</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Discreet Logout Icon */}
          <Logout />
        </div>
      </header>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        reason="quota_exceeded"
      />

      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        autoCheckDaily={false}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialTab={profileModalTab}
      />

      <CommandSearchDialog
        isOpen={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
        onOpenProfileTab={handleOpenProfileModal}
      />
    </>
  );
}
