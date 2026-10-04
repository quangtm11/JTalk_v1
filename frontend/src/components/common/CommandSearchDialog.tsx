"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "@/lib/react-router-compat";
import {
  Search,
  X,
  GraduationCap,
  Mic,
  BookMarked,
  Compass,
  ArrowRight,
  Volume2,
  Lock,
  Sparkles,
  Command,
  CornerDownLeft,
  Flame,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useVocabularyStore } from "@/stores/useVocabularyStore";
import { speakJapanese } from "@/utils/speechUtils";
import { useAuth } from "@/hooks/useAuth";

export type SearchCategory = "all" | "lessons" | "speaking" | "vocabulary" | "navigation";

export interface SearchResultItem {
  id: string;
  category: "lessons" | "speaking" | "vocabulary" | "navigation";
  title: string;
  subtitle?: string;
  japaneseTitle?: string;
  badge?: string;
  badgeColor?: string;
  isPremium?: boolean;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  url: string;
  audioText?: string;
  keywords?: string[];
}

interface CommandSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileTab?: (tab: "profile" | "goals" | "security") => void;
}

// Normalize Vietnamese & English for fuzzy searching without accents
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
};

export const CommandSearchDialog: React.FC<CommandSearchDialogProps> = ({
  isOpen,
  onClose,
  onOpenProfileTab,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { words: vocabularyWords } = useVocabularyStore();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect OS for shortcut display
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ""));
    }
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on dialog open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setActiveCategory("all");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Static indexed data: Courses, Video Lessons, Speaking Scenarios, Navigation
  const indexedData = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [
      // 1. COURSES & VIDEO LESSONS
      {
        id: "c-minna-n5",
        category: "lessons",
        title: "Minna no Nihongo I – N5 (Sơ cấp 1)",
        subtitle: "25 bài đầy đủ Từ vựng, Ngữ pháp, Hội thoại & Hán tự",
        japaneseTitle: "みんなの日本語 初級I",
        badge: "Khóa học",
        level: "N5",
        url: "/courses/c-minna-n5",
        keywords: ["minna", "nihongo", "so cap", "tieng nhat can ban", "n5"],
      },
      {
        id: "c-pm-interview",
        category: "lessons",
        title: "Near-line PM interview",
        subtitle: "Luyện phỏng vấn và trao đổi yêu cầu dự án PM / Team Leader",
        japaneseTitle: "PM面接・プロジェクト管理",
        badge: "Khóa học",
        level: "N5",
        url: "/courses/c-pm-interview",
        keywords: ["pm", "project manager", "quan ly du an", "phong van it"],
      },
      {
        id: "c-ba-brse",
        category: "lessons",
        title: "BA / BRSE Interview & Kaiwa",
        subtitle: "Luyện đối đáp giao tiếp kỹ thuật cho Kỹ sư cầu nối & BA",
        japaneseTitle: "ブリッジSE・ビジネスアナリスト面接",
        badge: "Khóa học",
        isPremium: true,
        level: "N5",
        url: "/courses/c-ba-brse",
        keywords: ["brse", "ba", "ky su cau noi", "business analyst", "it kaiwa"],
      },
      {
        id: "c-it-comtor",
        category: "lessons",
        title: "IT COMTOR Interview",
        subtitle: "Khóa luyện phỏng vấn nghiệp vụ Thông dịch viên CNTT",
        japaneseTitle: "ITコミュニケーター・通訳面接",
        badge: "Khóa học",
        isPremium: true,
        level: "N4",
        url: "/courses/c-it-comtor",
        keywords: ["comtor", "thong dich vien", "it comtor", "it n4"],
      },
      {
        id: "lesson-keigo",
        category: "lessons",
        title: "敬語って何？ - Khái niệm Kính ngữ & 3 phân loại chính",
        subtitle: "Sonkeigo, Kenjougo & Teineigo cùng Sensei Yuki",
        japaneseTitle: "敬語の基本・尊敬語・謙譲語・丁寧語",
        badge: "Video Shadowing",
        level: "N4",
        url: "/learn/lesson-keigo",
        keywords: ["keigo", "kinh ngu", "sonkeigo", "kenjougo", "teineigo", "yuki", "shadowing"],
      },
      {
        id: "lesson-baito",
        category: "lessons",
        title: "アルバイトの面接 - Phỏng vấn xin việc thêm tại Combini",
        subtitle: "Hỏi đáp lịch làm việc, giới thiệu bản thân với Sensei Kenji",
        japaneseTitle: "コンビニ・飲食店バイト面接",
        badge: "Video Shadowing",
        level: "N5",
        url: "/learn/lesson-baito",
        keywords: ["baito", "lam them", "combini", "phong van", "kenji", "part time"],
      },
      {
        id: "lesson-shinjuku",
        category: "lessons",
        title: "新宿駅で乗り換え - Hỏi đường & Chuyển tàu điện Shinjuku",
        subtitle: "Hỏi tuyến tàu Yamanote, nạp vé Suica tại ga Shinjuku",
        japaneseTitle: "新宿駅・電車の乗り換えと道案内",
        badge: "Video Shadowing",
        level: "N5",
        url: "/learn/lesson-shinjuku",
        keywords: ["shinjuku", "tau dien", "hoi duong", "densha", "suica", "yamanote"],
      },

      // 2. SPEAKING SCENARIOS
      {
        id: "sc-1",
        category: "speaking",
        title: "Tự giới thiệu trong lớp học mới",
        subtitle: "Luyện phản xạ chào hỏi, chia sẻ sở thích với bạn bè",
        japaneseTitle: "新しいクラスでの自己紹介",
        badge: "AI Speaking",
        level: "N5",
        url: "/practice/sc-1",
        keywords: ["tu gioi thieu", "jikoshoukai", "lop hoc", "ket ban"],
      },
      {
        id: "sc-2",
        category: "speaking",
        title: "Cuộc sống và thói quen hàng ngày",
        subtitle: "Kể về các hoạt động thường nhật từ sáng đến tối",
        japaneseTitle: "毎日の生活について",
        badge: "AI Speaking",
        level: "N5",
        url: "/practice/sc-2",
        keywords: ["thoi quen", "cuoc song hang ngay", "nichijou", "lich trinh"],
      },
      {
        id: "sc-3",
        category: "speaking",
        title: "Khám bệnh tại phòng khám Nhật",
        subtitle: "Miêu tả triệu chứng đau đầu, sốt và nghe lời khuyên bác sĩ",
        japaneseTitle: "病院で診察を受ける",
        badge: "AI Speaking",
        isPremium: true,
        level: "N4",
        url: "/practice/sc-3",
        keywords: ["kham benh", "benh vien", "byouin", "sot", "dau dau"],
      },
      {
        id: "sc-4",
        category: "speaking",
        title: "Gọi đồ uống tại quán Cafe",
        subtitle: "Hỏi menu thức uống, chọn size đá/nóng và thanh toán",
        japaneseTitle: "カフェで飲み物を注文する",
        badge: "AI Speaking",
        level: "N4",
        url: "/practice/sc-4",
        keywords: ["cafe", "ca phe", "goi mon", "order", "thanh toan"],
      },
      {
        id: "sc-5",
        category: "speaking",
        title: "Hỏi đường và đi tàu điện Shinjuku",
        subtitle: "Hỏi quầy vé, line Yamanote và tìm cửa ra phía Đông",
        japaneseTitle: "駅で道を尋ねる・乗換案内",
        badge: "AI Speaking",
        level: "N5",
        url: "/practice/sc-5",
        keywords: ["hoi duong", "ga tau", "shinjuku", "yamanote"],
      },
      {
        id: "sc-6",
        category: "speaking",
        title: "Phỏng vấn xin việc (Jikoshoukai)",
        subtitle: "Lễ nghi chào hỏi, giải thích lý do ứng tuyển & thế mạnh",
        japaneseTitle: "採用面接・志望動機",
        badge: "AI Speaking",
        isPremium: true,
        level: "N4",
        url: "/practice/sc-6",
        keywords: ["phong van xin viec", "mensetsu", "di lam", "shibou douki"],
      },
      {
        id: "sc-7",
        category: "speaking",
        title: "Báo cáo công việc HORENSO",
        subtitle: "Kính ngữ doanh nghiệp, báo cáo tiến độ dự án cho Sếp",
        japaneseTitle: "ビジネス会話・進捗報告 (報連相)",
        badge: "AI Speaking",
        isPremium: true,
        level: "N3",
        url: "/practice/sc-7",
        keywords: ["horenso", "bao cao", "cong so", "kinh doanh", "sep", "n3"],
      },
      {
        id: "sc-8",
        category: "speaking",
        title: "Rủ bạn đi ăn tại quán Izakaya",
        subtitle: "Rủ đồng nghiệp ăn tối sau giờ làm, nâng ly Kanpai",
        japaneseTitle: "居酒屋で乾杯・食事の誘い",
        badge: "AI Speaking",
        isPremium: true,
        level: "N3",
        url: "/practice/sc-8",
        keywords: ["izakaya", "an nhau", "kanpai", "ru an", "dong nghiep"],
      },

      // 3. NAVIGATION & SYSTEM PAGES
      {
        id: "nav-dashboard",
        category: "navigation",
        title: "Trang chủ & Lộ trình học (Dashboard)",
        subtitle: "Xem tiến độ học tập, chuỗi streak và bài tập gợi ý",
        badge: "Trang chính",
        url: "/dashboard",
        keywords: ["trang chu", "dashboard", "home", "lo trinh"],
      },
      {
        id: "nav-courses",
        category: "navigation",
        title: "Danh sách Khóa học (Courses)",
        subtitle: "Toàn bộ giáo trình sơ cấp, trung cấp & phỏng vấn CNTT",
        badge: "Trang chính",
        url: "/courses",
        keywords: ["khoa hoc", "courses", "giao trinh", "bai hoc"],
      },
      {
        id: "nav-speaking",
        category: "navigation",
        title: "Phòng Luyện nói AI (AI Speaking)",
        subtitle: "Luyện phản xạ giao tiếp 1-1 với gia sư AI thông minh",
        badge: "Trang chính",
        url: "/speaking",
        keywords: ["luyen noi ai", "speaking", "kaiwa", "phan xa", "giao tiep"],
      },
      {
        id: "nav-vocab",
        category: "navigation",
        title: "Sổ tay Từ vựng & Thẻ Flashcard",
        subtitle: "Ôn tập Kanji, nghĩa tiếng Việt và lật thẻ Flashcard 3D",
        badge: "Trang chính",
        url: "/vocabulary",
        keywords: ["so tay tu vung", "flashcard", "tu vung", "kanji", "on tap"],
      },
      {
        id: "nav-leaderboard",
        category: "navigation",
        title: "Bảng xếp hạng thi đua (Leaderboard)",
        subtitle: "Xem top học viên chăm chỉ và điểm thưởng XP tích lũy",
        badge: "Thi đua",
        url: "/speaking?tab=leaderboard",
        keywords: ["bang xep hang", "leaderboard", "top hoc vien", "xp"],
      },
      {
        id: "nav-progress",
        category: "navigation",
        title: "Tiến trình & Thống kê học tập",
        subtitle: "Biểu đồ giờ học, điểm phát âm và từ vựng tích lũy",
        badge: "Thống kê",
        url: "/progress",
        keywords: ["tien trinh", "thong ke", "progress", "bieu do", "diem phat am"],
      },
      {
        id: "nav-profile",
        category: "navigation",
        title: "Hồ sơ cá nhân (My Profile)",
        subtitle: "Cập nhật tên, ảnh đại diện, nghề nghiệp & tiểu sử",
        badge: "Tài khoản",
        url: "/profile",
        keywords: ["ho so", "profile", "thong tin ca nhan", "avatar"],
      },
      {
        id: "nav-goals",
        category: "navigation",
        title: "Mục tiêu JLPT & Thời gian học mỗi ngày",
        subtitle: "Thiết lập mục tiêu N5-N1 và cam kết thời gian luyện tập",
        badge: "Mục tiêu",
        url: "/profile?tab=goals",
        keywords: ["muc tieu jlpt", "target level", "thoi gian hoc", "n5", "n4", "n3", "n2", "n1"],
      },
      {
        id: "nav-security",
        category: "navigation",
        title: "Đổi mật khẩu & Bảo mật tài khoản",
        subtitle: "Cập nhật mật khẩu mới bảo mật với xác thực an toàn",
        badge: "Bảo mật",
        url: "/profile?tab=security",
        keywords: ["doi mat khau", "bao mat", "security", "password", "mat khau"],
      },
      {
        id: "nav-premium",
        category: "navigation",
        title: "Nâng cấp Gói VIP Premium",
        subtitle: "Mở khóa toàn bộ kịch bản AI, video bài giảng & phân tích chuyên sâu",
        badge: "VIP",
        badgeColor: "rose",
        url: "/checkout",
        keywords: ["premium", "vip", "nang cap", "thanh toan", "momo", "gia han"],
      },
    ];

    // Add Admin Portal if user is admin
    if (user?.role === "admin") {
      items.push({
        id: "nav-admin",
        category: "navigation",
        title: "Cổng Quản trị viên (Admin Portal)",
        subtitle: "Quản lý khóa học, người dùng và dữ liệu hệ thống",
        badge: "Admin",
        badgeColor: "purple",
        url: "/admin",
        keywords: ["admin", "quan tri", "he thong", "admin portal"],
      });
    }

    return items;
  }, [user]);

  // Convert vocabulary items into SearchResultItem
  const vocabSearchItems = useMemo<SearchResultItem[]>(() => {
    return (vocabularyWords || []).map((w) => ({
      id: `vocab-${w.id}`,
      category: "vocabulary",
      title: `${w.word} ${w.kanji && w.kanji !== w.word ? `(${w.kanji})` : ""}`,
      japaneseTitle: w.furigana || w.romaji,
      subtitle: `${w.meaning}${w.wordType ? ` • ${w.wordType}` : ""}`,
      badge: w.isMastered ? "Đã thuộc" : "Đang học",
      level: w.level,
      url: `/vocabulary?q=${encodeURIComponent(w.word)}`,
      audioText: w.kanji || w.word,
      keywords: [
        w.word,
        w.kanji || "",
        w.furigana || "",
        w.romaji || "",
        w.meaning,
        w.wordType || "",
      ],
    }));
  }, [vocabularyWords]);

  // Combined searchable items
  const allItems = useMemo(() => {
    return [...indexedData, ...vocabSearchItems];
  }, [indexedData, vocabSearchItems]);

  // Filtered results based on activeCategory and search query
  const filteredResults = useMemo(() => {
    const normQuery = normalizeText(query);

    let list = allItems;
    if (activeCategory !== "all") {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (!normQuery) {
      // Empty query: Show curated recommendations
      return list.slice(0, 10);
    }

    return list
      .filter((item) => {
        const titleNorm = normalizeText(item.title);
        const subNorm = normalizeText(item.subtitle || "");
        const jpNorm = (item.japaneseTitle || "").toLowerCase();
        const kwNorm = (item.keywords || []).map(normalizeText).join(" ");
        const levelNorm = (item.level || "").toLowerCase();

        return (
          titleNorm.includes(normQuery) ||
          subNorm.includes(normQuery) ||
          jpNorm.includes(normQuery) ||
          kwNorm.includes(normQuery) ||
          levelNorm.includes(normQuery)
        );
      })
      .slice(0, 16);
  }, [allItems, activeCategory, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length, activeCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation inside search list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredResults.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();

    // Check if it's profile tab navigation
    if (item.url.startsWith("/profile?tab=")) {
      const tab = item.url.replace("/profile?tab=", "") as "profile" | "goals" | "security";
      if (onOpenProfileTab) {
        onOpenProfileTab(tab);
        return;
      }
    }

    navigate(item.url);
  };

  const handlePronounce = (e: React.MouseEvent, text?: string) => {
    e.stopPropagation();
    if (text) {
      speakJapanese(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50">
          <Search size={20} className="text-slate-400 dark:text-slate-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài học, ngữ pháp, kịch bản hội thoại, từ vựng hoặc điều hướng..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-3xs font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#0f172a] scrollbar-none text-xs">
          {[
            { id: "all", label: "Tất cả", icon: Sparkles },
            { id: "lessons", label: "Bài giảng & Khóa học", icon: GraduationCap },
            { id: "speaking", label: "Kịch bản hội thoại", icon: Mic },
            { id: "vocabulary", label: "Từ vựng Flashcard", icon: BookMarked },
            { id: "navigation", label: "Điều hướng nhanh", icon: Compass },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as SearchCategory)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-rose-500 text-white shadow-xs font-semibold"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/60 dark:divide-slate-800/40"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Hãy thử tìm kiếm với từ khóa khác như &quot;Minna&quot;, &quot;Kính ngữ&quot;, &quot;Phỏng vấn&quot;, &quot;N5&quot; hoặc tên từ vựng tiếng Nhật.
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              let CategoryIcon = Compass;
              if (item.category === "lessons") CategoryIcon = GraduationCap;
              if (item.category === "speaking") CategoryIcon = Mic;
              if (item.category === "vocabulary") CategoryIcon = BookMarked;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelectItem(item)}
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-1 ring-rose-300/80 dark:ring-rose-800/60"
                      : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-rose-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      }`}
                    >
                      <CategoryIcon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {item.title}
                        </span>

                        {item.level && (
                          <span className="px-1.5 py-0.5 text-3xs font-extrabold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.level}
                          </span>
                        )}

                        {item.isPremium && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-3xs font-bold rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Sparkles size={10} />
                            VIP
                          </span>
                        )}

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-3xs font-semibold rounded ${
                              item.badgeColor === "rose"
                                ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
                                : item.badgeColor === "purple"
                                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {item.japaneseTitle && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium truncate mt-0.5 font-sans">
                          {item.japaneseTitle}
                        </p>
                      )}

                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action: Audio pronunciation for vocab, or Arrow enter */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.audioText && (
                      <button
                        onClick={(e) => handlePronounce(e, item.audioText)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition-colors"
                        title="Nghe phát âm chuẩn giọng Tokyo"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}

                    <div
                      className={`hidden sm:flex items-center gap-1 text-3xs font-medium px-2 py-1 rounded-md transition-all ${
                        isSelected
                          ? "bg-rose-200/80 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200"
                          : "text-slate-400 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span>Mở</span>
                      <CornerDownLeft size={11} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with Keyboard Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-3xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                ↓
              </kbd>
              <span>Di chuyển</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                ↵
              </kbd>
              <span>Chọn</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                ESC
              </kbd>
              <span>Đóng</span>
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 font-medium">
            <span>Phím tắt:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
              {isMac ? "⌘ + K" : "Ctrl + K"}
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandSearchDialog;
