import { useTTS } from '@/hooks/useTTS';
import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ToneQuestion } from './toneData';
import { ToneOption } from './ToneOption';

interface ToneQuizProps {
  question: ToneQuestion;
  onNext: (correct: boolean) => void;
}

const TONES: ('mid' | 'low' | 'falling' | 'high' | 'rising')[] = ['mid', 'low', 'falling', 'high', 'rising'];

export function ToneQuiz({ question, onNext }: ToneQuizProps) {
  const { speak, isSpeaking, isAvailable } = useTTS('th-TH');
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const pendingNext = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answered = useRef(false);

  useEffect(() => {
    setSelectedTone(null);
    answered.current = false;
    const timer = setTimeout(() => {
      speak(question.syllable);
    }, 500);
    return () => {
      clearTimeout(timer);
      if (pendingNext.current) clearTimeout(pendingNext.current);
    };
  }, [question, speak]);

  const handleSelect = (tone: string) => {
    if (answered.current || !isAvailable) return;
    answered.current = true;
    setSelectedTone(tone);
    const correct = tone === question.tone;

    pendingNext.current = setTimeout(() => {
      onNext(correct);
    }, 1500);
  };

  if (!isAvailable)
    return (
      <div role="status" className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-bold">Thai audio is unavailable</h2>
        <p className="text-sm text-muted-foreground">
          This listening quiz needs a Thai speech voice on your device. You can still study the written tone rules.
        </p>
        <Link to="/learn/tone-clues" className="inline-block font-semibold text-primary">
          Learn tone clues →
        </Link>
      </div>
    );

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="text-center space-y-4 w-full">
        <button
          onClick={() => {
            speak(question.syllable);
          }}
          className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isSpeaking ? 'bg-primary shadow-lg scale-105' : 'bg-primary/20 hover:bg-primary/30'
          }`}
          aria-label="Play audio"
        >
          <Play className={`w-10 h-10 ml-1 ${isSpeaking ? 'text-primary-foreground' : 'text-primary'}`} />
        </button>
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Listen and Identify</p>
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TONES.map(tone => (
          <div key={tone} className={tone === 'rising' ? 'col-span-2 sm:col-span-1 sm:col-start-2' : ''}>
            <ToneOption
              type={tone}
              label={tone}
              selected={selectedTone === tone}
              correct={selectedTone ? tone === question.tone : null}
              disabled={selectedTone !== null}
              onClick={() => {
                handleSelect(tone);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
