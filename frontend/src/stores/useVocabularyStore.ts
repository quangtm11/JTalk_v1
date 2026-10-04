import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { VocabularyItem } from "@/types";

export interface VocabularyState {
  words: VocabularyItem[];
  saveWord: (item: Partial<VocabularyItem>) => void;
  removeWord: (id: string) => void;
  toggleMastered: (id: string) => void;
  markAsMastered: (id: string, isMastered: boolean) => void;
  addCustomWord: (data: {
    word: string;
    meaning: string;
    kanji?: string;
    furigana?: string;
    romaji?: string;
    wordType?: string;
    exampleSentence?: string;
    exampleMeaning?: string;
    level?: "N5" | "N4" | "N3" | "N2" | "N1";
  }) => void;
  resetToDefaults: () => void;
}

export const SEED_VOCABULARY: VocabularyItem[] = [
  {
    id: "vocab-1",
    word: "日本語",
    kanji: "日本語",
    furigana: "にほんご",
    romaji: "nihongo",
    meaning: "Tiếng Nhật",
    wordType: "Danh từ",
    exampleSentence: "日本語を勉強するのがとても楽しいです。",
    exampleMeaning: "Học tiếng Nhật thực sự rất vui.",
    level: "N5",
    isMastered: true,
    savedAt: "2026-09-20T08:00:00.000Z",
  },
  {
    id: "vocab-2",
    word: "勉強する",
    kanji: "勉強する",
    furigana: "べんきょうする",
    romaji: "benkyou suru",
    meaning: "Học tập, nghiên cứu",
    wordType: "Động từ nhóm 3",
    exampleSentence: "毎日15分日本語を勉強しています。",
    exampleMeaning: "Tôi học tiếng Nhật 15 phút mỗi ngày.",
    level: "N5",
    isMastered: false,
    savedAt: "2026-09-22T09:30:00.000Z",
  },
  {
    id: "vocab-3",
    word: "友達",
    kanji: "友達",
    furigana: "ともだち",
    romaji: "tomodachi",
    meaning: "Bạn bè",
    wordType: "Danh từ",
    exampleSentence: "日本の友達と一緒にラーメンを食べました。",
    exampleMeaning: "Tôi đã cùng bạn người Nhật đi ăn mì ramen.",
    level: "N5",
    isMastered: true,
    savedAt: "2026-09-23T11:00:00.000Z",
  },
  {
    id: "vocab-4",
    word: "美味しい",
    kanji: "美味しい",
    furigana: "おいしい",
    romaji: "oishii",
    meaning: "Ngon (món ăn)",
    wordType: "Tính từ đuôi -i",
    exampleSentence: "この寿司は本当に美味しいですね！",
    exampleMeaning: "Món sushi này thực sự rất ngon!",
    level: "N5",
    isMastered: true,
    savedAt: "2026-09-24T14:15:00.000Z",
  },
  {
    id: "vocab-5",
    word: "約束",
    kanji: "約束",
    furigana: "やくそく",
    romaji: "yakusoku",
    meaning: "Lời hứa, cuộc hẹn",
    wordType: "Danh từ / Động từ",
    exampleSentence: "明日の午後3時に友達と約束があります。",
    exampleMeaning: "Tôi có hẹn với bạn vào 3 giờ chiều mai.",
    level: "N4",
    isMastered: false,
    savedAt: "2026-09-25T16:00:00.000Z",
  },
  {
    id: "vocab-6",
    word: "案内する",
    kanji: "案内する",
    furigana: "あんないする",
    romaji: "annai suru",
    meaning: "Hướng dẫn, dẫn đường",
    wordType: "Động từ nhóm 3",
    exampleSentence: "東京の有名な観光地をご案内します。",
    exampleMeaning: "Tôi sẽ dẫn bạn đi tham quan các địa điểm nổi tiếng ở Tokyo.",
    level: "N4",
    isMastered: false,
    savedAt: "2026-09-26T10:20:00.000Z",
  },
  {
    id: "vocab-7",
    word: "経験",
    kanji: "経験",
    furigana: "けいけん",
    romaji: "keiken",
    meaning: "Kinh nghiệm, trải nghiệm",
    wordType: "Danh từ",
    exampleSentence: "日本での留学生活は素晴らしい経験になりました。",
    exampleMeaning: "Cuộc sống du học tại Nhật là một trải nghiệm tuyệt vời.",
    level: "N4",
    isMastered: false,
    savedAt: "2026-09-27T08:45:00.000Z",
  },
  {
    id: "vocab-8",
    word: "面接",
    kanji: "面接",
    furigana: "めんせつ",
    romaji: "mensetsu",
    meaning: "Phỏng vấn xin việc",
    wordType: "Danh từ",
    exampleSentence: "来週、IT企業の面接を受ける予定です。",
    exampleMeaning: "Tuần tới tôi có lịch phỏng vấn với công ty IT.",
    level: "N3",
    isMastered: false,
    savedAt: "2026-09-28T13:10:00.000Z",
  },
  {
    id: "vocab-9",
    word: "遠慮する",
    kanji: "遠慮する",
    furigana: "えんりょする",
    romaji: "enryo suru",
    meaning: "Khách khí, ngại ngùng, kiềm chế",
    wordType: "Động từ nhóm 3",
    exampleSentence: "どうぞご遠慮なく召し上がってください。",
    exampleMeaning: "Xin mời anh/chị cứ tự nhiên dùng bữa, đừng ngại.",
    level: "N3",
    isMastered: false,
    savedAt: "2026-09-29T15:30:00.000Z",
  },
  {
    id: "vocab-10",
    word: "お世話になる",
    kanji: "お世話になる",
    furigana: "おせわになる",
    romaji: "osewa ni naru",
    meaning: "Được nhận sự giúp đỡ, chăm sóc",
    wordType: "Cụm thành ngữ Keigo",
    exampleSentence: "いつも大変お世話になっております。",
    exampleMeaning: "Cảm ơn anh/chị đã luôn quan tâm và giúp đỡ tôi.",
    level: "N3",
    isMastered: true,
    savedAt: "2026-09-30T09:00:00.000Z",
  },
  {
    id: "vocab-11",
    word: "相談する",
    kanji: "相談する",
    furigana: "そうだんする",
    romaji: "soudan suru",
    meaning: "Thảo luận, bàn bạc, xin ý kiến",
    wordType: "Động từ nhóm 3",
    exampleSentence: "進路について先生に相談しました。",
    exampleMeaning: "Tôi đã xin ý kiến thầy cô về định hướng tương lai.",
    level: "N4",
    isMastered: true,
    savedAt: "2026-09-30T10:15:00.000Z",
  },
  {
    id: "vocab-12",
    word: "挑戦する",
    kanji: "挑戦する",
    furigana: "ちょうせんする",
    romaji: "chousen suru",
    meaning: "Thử thách, chinh phục",
    wordType: "Động từ nhóm 3",
    exampleSentence: "今年中にJLPT N2合格に挑戦します！",
    exampleMeaning: "Trong năm nay tôi sẽ thử thách chinh phục kỳ thi JLPT N2!",
    level: "N2",
    isMastered: false,
    savedAt: "2026-10-01T07:30:00.000Z",
  },
];

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      words: SEED_VOCABULARY,

      saveWord: (item) => {
        const currentWords = get().words;
        const wordKey = (item.word || item.kanji || "").trim().toLowerCase();

        if (!wordKey) {
          toast.error("Không tìm thấy thông tin từ vựng hợp lệ.");
          return;
        }

        const existingIndex = currentWords.findIndex(
          (w) =>
            w.word.toLowerCase() === wordKey ||
            (w.kanji && w.kanji.toLowerCase() === wordKey)
        );

        if (existingIndex >= 0) {
          toast.info(`Từ "${item.word || item.kanji}" đã có trong Sổ tay từ vựng của bạn!`);
          return;
        }

        const newWord: VocabularyItem = {
          id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          word: item.word || item.kanji || "",
          meaning: item.meaning || "Từ vựng quan trọng",
          kanji: item.kanji || item.word || "",
          furigana: item.furigana || "",
          romaji: item.romaji || "",
          wordType: item.wordType || "Từ vựng",
          exampleSentence: item.exampleSentence || "",
          exampleMeaning: item.exampleMeaning || "",
          level: item.level || "N5",
          lessonId: item.lessonId,
          lessonTitle: item.lessonTitle,
          isMastered: false,
          savedAt: new Date().toISOString(),
        };

        set({ words: [newWord, ...currentWords] });
        toast.success(`Đã lưu "${newWord.word}" vào Sổ tay từ vựng! 🔖`);
      },

      removeWord: (id) => {
        const currentWords = get().words;
        const target = currentWords.find((w) => w.id === id);
        set({ words: currentWords.filter((w) => w.id !== id) });
        if (target) {
          toast.info(`Đã gỡ "${target.word}" khỏi sổ tay.`);
        }
      },

      toggleMastered: (id) => {
        const currentWords = get().words;
        const target = currentWords.find((w) => w.id === id);
        if (!target) return;

        const nextStatus = !target.isMastered;
        set({
          words: currentWords.map((w) =>
            w.id === id ? { ...w, isMastered: nextStatus } : w
          ),
        });

        if (nextStatus) {
          toast.success(`Tuyệt vời! Đã đánh dấu "${target.word}" là Đã thuộc! 🎉`);
        } else {
          toast.info(`Đã chuyển "${target.word}" sang mục Cần ôn tập.`);
        }
      },

      markAsMastered: (id, isMastered) => {
        set({
          words: get().words.map((w) =>
            w.id === id ? { ...w, isMastered } : w
          ),
        });
      },

      addCustomWord: (data) => {
        const newWord: VocabularyItem = {
          id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          word: data.word.trim(),
          meaning: data.meaning.trim(),
          kanji: (data.kanji || data.word).trim(),
          furigana: (data.furigana || "").trim(),
          romaji: (data.romaji || "").trim(),
          wordType: data.wordType || "Từ vựng",
          exampleSentence: (data.exampleSentence || "").trim(),
          exampleMeaning: (data.exampleMeaning || "").trim(),
          level: data.level || "N5",
          isMastered: false,
          savedAt: new Date().toISOString(),
        };

        set({ words: [newWord, ...get().words] });
        toast.success(`Đã thêm từ mới "${newWord.word}" thành công!`);
      },

      resetToDefaults: () => {
        set({ words: SEED_VOCABULARY });
        toast.success("Đã khôi phục danh sách từ vựng mẫu ban đầu.");
      },
    }),
    {
      name: "jtalk_saved_vocabularies",
    }
  )
);

export default useVocabularyStore;
