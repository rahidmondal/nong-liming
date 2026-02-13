import { db } from '@/lib/db';
import {
  calculateNextReview,
  DEFAULT_SCHEDULING_CONFIG,
  formatDuration,
  getIntervalPreviews,
  RATING_MAP,
  type QualityLabel,
  type SchedulingConfig,
} from '@/lib/sm2';
import { buildStudyQueue, completeSession, getOrCreateSession, updateSessionProgress } from '@/lib/study-session';
import { renderCardSide } from '@/lib/template-engine';
import type { Card, Deck, Note, NoteType, StudySession } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Pause, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type StudyPhase = 'loading' | 'front' | 'back' | 'done';

const QUALITY_BUTTONS: { label: string; key: QualityLabel; color: string }[] = [
  { label: 'Again', key: 'again', color: 'bg-red-500 hover:bg-red-600' },
  { label: 'Hard', key: 'hard', color: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'Good', key: 'good', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Easy', key: 'easy', color: 'bg-blue-500 hover:bg-blue-600' },
];

interface CardWithNote {
  card: Card;
  note: Note;
  noteType: NoteType;
}

export function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deckId = Number(id);

  const deck = useLiveQuery<Deck | undefined>(() => db.decks.get(deckId), [deckId]);

  const [session, setSession] = useState<StudySession | null>(null);
  const [queue, setQueue] = useState<CardWithNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<StudyPhase>('loading');
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    newSeen: 0,
    reviewSeen: 0,
    startTime: Date.now(),
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const cardStartTime = useRef(Date.now());
  const sessionInitialized = useRef(false);

  const schedulingConfig: SchedulingConfig = useMemo(() => {
    if (!deck) return DEFAULT_SCHEDULING_CONFIG;
    return {
      learningSteps: deck.learningSteps,
      relearningSteps: deck.relearningSteps,
      graduatingInterval: deck.graduatingInterval,
      easyInterval: deck.easyInterval,
      lapseMultiplier: deck.lapseMultiplier,
      maxInterval: DEFAULT_SCHEDULING_CONFIG.maxInterval,
      easyBonus: DEFAULT_SCHEDULING_CONFIG.easyBonus,
      hardMultiplier: DEFAULT_SCHEDULING_CONFIG.hardMultiplier,
      intervalFuzzRange: DEFAULT_SCHEDULING_CONFIG.intervalFuzzRange,
    };
  }, [deck]);

  useEffect(() => {
    if (!deck || sessionInitialized.current) return;

    const init = async () => {
      sessionInitialized.current = true;

      const queueResult = await buildStudyQueue(deck);
      const cardIds = queueResult.cards.map(c => c.id).filter((id): id is number => id !== undefined);

      const sess = await getOrCreateSession(deck.id ?? 0, cardIds);
      setSession(sess);

      const idsToUse = sess.totalReviewed > 0 && sess.queue.length > 0 ? sess.queue : cardIds;

      const cardDataResult: CardWithNote[] = [];
      for (const cardId of idsToUse) {
        const card = await db.cards.get(cardId);
        if (!card) continue;
        const note = await db.notes.get(card.noteId);
        if (!note) continue;
        const noteType = await db.noteTypes.get(note.noteTypeId);
        if (!noteType) continue;
        cardDataResult.push({ card, note, noteType });
      }

      setQueue(cardDataResult);

      if (sess.totalReviewed > 0) {
        setSessionStats(prev => ({
          ...prev,
          reviewed: sess.totalReviewed,
          correct: sess.correctCount,
          newSeen: sess.newCardsSeen,
          reviewSeen: sess.reviewCardsSeen,
          startTime: sess.startedAt.getTime(),
        }));
      }

      setPhase(cardDataResult.length > 0 ? 'front' : 'done');
    };

    void init();
  }, [deck]);

  const current = queue[currentIndex] as CardWithNote | undefined;

  useEffect(() => {
    cardStartTime.current = Date.now();
  }, [currentIndex]);

  const [renderedContent, setRenderedContent] = useState({ question: '', answer: '' });

  useEffect(() => {
    let mounted = true;

    const render = async () => {
      if (!current) {
        if (mounted) setRenderedContent({ question: '', answer: '' });
        return;
      }

      const { note, noteType } = current;
      const question = await renderCardSide(noteType.questionTemplate, note.fields, {
        css: noteType.css,
      });

      const frontSideRaw = await renderCardSide(noteType.questionTemplate, note.fields);
      const answer = await renderCardSide(noteType.answerTemplate, note.fields, {
        frontSide: frontSideRaw,
        css: noteType.css,
      });

      if (mounted) setRenderedContent({ question, answer });
    };

    void render();

    return () => {
      mounted = false;
    };
  }, [current]);

  const intervalPreviews = useMemo(() => {
    if (!current) return null;
    return getIntervalPreviews(current.card, schedulingConfig);
  }, [current, schedulingConfig]);

  const handleReveal = useCallback(() => {
    setPhase('back');
  }, []);

  const handleRate = useCallback(
    async (qualityLabel: QualityLabel) => {
      if (isProcessing || !current || !session?.id) return;
      const { card, note } = current;
      const cardId = card.id;
      if (cardId === undefined) return;

      setIsProcessing(true);
      const rating = RATING_MAP[qualityLabel];
      const result = calculateNextReview(card, rating, schedulingConfig);
      const timeTakenMs = Date.now() - cardStartTime.current;

      await db.cards.update(cardId, {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        status: result.status,
        lapses: result.lapses,
        learningStep: result.learningStep,
        updatedAt: new Date(),
      });

      await db.reviewLogs.add({
        cardId,
        noteId: note.id ?? 0,
        deckId,
        rating,
        previousInterval: card.interval,
        newInterval: result.interval,
        easeFactor: result.easeFactor,
        timeTakenMs,
        reviewedAt: new Date(),
      });

      const wasNew = card.status === 'new';
      const wasReview = card.status === 'review';
      const wasCorrect = rating >= 3;

      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: wasCorrect ? prev.correct + 1 : prev.correct,
        newSeen: wasNew ? prev.newSeen + 1 : prev.newSeen,
        reviewSeen: wasReview ? prev.reviewSeen + 1 : prev.reviewSeen,
      }));

      const remainingQueue = queue
        .slice(currentIndex + 1)
        .map(q => q.card.id)
        .filter((id): id is number => id !== undefined);
      await updateSessionProgress(session.id, {
        wasNew,
        wasReview,
        wasCorrect,
        remainingQueue,
      });

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        await completeSession(session.id);
        setPhase('done');
      } else {
        setCurrentIndex(nextIndex);
        setPhase('front');
      }
      setIsProcessing(false);
    },
    [current, currentIndex, queue, deckId, isProcessing, schedulingConfig, session],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === 'front' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        handleReveal();
      } else if (phase === 'back') {
        const keyMap: Partial<Record<string, QualityLabel>> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };
        const label = keyMap[e.key];
        if (label) {
          e.preventDefault();
          void handleRate(label);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [phase, handleReveal, handleRate]);

  const handleRestart = useCallback(async () => {
    if (!deck) return;
    sessionInitialized.current = false;
    setCurrentIndex(0);
    setSession(null);
    setQueue([]);
    setPhase('loading');
    setSessionStats({ reviewed: 0, correct: 0, newSeen: 0, reviewSeen: 0, startTime: Date.now() });

    const queueResult = await buildStudyQueue(deck);
    const cardIds = queueResult.cards.map(c => c.id).filter((id): id is number => id !== undefined);
    const sess = await getOrCreateSession(deck.id ?? 0, cardIds);
    setSession(sess);

    const cardDataResult: CardWithNote[] = [];
    for (const cardId of cardIds) {
      const card = await db.cards.get(cardId);
      if (!card) continue;
      const note = await db.notes.get(card.noteId);
      if (!note) continue;
      const noteType = await db.noteTypes.get(note.noteTypeId);
      if (!noteType) continue;
      cardDataResult.push({ card, note, noteType });
    }

    setQueue(cardDataResult);
    sessionInitialized.current = true;
    setPhase(cardDataResult.length > 0 ? 'front' : 'done');
  }, [deck]);

  const handlePause = useCallback(async () => {
    if (session?.id) {
      const remainingQueue = queue
        .slice(currentIndex)
        .map(q => q.card.id)
        .filter((id): id is number => id !== undefined);
      await updateSessionProgress(session.id, {
        wasNew: false,
        wasReview: false,
        wasCorrect: false,
        remainingQueue,
      });
    }
    void navigate('/decks');
  }, [session, queue, currentIndex, navigate]);

  const isLoading = deck === undefined || phase === 'loading';
  const isEmpty = !isLoading && queue.length === 0 && phase !== 'done';

  const sessionTimeMs = Date.now() - sessionStats.startTime;

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
        {/* Pause button */}
        {phase !== 'done' && !isEmpty && (
          <button
            onClick={() => void handlePause()}
            className="p-2 rounded-lg hover:bg-card transition-colors"
            aria-label="Pause session"
            title="Pause & return to decks"
          >
            <Pause className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
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
        {!isEmpty && phase !== 'done' && current && (
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
                  key={`${String(current.card.id)}-${phase}`}
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
                    <div
                      className="text-xl font-medium text-foreground whitespace-pre-wrap leading-relaxed card-content"
                      dangerouslySetInnerHTML={{
                        __html: phase === 'front' ? renderedContent.question : renderedContent.answer,
                      }}
                    />
                    {phase === 'front' && <p className="text-xs text-muted-foreground mt-6">Tap to reveal answer</p>}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rating buttons with interval previews */}
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
                    className={`px-3 py-3 ${btn.color} text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex flex-col items-center gap-0.5`}
                  >
                    <span>{btn.label}</span>
                    {intervalPreviews && <span className="text-[10px] opacity-80">{intervalPreviews[btn.key]}</span>}
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

            <div className="grid grid-cols-2 gap-3 max-w-80 mx-auto">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{sessionStats.reviewed}</p>
                <p className="text-xs text-muted-foreground">Reviewed</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-accent">
                  {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(sessionTimeMs)}
                </p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-lg font-bold text-foreground">
                  <span className="text-blue-400">{sessionStats.newSeen}</span>
                  {' / '}
                  <span className="text-emerald-400">{sessionStats.reviewSeen}</span>
                </p>
                <p className="text-xs text-muted-foreground">New / Review</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-60 mx-auto">
              <button
                onClick={() => void handleRestart()}
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
