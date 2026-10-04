import {
  Home,
  Mic,
  GraduationCap,
  ChartNoAxesColumn,
  User,
  Sparkles,
  BookMarked,
} from "lucide-react";

export const sidebarItems = [
  {
    icon: Home,
    text: "Trang chủ",
    to: "/dashboard",
  },
  {
    icon: GraduationCap,
    text: "Khóa học",
    to: "/courses",
  },
  {
    icon: Mic,
    text: "Luyện nói AI",
    to: "/speaking",
  },
  {
    icon: BookMarked,
    text: "Sổ tay Từ vựng",
    to: "/vocabulary",
  },
  {
    icon: ChartNoAxesColumn,
    text: "Tiến trình & Thống kê",
    to: "/progress",
  },
  {
    icon: User,
    text: "Trang cá nhân",
    to: "/profile",
  },
  {
    icon: Sparkles,
    text: "Gói Premium",
    to: "/checkout",
    highlight: true,
  },
];
