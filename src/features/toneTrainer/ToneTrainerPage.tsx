import { ThaiBellIcon as Music } from '@/components/ThaiIcons';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TONE_QUESTIONS } from './toneData';
import { ToneQuiz } from './ToneQuiz';
import { recordPractice } from '@/lib/practice-activity';
import type { PracticeActivity } from '@/types/practice';

export function ToneTrainerPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [runId, setRunId] = useState(() => crypto.randomUUID());
  const pendingAnswer = useRef<PracticeActivity | null>(null);
  const saving = useRef(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Shuffle questions once on mount
  const questions = useMemo(() => {
    return [...TONE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  const handleNext = async (correct: boolean) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError('');
    pendingAnswer.current ??= {
      id: `tone:${runId}:${String(currentIndex)}`,
      kind: 'tone',
      label: questions[currentIndex].syllable,
      occurredAt: Date.now(),
      outcome: correct ? 'correct' : 'incorrect',
    };
    try {
      await recordPractice(pendingAnswer.current);
      if (pendingAnswer.current.outcome === 'correct') setScore(s => s + 1);
      pendingAnswer.current = null;
      if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
      else setCompleted(true);
    } catch {
      setSaveError('Your tone answer could not be saved. Retry to continue.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setRunId(crypto.randomUUID());
    pendingAnswer.current = null;
  };

  return (
    <div className="min-h-full flex flex-col p-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            Tone Trainer
          </h1>
          {!completed && (
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {currentIndex + 1} / {questions.length}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center gap-6 mt-4">
        {!completed ? (
          <div className="w-full max-w-md mx-auto">
            <ToneQuiz question={questions[currentIndex]} onNext={correct => void handleNext(correct)} />
            {isSaving && (
              <p role="status" className="text-sm text-muted-foreground mt-4">
                Saving your answer…
              </p>
            )}
            {saveError && (
              <div className="mt-4 space-y-3">
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
                <button
                  disabled={isSaving}
                  onClick={() => void handleNext(pendingAnswer.current?.outcome === 'correct')}
                  className="rounded-xl bg-primary text-primary-foreground p-3"
                >
                  Retry saving answer
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
              <p className="text-muted-foreground">
                You identified {score} out of {questions.length} tones correctly.
              </p>
              <Link to="/stats" className="inline-block text-primary font-semibold">
                Saved to your progress →
              </Link>
            </div>
            <div className="flex justify-center gap-3 w-full max-w-60 mx-auto pt-4">
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
