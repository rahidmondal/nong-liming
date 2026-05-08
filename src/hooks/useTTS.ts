import { useCallback, useEffect, useState } from 'react';

// Global cache for voices to avoid multiple components overwriting onvoiceschanged
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
const voiceListeners = new Set<() => void>();

const loadGlobalVoices = () => {
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length > 0) {
    voicesLoaded = true;
    voiceListeners.forEach(listener => { listener(); });
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadGlobalVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadGlobalVoices);
}

export function useTTS(lang = 'th-TH', rate = 0.8) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const updateVoice = () => {
      const bestVoice =
        cachedVoices.find(v => v.lang === lang && (v.name.includes('Google') || v.name.includes('Microsoft'))) ??
        cachedVoices.find(v => v.lang === lang);

      if (bestVoice) {
        setVoice(bestVoice);
      }
    };

    if (voicesLoaded) {
      updateVoice();
    }

    voiceListeners.add(updateVoice);
    return () => {
      voiceListeners.delete(updateVoice);
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
