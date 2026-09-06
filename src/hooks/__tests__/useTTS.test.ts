import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTTS } from '@/hooks/useTTS';

class MockUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function voice(lang: string, name = 'System voice'): SpeechSynthesisVoice {
  return { lang, name, default: false, localService: true, voiceURI: name };
}

let voices: SpeechSynthesisVoice[];
let spoken: MockUtterance[];
let synthesis: EventTarget & {
  getVoices: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.useFakeTimers();
  voices = [voice('th-TH', 'Google Thai'), voice('en-US', 'English')];
  spoken = [];
  synthesis = Object.assign(new EventTarget(), {
    getVoices: vi.fn(() => voices),
    speak: vi.fn((utterance: MockUtterance) => {
      spoken.push(utterance);
      utterance.onstart?.();
    }),
    // Browsers need not dispatch an end event when cancel is called.
    cancel: vi.fn(),
  });
  vi.stubGlobal('speechSynthesis', synthesis);
  vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useTTS voice availability', () => {
  it('selects an immediately available Thai voice and preserves requested rate', () => {
    const { result } = renderHook(() => useTTS('th-TH', 0.7));
    expect(result.current.isAvailable).toBe(true);
    act(() => {
      result.current.speak('สวัสดี');
    });
    expect(spoken[0]).toMatchObject({ text: 'สวัสดี', lang: 'th-TH', rate: 0.7, voice: voices[0] });
  });

  it.each(['th', 'TH_th', 'th-th'])('matches Thai locale %s', lang => {
    const { result } = renderHook(() => useTTS(lang));
    expect(result.current.isAvailable).toBe(true);
  });

  it('matches language-only English requests', () => {
    const { result } = renderHook(() => useTTS('en'));
    expect(result.current.isAvailable).toBe(true);
    act(() => {
      result.current.speak('Hello');
    });
    expect(spoken[0].voice).toEqual(voices[1]);
  });

  it('updates all mounted consumers after voices load and clears removed voices', () => {
    voices = [];
    const first = renderHook(() => useTTS());
    const second = renderHook(() => useTTS());
    expect(first.result.current.isAvailable).toBe(false);
    voices = [voice('th-TH')];
    act(() => {
      synthesis.dispatchEvent(new Event('voiceschanged'));
    });
    expect(first.result.current.isAvailable).toBe(true);
    expect(second.result.current.isAvailable).toBe(true);
    voices = [];
    act(() => {
      synthesis.dispatchEvent(new Event('voiceschanged'));
    });
    expect(first.result.current.isAvailable).toBe(false);
    expect(second.result.current.isAvailable).toBe(false);
  });

  it('clears the selected voice when switching to an unavailable language', () => {
    const { result, rerender } = renderHook(({ lang }) => useTTS(lang), { initialProps: { lang: 'th' } });
    expect(result.current.isAvailable).toBe(true);
    rerender({ lang: 'fr' });
    expect(result.current.isAvailable).toBe(false);
    act(() => {
      result.current.speak('Bonjour');
    });
    expect(spoken[0].voice).toBeNull();
    expect(spoken[0].lang).toBe('fr');
  });

  it('safely handles browsers without speech synthesis', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    const { result } = renderHook(() => useTTS());
    expect(result.current.isAvailable).toBe(false);
    expect(() => {
      result.current.speak('Hello');
      result.current.stop();
    }).not.toThrow();
  });
});

describe('useTTS playback ownership', () => {
  it('clears the previous hook when another hook interrupts it', () => {
    const first = renderHook(() => useTTS());
    const second = renderHook(() => useTTS());
    act(() => {
      first.result.current.speak('First');
    });
    expect(first.result.current.isSpeaking).toBe(true);
    act(() => {
      second.result.current.speak('Second');
    });
    expect(first.result.current.isSpeaking).toBe(false);
    expect(second.result.current.isSpeaking).toBe(true);
    act(() => {
      first.result.current.stop();
    });
    expect(second.result.current.isSpeaking).toBe(false);
  });

  it('ignores delayed events from replaced utterances', () => {
    const { result } = renderHook(() => useTTS());
    act(() => {
      result.current.speak('First');
    });
    const oldEnd = spoken[0].onend;
    const oldStart = spoken[0].onstart;
    act(() => {
      result.current.speak('Second');
      oldEnd?.();
    });
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      result.current.stop();
      oldStart?.();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('does not let an earlier timeout reset a later or long-running utterance', () => {
    const { result } = renderHook(() => useTTS());
    act(() => {
      result.current.speak('One');
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      result.current.speak('A longer second utterance');
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(result.current.isSpeaking).toBe(true);
    act(() => {
      spoken[1].onend?.();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('cancels owned audio on unmount and removes voice listeners', () => {
    const remove = vi.spyOn(synthesis, 'removeEventListener');
    const { result, unmount } = renderHook(() => useTTS());
    act(() => {
      result.current.speak('Hello');
    });
    synthesis.cancel.mockClear();
    unmount();
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith('voiceschanged', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not cancel another hook when an idle consumer unmounts', () => {
    const idle = renderHook(() => useTTS());
    const playing = renderHook(() => useTTS());
    act(() => {
      playing.result.current.speak('Hello');
    });
    synthesis.cancel.mockClear();
    idle.unmount();
    expect(synthesis.cancel).not.toHaveBeenCalled();
    expect(playing.result.current.isSpeaking).toBe(true);
  });

  it('cancels owned audio on language switch', () => {
    const { result, rerender } = renderHook(({ lang }) => useTTS(lang), { initialProps: { lang: 'th' } });
    act(() => {
      result.current.speak('Hello');
    });
    synthesis.cancel.mockClear();
    rerender({ lang: 'en' });
    expect(synthesis.cancel).toHaveBeenCalledOnce();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('clears speaking state on a synthesis error', () => {
    const { result } = renderHook(() => useTTS());
    act(() => {
      result.current.speak('Hello');
      spoken[0].onerror?.();
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it('handles a synthesis engine throwing without leaving playback active', () => {
    synthesis.speak.mockImplementationOnce(() => {
      throw new Error('Engine unavailable');
    });
    const { result } = renderHook(() => useTTS());
    expect(() => {
      act(() => {
        result.current.speak('Hello');
      });
    }).not.toThrow();
    expect(result.current.isSpeaking).toBe(false);
  });
});
