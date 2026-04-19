import { useCallback, useEffect, useState } from 'react';

export function useTTS(lang = 'th-TH', rate = 0.8) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      const bestVoice =
        voices.find(v => v.lang === lang && (v.name.includes('Google') || v.name.includes('Microsoft'))) ??
        voices.find(v => v.lang === lang);

      if (bestVoice) {
        setVoice(bestVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang]);

  const speak = useCallback(
    (text: string) => {
      window.speechSynthesis.cancel();

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      const onEnd = () => {
        setIsSpeaking(false);
      };
      utterance.onend = onEnd;
      utterance.onerror = onEnd;

      window.speechSynthesis.speak(utterance);

      const timeoutMs = Math.max(2000, text.length * 300);
      setTimeout(() => {
        setIsSpeaking(false);
      }, timeoutMs);
    },
    [lang, voice, rate],
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
