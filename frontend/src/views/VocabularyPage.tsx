"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/react-router-compat";
import {
  BookMarked,
  Layers,
  Search,
  Plus,
  Volume2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  GraduationCap,
  Flame,
  Award,
} from "lucide-react";
import { useVocabularyStore } from "@/stores/useVocabularyStore";
import { useAuth } from "@/hooks/useAuth";
import { speakJapanese } from "@/utils/speechUtils";
import { FlashcardPlayer } from "@/components/vocabulary/FlashcardPlayer";
import { AddWordModal } from "@/components/vocabulary/AddWordModal";
import type { VocabularyItem } from "@/types";

export const VocabularyPage = () => {
  const { user } = useAuth();
  const { words, toggleMastered, removeWord, resetToDefaults } = useVocabularyStore();

  const [viewMode, setViewMode] = useState<"list" | "flashcard">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "learning" | "mastered">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  const targetLevel = user?.profile?.targetLevel || "N5";

  // Filtered words
  const filteredWords = useMemo(() => {
    return words.filter((item) => {
      // 1. Level filter
      if (selectedLevel !== "all" && item.level !== selectedLevel) {
        return false;
      }

      // 2. Status filter
      if (selectedStatus === "mastered" && !item.isMastered) return false;
      if (selectedStatus === "learning" && item.isMastered) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchWord = item.word.toLowerCase().includes(query);
        const matchKanji = item.kanji ? item.kanji.toLowerCase().includes(query) : false;
        const matchMeaning = item.meaning.toLowerCase().includes(query);
        const matchFurigana = item.furigana ? item.furigana.toLowerCase().includes(query) : false;
        const matchRomaji = item.romaji ? item.romaji.toLowerCase().includes(query) : false;

        return matchWord || matchKanji || matchMeaning || matchFurigana || matchRomaji;
      }

      return true;
    });
  }, [words, selectedLevel, selectedStatus, searchQuery]);

  // Stats calculation
  const totalCount = words.length;
  const masteredCount = words.filter((w) => w.isMastered).length;
  const learningCount = totalCount - masteredCount;
  const masteredPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Speak word audio
  const handlePronounce = async (id: string, text: string) => {
    try {
      setPlayingWordId(id);
      await speakJapanese(text);
    } finally {
      setPlayingWordId(null);
    }
  };

  const levelColorMap: Record<string, string> = {
    N5: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    N4: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    N3: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    N2: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    N1: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 1. Header Bento Hero Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full text-xs font-bold uppercase tracking-wider">
                <BookMarked size={14} className="text-rose-600 dark:text-rose-400" />
                <span>Sổ tay Từ vựng & Flashcard ôn tập</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Kho Từ Vựng Tiếng Nhật
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Tự động lưu trữ từ vựng gặp trong bài học video & hội thoại Kaiwa. Luyện phản xạ nhanh với thẻ Flashcard 3D hai mặt kèm phát âm chuẩn Tokyo!
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setViewMode(viewMode === "list" ? "flashcard" : "list")}
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 ${
                  viewMode === "flashcard"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white hover:brightness-105 shadow-rose-500/20"
                }`}
              >
                <Layers size={16} />
                <span>{viewMode === "flashcard" ? "Xem dạng danh sách" : "Bắt đầu ôn Flashcard"}</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Plus size={16} className="text-rose-500" />
                <span>Thêm từ mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Stats Counters Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Words */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-1 hover:border-rose-400 transition-colors">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider">
              <BookMarked size={16} />
              <span>Tổng số từ</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </div>
            <p className="text-2xs font-bold text-slate-400">Đã lưu trong sổ tay</p>
          </div>

          {/* Mastered Words */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-1 hover:border-emerald-400 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={16} />
              <span>Đã thuộc lòng</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredCount}
            </div>
            <p className="text-2xs font-bold text-slate-400">Tỷ lệ {masteredPercent}%</p>
          </div>

          {/* Learning Words */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-1 hover:border-amber-400 transition-colors">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider">
              <Flame size={16} />
              <span>Cần ôn tập</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {learningCount}
            </div>
            <p className="text-2xs font-bold text-slate-400">Sẵn sàng luyện Flashcard</p>
          </div>

          {/* JLPT Goal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-1 hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-2 text-blue-500 text-xs font-black uppercase tracking-wider">
              <GraduationCap size={16} />
              <span>Mục tiêu JLPT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
              {targetLevel}
            </div>
            <p className="text-2xs font-bold text-slate-400">Lộ trình học viên</p>
          </div>
        </div>

        {/* 3. Main Content: Flashcard Mode OR Notebook List Mode */}
        {viewMode === "flashcard" ? (
          /* ============================================================== */
          /* FLASHCARD INTERACTIVE 3D REVIEW MODE */
          /* ============================================================== */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Phòng Luyện Flashcard Phản Xạ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lật thẻ 2 mặt, phát âm và tự đánh giá mức độ ghi nhớ
                </p>
              </div>

              <button
                onClick={() => setViewMode("list")}
                type="button"
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
              >
                ← Quay lại danh sách
              </button>
            </div>

            <FlashcardPlayer cards={filteredWords.length > 0 ? filteredWords : words} />
          </div>
        ) : (
          /* ============================================================== */
          /* VOCABULARY NOTEBOOK LIST MODE */
          /* ============================================================== */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Kanji, Furigana, Romaji hoặc nghĩa tiếng Việt..."
                  className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level selector */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-hidden"
                >
                  <option value="all">Tất cả cấp độ</option>
                  <option value="N5">JLPT N5</option>
                  <option value="N4">JLPT N4</option>
                  <option value="N3">JLPT N3</option>
                  <option value="N2">JLPT N2</option>
                  <option value="N1">JLPT N1</option>
                </select>

                {/* Status selector */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-hidden"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="learning">Cần ôn tập</option>
                  <option value="mastered">Đã thuộc lòng</option>
                </select>

                {/* Reset defaults button */}
                <button
                  onClick={resetToDefaults}
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Khôi phục danh sách mẫu ban đầu"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Vocabulary Grid / List */}
            {filteredWords.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <BookMarked size={36} className="text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Không tìm thấy từ vựng phù hợp
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy thử tìm kiếm với từ khóa khác hoặc thêm từ vựng mới vào sổ tay của bạn.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Thêm từ vựng ngay</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWords.map((item) => {
                  const isPlaying = playingWordId === item.id;
                  const isMastered = item.isMastered;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                    >
                      {/* Top Bar: Badges & Controls */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-3xs font-extrabold px-2 py-0.5 rounded-md border ${
                              levelColorMap[item.level || "N5"] || "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {item.level || "N5"}
                          </span>
                          <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.wordType || "Từ vựng"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Mastered */}
                          <button
                            onClick={() => item.id && toggleMastered(item.id)}
                            type="button"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isMastered
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                            title={isMastered ? "Đã thuộc (Nhấn để chuyển sang Cần ôn)" : "Đánh dấu là đã thuộc"}
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => item.id && removeWord(item.id)}
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa từ khỏi sổ tay"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Main Word, Pronunciation & Meaning */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {item.kanji || item.word}
                          </h4>
                          {item.furigana && (
                            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                              ({item.furigana})
                            </span>
                          )}
                          {item.romaji && (
                            <span className="text-3xs font-mono text-slate-400">[{item.romaji}]</span>
                          )}
                          <button
                            onClick={() => handlePronounce(item.id || "", item.kanji || item.word)}
                            type="button"
                            className={`p-1.5 rounded-full transition-all cursor-pointer ${
                              isPlaying
                                ? "bg-rose-600 text-white animate-pulse"
                                : "text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60"
                            }`}
                            title="Nghe phát âm chuẩn giọng Nhật"
                          >
                            <Volume2 size={15} />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {item.meaning}
                        </p>
                      </div>

                      {/* Example sentence */}
                      {item.exampleSentence && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-0.5">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-sans">
                            {item.exampleSentence}
                          </p>
                          {item.exampleMeaning && (
                            <p className="text-3xs text-slate-400 dark:text-slate-500 italic">
                              "{item.exampleMeaning}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Word Modal */}
      <AddWordModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default VocabularyPage;
