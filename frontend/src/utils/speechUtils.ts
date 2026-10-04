/**
 * Audio pronunciation utility using HTML5 SpeechSynthesis API
 * Optimized for natural, clear Japanese pronunciation for language learners
 */

export const speakJapanese = (text: string, rate: number = 0.88): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis API is not supported in this browser.");
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const cleanText = text.trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ja-JP";
      utterance.rate = rate; // 0.88x provides natural learner-friendly tempo
      utterance.pitch = 1.0;

      // Try selecting a native Japanese voice if available
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find((v) => v.lang.startsWith("ja") || v.lang.includes("JP"));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("SpeechSynthesis error:", err);
      resolve();
    }
  });
};

export const stopJapaneseSpeech = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};
