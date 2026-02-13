import { db } from '@/lib/db';
import { calculateNextReview, QUALITY_MAP, type QualityLabel } from '@/lib/sm2';
import type { Card, Deck } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type StudyPhase = 'loading' | 'front' | 'back' | 'done';

const QUALITY_BUTTONS: { label: string; key: QualityLabel; color: string }[] = [
  { label: 'Again', key: 'again', color: 'bg-red-500 hover:bg-red-600' },
  { label: 'Hard', key: 'hard', color: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'Good', key: 'good', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Easy', key: 'easy', color: 'bg-blue-500 hover:bg-blue-600' },
];

export function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const deck = useLiveQuery<Deck | undefined>(() => db.decks.get(deckId), [deckId]);

  const dueCards = useLiveQuery<Card[]>(() => {
    const now = new Date();
    return db.cards
      .where('deckId')
      .equals(deckId)
      .filter(card => card.status === 'new' || card.nextReview <= now)
      .toArray();
  }, [deckId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<StudyPhase>('front');
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const queue = useMemo(() => {
    if (!dueCards) return [];
    return [...dueCards].sort((a, b) => {
      if (a.status === 'new' && b.status !== 'new') return -1;
      if (a.status !== 'new' && b.status === 'new') return 1;
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
  }, [dueCards]);

  const currentCard = queue[currentIndex];

  const handleReveal = useCallback(() => {
    setPhase('back');
  }, []);

  const handleRate = useCallback(
    async (qualityLabel: QualityLabel) => {
      if (isProcessing) return;
      const cardId = currentCard.id;
      if (cardId === undefined) return;

      setIsProcessing(true);
      const quality = QUALITY_MAP[qualityLabel];
      const result = calculateNextReview(currentCard, quality);

      await db.cards.update(cardId, {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        status: result.status,
        updatedAt: new Date(),
      });

      await db.reviewLogs.add({
        cardId,
        deckId,
        quality,
        previousInterval: currentCard.interval,
        newInterval: result.interval,
        easeFactor: result.easeFactor,
        reviewedAt: new Date(),
      });

      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      }));

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setPhase('done');
      } else {
        setCurrentIndex(nextIndex);
        setPhase('front');
      }
      setIsProcessing(false);
    },
    [currentCard, currentIndex, queue.length, deckId, isProcessing],
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setPhase('front');
    setSessionStats({ reviewed: 0, correct: 0 });
  }, []);

  const isLoading = deck === undefined || dueCards === undefined;
  const isEmpty = !isLoading && queue.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto">
      {/* Header */}
      <header className="w-full flex items-center gap-3 py-6">
        <Link to="/decks" className="p-2 -ml-2 rounded-lg hover:bg-card transition-colors" aria-label="Back to decks">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{deck.name}</h1>
          {!isEmpty && phase !== 'done' && (
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} / {queue.length} cards
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center gap-6">
        {/* No cards due */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">All caught up!</h2>
            <p className="text-sm text-muted-foreground max-w-65">
              No cards are due for review right now. Come back later!
            </p>
            <Link
              to="/decks"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Decks
            </Link>
          </motion.div>
        )}

        {/* Card display */}
        {!isEmpty && phase !== 'done' && (
          <>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${String((currentIndex / queue.length) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Flashcard */}
            <div className="w-full flex-1 flex items-center justify-center min-h-75">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${String(currentCard.id)}-${phase}`}
                  initial={{ opacity: 0, rotateY: phase === 'back' ? 90 : 0, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div
                    className={`w-full min-h-70 p-8 rounded-2xl border shadow-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      phase === 'front'
                        ? 'bg-card border-border hover:border-primary/50'
                        : 'bg-linear-to-br from-card to-primary/5 border-primary/30'
                    }`}
                    onClick={phase === 'front' ? handleReveal : undefined}
                    role={phase === 'front' ? 'button' : undefined}
                    tabIndex={phase === 'front' ? 0 : undefined}
                    onKeyDown={
                      phase === 'front'
                        ? e => {
                            if (e.key === 'Enter' || e.key === ' ') handleReveal();
                          }
                        : undefined
                    }
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                      {phase === 'front' ? 'Question' : 'Answer'}
                    </p>
                    <p className="text-xl font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                      {phase === 'front' ? currentCard.front : currentCard.back}
                    </p>
                    {phase === 'front' && <p className="text-xs text-muted-foreground mt-6">Tap to reveal answer</p>}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rating buttons */}
            {phase === 'back' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full grid grid-cols-4 gap-2 pb-4"
              >
                {QUALITY_BUTTONS.map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => void handleRate(btn.key)}
                    disabled={isProcessing}
                    className={`px-3 py-3 ${btn.color} text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50`}
                  >
                    {btn.label}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Tap to reveal hint */}
            {phase === 'front' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReveal}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Show Answer
              </motion.button>
            )}
          </>
        )}

        {/* Session complete */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>
              <p className="text-muted-foreground">Great work on your study session.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-70 mx-auto">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionStats.reviewed}</p>
                <p className="text-xs text-muted-foreground">Cards Reviewed</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-accent">
                  {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-60 mx-auto">
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Study Again
              </button>
              <Link
                to="/decks"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-card text-foreground rounded-xl font-medium border border-border shadow-sm hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Decks
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
