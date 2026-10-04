"use client";

import { useState } from "react";
import { X, Plus, Sparkles, BookOpen, Save, Loader2 } from "lucide-react";
import { useVocabularyStore } from "@/stores/useVocabularyStore";
import { toast } from "sonner";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWordModal = ({ isOpen, onClose }: AddWordModalProps) => {
  const { addCustomWord } = useVocabularyStore();

  const [word, setWord] = useState("");
  const [furigana, setFurigana] = useState("");
  const [romaji, setRomaji] = useState("");
  const [meaning, setMeaning] = useState("");
  const [wordType, setWordType] = useState("Danh từ");
  const [level, setLevel] = useState<"N5" | "N4" | "N3" | "N2" | "N1">("N5");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleMeaning, setExampleMeaning] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!word.trim()) {
      toast.error("Vui lòng nhập từ Kanji hoặc Hiragana.");
      return;
    }

    if (!meaning.trim()) {
      toast.error("Vui lòng nhập nghĩa tiếng Việt.");
      return;
    }

    addCustomWord({
      word: word.trim(),
      kanji: word.trim(),
      furigana: furigana.trim(),
      romaji: romaji.trim(),
      meaning: meaning.trim(),
      wordType,
      level,
      exampleSentence: exampleSentence.trim(),
      exampleMeaning: exampleMeaning.trim(),
    });

    // Reset fields
    setWord("");
    setFurigana("");
    setRomaji("");
    setMeaning("");
    setExampleSentence("");
    setExampleMeaning("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 p-6 text-white overflow-hidden">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/15 hover:bg-black/25 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-amber-300" />
            <span>Thêm từ vựng mới</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">Lưu vào Sổ tay từ vựng</h3>
          <p className="text-xs text-rose-100/90 mt-1">
            Ghi chép từ vựng gặp khi học, xem phim hoặc đọc tin tức để ôn tập Flashcard
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Word / Kanji */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Từ vựng (Kanji / Hiragana) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Ví dụ: 桜 (hoặc さくら)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-bold"
              />
            </div>

            {/* Furigana */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cách đọc Furigana (Hiragana)
              </label>
              <input
                type="text"
                value={furigana}
                onChange={(e) => setFurigana(e.target.value)}
                placeholder="Ví dụ: さくら"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden"
              />
            </div>

            {/* Romaji */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phiên âm Romaji
              </label>
              <input
                type="text"
                value={romaji}
                onChange={(e) => setRomaji(e.target.value)}
                placeholder="Ví dụ: sakura"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-mono"
              />
            </div>

            {/* Meaning */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nghĩa tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Ví dụ: Hoa anh đào"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-medium"
              />
            </div>

            {/* Level */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Trình độ JLPT
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-bold"
              >
                <option value="N5">JLPT N5 (Nhập môn)</option>
                <option value="N4">JLPT N4 (Sơ cấp)</option>
                <option value="N3">JLPT N3 (Trung cấp)</option>
                <option value="N2">JLPT N2 (Cao cấp)</option>
                <option value="N1">JLPT N1 (Bản ngữ)</option>
              </select>
            </div>

            {/* Word Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Từ loại
              </label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-medium"
              >
                <option value="Danh từ">Danh từ (Noun)</option>
                <option value="Động từ nhóm 1">Động từ nhóm 1 (Godan)</option>
                <option value="Động từ nhóm 2">Động từ nhóm 2 (Ichidan)</option>
                <option value="Động từ nhóm 3">Động từ nhóm 3 (Suru/Kuru)</option>
                <option value="Tính từ đuôi -i">Tính từ đuôi -i</option>
                <option value="Tính từ đuôi -na">Tính từ đuôi -na</option>
                <option value="Phó từ">Phó từ (Adverb)</option>
                <option value="Cụm thành ngữ">Cụm từ / Thành ngữ</option>
              </select>
            </div>

            {/* Example sentence */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Câu ví dụ tiếng Nhật (tùy chọn)
              </label>
              <input
                type="text"
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="Ví dụ: 春になると桜の花が咲きます。"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-sans"
              />
            </div>

            {/* Example meaning */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dịch nghĩa câu ví dụ (tùy chọn)
              </label>
              <input
                type="text"
                value={exampleMeaning}
                onChange={(e) => setExampleMeaning(e.target.value)}
                placeholder="Ví dụ: Mùa xuân đến thì hoa anh đào nở rộ."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save size={14} />
              <span>Lưu từ vựng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWordModal;
