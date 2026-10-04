"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
  Flame,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { speakJapanese } from "@/utils/speechUtils";
import { useVocabularyStore } from "@/stores/useVocabularyStore";
import type { VocabularyItem } from "@/types";

interface FlashcardPlayerProps {
  cards: VocabularyItem[];
  onClose?: () => void;
}

export const FlashcardPlayer = ({ cards, onClose }: FlashcardPlayerProps) => {
  const { toggleMastered, markAsMastered } = useVocabularyStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [deck, setDeck] = useState<VocabularyItem[]>(cards);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync deck when incoming cards change
  useEffect(() => {
    setDeck(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const currentCard = deck[currentIndex];

  // Pronounce current card
  const handleSpeak = useCallback(
    async (text?: string) => {
      if (!currentCard) return;
      const targetText = text || currentCard.kanji || currentCard.word;
      try {
        setIsSpeaking(true);
        await speakJapanese(targetText);
      } finally {
        setIsSpeaking(false);
      }
    },
    [currentCard]
  );

  // Auto speak on card change if enabled
  useEffect(() => {
    if (autoSpeak && currentCard && !isFlipped) {
      handleSpeak();
    }
  }, [currentIndex, autoSpeak, currentCard]);

  // Flip toggle
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Next Card
  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Loop or stay
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [currentIndex, deck.length]);

  // Previous Card
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        handleSpeak();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleSpeak]);

  if (!currentCard || deck.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
          Chưa có thẻ từ vựng nào trong danh sách ôn tập.
        </p>
        <p className="text-xs text-slate-400">
          Hãy chọn các từ vựng từ bài học hoặc thêm từ mới vào Sổ tay nhé!
        </p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);
  const isMastered = currentCard.isMastered;

  const levelColorMap: Record<string, string> = {
    N5: "bg-emerald-500 text-white",
    N4: "bg-blue-500 text-white",
    N3: "bg-rose-500 text-white",
    N2: "bg-purple-500 text-white",
    N1: "bg-amber-500 text-white",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto select-none font-sans">
      {/* 1. Header Navigation & Controls */}
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            Thẻ {currentIndex + 1} / {deck.length}
          </span>
          <button
            onClick={() => setShowFurigana((prev) => !prev)}
            type="button"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              showFurigana
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
            }`}
            title={showFurigana ? "Ẩn cách đọc Furigana" : "Hiện Furigana"}
          >
            {showFurigana ? <Eye size={13} /> : <EyeOff size={13} />}
            <span className="hidden sm:inline">Furigana</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSpeak((prev) => !prev)}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              autoSpeak
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
            }`}
            title="Tự động phát âm giọng bản xứ khi chuyển thẻ"
          >
            <Volume2 size={13} className={autoSpeak ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">Tự phát âm</span>
          </button>

          <button
            onClick={handleShuffle}
            type="button"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Xáo trộn ngẫu nhiên thứ tự thẻ"
          >
            <Shuffle size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Interactive 3D Flip Card Container */}
      <div
        className="w-full min-h-[380px] sm:min-h-[420px] cursor-pointer [perspective:1200px]"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-xl hover:shadow-2xl ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ============================================================== */}
          {/* FRONT SIDE (Kanji / Japanese Word) */}
          {/* ============================================================== */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 flex flex-col justify-between [backface-visibility:hidden] overflow-hidden">
            {/* Ambient Background Gradient Glow */}
            <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />

            {/* Front Top Bar */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span
                  className={`text-2xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    levelColorMap[currentCard.level || "N5"] || "bg-rose-500 text-white"
                  }`}
                >
                  {currentCard.level || "N5"}
                </span>
                <span className="text-2xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {currentCard.wordType || "Từ vựng"}
                </span>
              </div>

              {isMastered ? (
                <span className="inline-flex items-center gap-1 text-2xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <Check size={12} className="stroke-[3]" />
                  <span>Đã thuộc</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <Flame size={12} />
                  <span>Cần ôn</span>
                </span>
              )}
            </div>

            {/* Front Center: Kanji, Furigana & Audio button */}
            <div className="my-auto text-center space-y-3 relative z-10 py-6">
              {/* Furigana Reading */}
              <div className="h-6 flex items-center justify-center">
                {showFurigana && currentCard.furigana ? (
                  <span className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400 tracking-widest font-sans animate-in fade-in duration-150">
                    {currentCard.furigana}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 dark:text-slate-700 italic">
                    (Nhấn toggle mắt để xem Furigana)
                  </span>
                )}
              </div>

              {/* Main Kanji / Word */}
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-wide font-sans py-1">
                {currentCard.kanji || currentCard.word}
              </h2>

              {/* Romaji */}
              {currentCard.romaji && (
                <p className="text-xs sm:text-sm font-semibold text-slate-400 font-mono tracking-wider">
                  [{currentCard.romaji}]
                </p>
              )}

              {/* Pronounce Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak();
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isSpeaking
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800"
                  }`}
                  title="Phát âm tiếng Nhật chuẩn Tokyo"
                >
                  <Volume2 size={15} />
                  <span>Nghe phát âm</span>
                </button>
              </div>
            </div>

            {/* Front Bottom Bar: Flip Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
              <span className="text-3xs font-medium hidden sm:inline">Phím Space: Lật thẻ • S: Phát âm</span>
              <span className="text-3xs font-black text-rose-600 dark:text-rose-400 ml-auto flex items-center gap-1 group">
                <RotateCcw size={12} />
                <span>Nhấn để lật xem nghĩa tiếng Việt →</span>
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BACK SIDE (Vietnamese Meaning & Examples) */}
          {/* ============================================================== */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 border-2 border-rose-500/40 dark:border-rose-800/60 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-gradient-to-tl from-rose-500/10 via-amber-500/10 to-transparent rounded-tl-full pointer-events-none" />

            {/* Back Top Bar: Kanji Reminder */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-800 dark:text-slate-200">
                  {currentCard.kanji || currentCard.word}
                </span>
                {currentCard.furigana && (
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                    ({currentCard.furigana})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                className="p-1.5 rounded-full text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Nghe lại từ này"
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Back Center: Meaning & Example Sentence */}
            <div className="my-auto space-y-4 relative z-10 py-3">
              <div>
                <span className="text-3xs uppercase tracking-widest font-extrabold text-slate-400 block mb-1">
                  Nghĩa tiếng Việt:
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-tight">
                  {currentCard.meaning}
                </h3>
              </div>

              {/* Example Sentence Box */}
              {currentCard.exampleSentence && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>Câu ví dụ thực tế:</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(currentCard.exampleSentence);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Nghe phát âm câu ví dụ"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleMeaning && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      "{currentCard.exampleMeaning}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Back Assessment Bar: 3 Recall Buttons */}
            <div className="space-y-2 relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block text-center">
                Đánh giá mức độ ghi nhớ:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Chưa nhớ */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard.id) markAsMastered(currentCard.id, false);
                    handleNext();
                  }}
                  className="py-2.5 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <XCircle size={14} />
                  <span>Chưa nhớ</span>
                </button>

                {/* 2. Tạm nhớ */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="py-2.5 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <HelpCircle size={14} />
                  <span>Tạm nhớ</span>
                </button>

                {/* 3. Đã thuộc */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard.id) markAsMastered(currentCard.id, true);
                    handleNext();
                  }}
                  className="py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={14} />
                  <span>Đã thuộc!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Navigation Controls */}
      <div className="flex items-center justify-between gap-4 px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          type="button"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronLeft size={16} />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={handleFlip}
          type="button"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs shadow-md hover:scale-102 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw size={15} />
          <span>{isFlipped ? "Lật xem Kanji" : "Lật xem nghĩa"}</span>
        </button>

        <button
          onClick={handleNext}
          type="button"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md hover:shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
        >
          <span>Thẻ tiếp theo</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardPlayer;
