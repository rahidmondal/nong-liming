import { useCallback, useEffect, useRef, useState } from 'react';

interface Playback {
  owner: object;
  synthesis: SpeechSynthesis;
  finish: () => void;
}

// Speech synthesis has one queue for the whole page, shared by every Listen button.
let activePlayback: Playback | null = null;

function getSynthesis(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'
    ? ((window as Partial<Window>).speechSynthesis ?? null)
    : null;
}

function cancelPlayback(synthesis: SpeechSynthesis) {
  activePlayback?.finish();
  synthesis.cancel();
}

function normalizedLanguage(lang: string): string {
  return lang.replaceAll('_', '-').toLowerCase();
}

function selectVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const normalized = normalizedLanguage(lang);
  const exact = voices.filter(voice => normalizedLanguage(voice.lang) === normalized);
  const candidates =
    exact.length > 0
      ? exact
      : voices.filter(voice => normalizedLanguage(voice.lang).split('-')[0] === normalized.split('-')[0]);
  return candidates.find(voice => /google|microsoft/i.test(voice.name)) ?? candidates.at(0) ?? null;
}

export function useTTS(lang = 'th-TH', rate = 0.8) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const owner = useRef({});
  const voice = selectVoice(voices, lang);

  useEffect(() => {
    const synthesis = getSynthesis();
    if (!synthesis) return undefined;
    const updateVoices = () => {
      setVoices(synthesis.getVoices());
    };
    synthesis.addEventListener('voiceschanged', updateVoices);
    updateVoices();
    return () => {
      synthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  useEffect(() => {
    const currentOwner = owner.current;
    return () => {
      if (activePlayback?.owner === currentOwner) cancelPlayback(activePlayback.synthesis);
    };
  }, [lang]);

  const speak = useCallback(
    (text: string) => {
      const synthesis = getSynthesis();
      if (!synthesis) return;
      cancelPlayback(synthesis);
      if (!text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.replaceAll('_', '-');
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.voice = voice;

      const playback: Playback = {
        owner: owner.current,
        synthesis,
        finish: () => {
          if (activePlayback !== playback) return;
          activePlayback = null;
          utterance.onstart = null;
          utterance.onend = null;
          utterance.onerror = null;
          setIsSpeaking(false);
        },
      };
      activePlayback = playback;
      utterance.onstart = () => {
        if (activePlayback === playback) setIsSpeaking(true);
      };
      utterance.onend = playback.finish;
      utterance.onerror = playback.finish;
      try {
        synthesis.speak(utterance);
      } catch {
        playback.finish();
      }
    },
    [lang, voice, rate],
  );

  const stop = useCallback(() => {
    const synthesis = getSynthesis();
    if (synthesis) cancelPlayback(synthesis);
  }, []);

  return { speak, stop, isSpeaking, isAvailable: voice !== null };
}
