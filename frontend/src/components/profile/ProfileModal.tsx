"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Target,
  KeyRound,
  Sparkles,
  Check,
  Save,
  Lock,
  Mail,
  Phone,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Clock,
  Compass,
  Briefcase,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { UserProfile } from "@/types";

export type ProfileModalTab = "profile" | "goals" | "security";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ProfileModalTab;
}

const PRESET_AVATARS = [
  {
    name: "Sakura Sensei",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Kenji Senpai",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Aoi Student",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Ren Tokyo",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Hana Kyoto",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Daiki Shonen",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

const JLPT_LEVELS = [
  {
    level: "N5",
    title: "JLPT N5 • Nhập Môn",
    desc: "Chào hỏi, mua sắm, phát âm chuẩn & từ vựng đời sống cơ bản.",
    tag: "Khuyên dùng cho người mới",
    color: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    level: "N4",
    title: "JLPT N4 • Sơ Cấp",
    desc: "Giao tiếp hàng ngày, hỏi đường, chỉ dẫn & du lịch Nhật Bản.",
    tag: "Phổ biến nhất",
    color: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    level: "N3",
    title: "JLPT N3 • Trung Cấp",
    desc: "Hội thoại trôi chảy, phản xạ nhanh, đi làm & phỏng vấn xin việc.",
    tag: "Mục tiêu đi làm",
    color: "from-rose-500 to-amber-600",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  {
    level: "N2",
    title: "JLPT N2 • Cao Cấp",
    desc: "Đàm phán thương mại, thuyết trình công ty & tin tức thời sự.",
    tag: "Chuyên nghiệp",
    color: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  {
    level: "N1",
    title: "JLPT N1 • Bản Ngữ",
    desc: "Lưu loát đa chủ đề, học thuật, tranh biện & kính ngữ Keigo sâu.",
    tag: "Thành thạo",
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
] as const;

const GOAL_OPTIONS = [
  {
    id: "daily_conversation",
    title: "Giao tiếp hàng ngày",
    desc: "Kết bạn, sinh hoạt, anime, sở thích & văn hóa Nhật",
    icon: "💬",
  },
  {
    id: "interview",
    title: "Phỏng vấn việc làm",
    desc: "Phỏng vấn Visa, thực tập sinh kỹ năng, kỹ sư & Tokutei",
    icon: "🎯",
  },
  {
    id: "business",
    title: "Công sở & Doanh nghiệp",
    desc: "Kính ngữ Keigo, báo cáo Horenso, họp & gửi mail đối tác",
    icon: "💼",
  },
  {
    id: "travel",
    title: "Du lịch & Trải nghiệm",
    desc: "Khách sạn, nhà hàng, ga tàu, check-in & mua sắm",
    icon: "✈️",
  },
] as const;

const OCCUPATION_OPTIONS = [
  { id: "student", label: "Học sinh / Sinh viên", icon: GraduationCap },
  { id: "working", label: "Người đi làm / Kỹ sư", icon: Briefcase },
  { id: "other", label: "Khác", icon: Compass },
] as const;

const STUDY_TIME_OPTIONS = [10, 15, 30, 45, 60] as const;

export const ProfileModal = ({
  isOpen,
  onClose,
  initialTab = "profile",
}: ProfileModalProps) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileModalTab>(initialTab);

  // Form states - Profile
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);

  // Form states - Goals
  const [targetLevel, setTargetLevel] = useState<"N5" | "N4" | "N3" | "N2" | "N1">("N5");
  const [goal, setGoal] = useState<"daily_conversation" | "interview" | "business" | "travel">("daily_conversation");
  const [occupation, setOccupation] = useState<"student" | "working" | "other">("student");
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(15);

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reset tab and sync fields whenever modal opens or user data changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (user) {
        setDisplayName(user.displayName || "");
        setAvatarUrl(user.avatarUrl || "");
        setPhone(user.phone || "");
        setBio(user.bio || "");
        setTargetLevel(user.profile?.targetLevel || "N5");
        setGoal(user.profile?.goal || "daily_conversation");
        setOccupation(user.profile?.occupation || "student");
        setDailyTargetMinutes(user.profile?.dailyTargetMinutes || 15);
      }
      // Reset security fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, initialTab, user]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: "Chưa nhập", color: "bg-slate-200 dark:bg-slate-700" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score: 1, text: "Yếu", color: "bg-rose-500" };
    if (score <= 3) return { score: 2, text: "Trung bình", color: "bg-amber-500" };
    if (score <= 4) return { score: 3, text: "Mạnh", color: "bg-emerald-500" };
    return { score: 4, text: "Rất mạnh", color: "bg-emerald-600" };
  };

  const passwordStrength = getPasswordStrength();

  // 1. Submit Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Vui lòng nhập tên hiển thị.");
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateProfile({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim(),
      });
      toast.success("Đã cập nhật thông tin cá nhân thành công!");
    } catch (err: any) {
      // toast already handled by store
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Submit JLPT Goals
  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingGoals(true);
      await updateProfile({
        profile: {
          targetLevel,
          goal,
          occupation,
          dailyTargetMinutes,
        },
      });
      toast.success(`Đã cập nhật mục tiêu luyện thi ${targetLevel} và kế hoạch học!`);
    } catch (err: any) {
      // toast already handled by store
    } finally {
      setIsSavingGoals(false);
    }
  };

  // 3. Submit Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // toast handled in store
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 p-6 sm:p-7 text-white overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-rose-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/15 hover:bg-black/25 rounded-full transition-all cursor-pointer z-10 hover:rotate-90 active:scale-95"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 w-fit relative z-10 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Trung tâm cài đặt & Quản lý hồ sơ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight relative z-10">
            Quản lý Hồ sơ & Bảo mật
          </h2>
          <p className="text-rose-100/90 text-xs sm:text-sm mt-1 max-w-lg relative z-10 font-medium">
            Tùy biến hồ sơ cá nhân, chọn lộ trình JLPT mục tiêu và bảo vệ tài khoản của bạn.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="p-3 sm:px-6 pt-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl">
            {/* Tab 1: Profile */}
            <button
              onClick={() => setActiveTab("profile")}
              type="button"
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">Hồ sơ cá nhân</span>
            </button>

            {/* Tab 2: Goals */}
            <button
              onClick={() => setActiveTab("goals")}
              type="button"
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "goals"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span className="truncate">Mục tiêu JLPT</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-3xs font-extrabold uppercase">
                {targetLevel}
              </span>
            </button>

            {/* Tab 3: Security */}
            <button
              onClick={() => setActiveTab("security")}
              type="button"
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span className="truncate">Đổi mật khẩu</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: Personal Profile */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="p-5 sm:p-7 space-y-6 max-h-[68vh] overflow-y-auto">
            {/* Avatar Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Ảnh đại diện (Avatar)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {/* Live Preview Ring */}
                <div className="relative group shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 shadow-md">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full rounded-2xl object-cover border-2 border-white dark:border-slate-900"
                        onError={() => {
                          toast.error("Không thể tải hình ảnh từ URL đã cung cấp.");
                          setAvatarUrl("");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-rose-600 dark:bg-slate-900 text-white font-black text-2xl flex items-center justify-center border-2 border-white dark:border-slate-900">
                        {displayName ? displayName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || "J"}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-rose-600 text-white text-3xs font-extrabold rounded-md shadow-xs">
                    {targetLevel}
                  </span>
                </div>

                {/* Preset Avatars & Actions */}
                <div className="space-y-2 flex-1 w-full">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Chọn nhanh Avatar phong cách Nhật Bản hoặc tự nhập liên kết ảnh:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                          avatarUrl === preset.url
                            ? "border-rose-500 ring-2 ring-rose-500/30 scale-105"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-3xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Dùng chữ cái
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-3xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                    >
                      {showCustomAvatarInput ? "Đóng nhập URL" : "Nhập URL ảnh"}
                    </button>
                  </div>

                  {showCustomAvatarInput && (
                    <div className="pt-2 animate-in fade-in duration-150">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Họ và tên hiển thị</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên hiển thị của bạn..."
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-hidden transition-all font-medium"
                />
              </div>

              {/* Username (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tên đăng nhập (Cố định)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ""}
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                />
              </div>

              {/* Email (Readonly with badge) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email tài khoản</span>
                  </span>
                  <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                    ✓ Đã xác thực
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Số điện thoại liên hệ</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-hidden transition-all font-medium"
                />
              </div>
            </div>

            {/* Bio textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giới thiệu bản thân & Lý do học tiếng Nhật</span>
                </label>
                <span className="text-3xs font-semibold text-slate-400">{bio.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ mục tiêu xuất khẩu lao động, du học, đam mê văn hóa Nhật Bản hoặc chuẩn bị phỏng vấn công ty..."
                className="w-full text-sm px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-hidden transition-all font-normal resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:shadow-rose-500/20 active:scale-97 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2 Content: JLPT & Study Goals */}
        {activeTab === "goals" && (
          <form onSubmit={handleSaveGoals} className="p-5 sm:p-7 space-y-6 max-h-[68vh] overflow-y-auto">
            {/* 1. JLPT Level Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trình độ JLPT mục tiêu</span>
                </label>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                  Mục tiêu hiện tại: {targetLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {JLPT_LEVELS.map((item) => {
                  const isSelected = targetLevel === item.level;
                  return (
                    <div
                      key={item.level}
                      onClick={() => setTargetLevel(item.level as any)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 shadow-md ring-2 ring-rose-500/20"
                          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className={`text-3xs font-extrabold px-1.5 py-0.5 rounded-md border ${item.badgeBg}`}>
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-rose-600 text-white"
                              : "border border-slate-300 dark:border-slate-600 text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Primary Speaking Goal */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-rose-500" />
                <span>Mục đích học Kaiwa trọng tâm</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = goal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="text-2xl shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {item.desc}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Occupation & Daily Target Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-rose-500" />
                  <span>Đối tượng học viên</span>
                </label>
                <div className="space-y-1.5">
                  {OCCUPATION_OPTIONS.map((occ) => {
                    const Icon = occ.icon;
                    const isSelected = occupation === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => setOccupation(occ.id as any)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                            : "border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{occ.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Target Minutes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Thời gian học mỗi ngày</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STUDY_TIME_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDailyTargetMinutes(minutes)}
                      className={`py-2 px-1 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                        dailyTargetMinutes === minutes
                          ? "border-rose-500 bg-rose-600 text-white shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {minutes} phút
                    </button>
                  ))}
                </div>
                <p className="text-3xs text-slate-500 dark:text-slate-400 pt-1 italic font-medium">
                  💡 Luyện tập đều đặn 15 phút mỗi ngày duy trì chuỗi Streak và phản xạ não bộ tốt nhất.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSavingGoals}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:shadow-rose-500/20 active:scale-97 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSavingGoals ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu mục tiêu JLPT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3 Content: Security & Change Password */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword} className="p-5 sm:p-7 space-y-6 max-h-[68vh] overflow-y-auto">
            {/* Security Tip Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Bảo mật tài khoản JTalk
                </h4>
                <p className="text-2xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed font-medium">
                  Mật khẩu được mã hóa an toàn bằng thuật toán bcrypt. Hãy đặt mật khẩu từ 6 ký tự trở lên kèm chữ hoa hoặc số để tăng độ an toàn.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mật khẩu hiện tại</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu bạn đang dùng..."
                    className="w-full text-sm px-4 py-2.5 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-hidden transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mật khẩu mới</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full text-sm px-4 py-2.5 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 outline-hidden transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-3xs font-bold">
                      <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                      <span className="text-slate-700 dark:text-slate-300">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400" />
                    <span>Xác nhận mật khẩu mới</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  {confirmPassword && (
                    <span
                      className={`text-3xs font-extrabold ${
                        newPassword === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      }`}
                    >
                      {newPassword === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Chưa khớp"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className={`w-full text-sm px-4 py-2.5 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border outline-hidden transition-all font-medium ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200/80 dark:border-slate-700 focus:border-rose-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:shadow-rose-500/20 active:scale-97 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Đổi mật khẩu ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
