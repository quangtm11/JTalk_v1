import VocabularyPage from "@/views/VocabularyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sổ tay Từ vựng & Flashcard - JTalk AI",
  description: "Ôn tập từ vựng tiếng Nhật bằng Flashcard 2 mặt và phát âm chuẩn Tokyo.",
};

export default function Page() {
  return <VocabularyPage />;
}
