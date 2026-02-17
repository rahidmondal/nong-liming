import type { Card, CardStatus, Rating } from '@/types/flashcard';
import { MIN_EASE_FACTOR } from '@/types/flashcard';

export interface SchedulingConfig {
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  lapseMultiplier: number;
  maxInterval: number;
  easyBonus: number;
  hardMultiplier: number;
  intervalFuzzRange: number;
}

export const DEFAULT_SCHEDULING_CONFIG: SchedulingConfig = {
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingInterval: 1,
  easyInterval: 4,
  lapseMultiplier: 0,
  maxInterval: 36500,
  easyBonus: 1.3,
  hardMultiplier: 1.2,
  intervalFuzzRange: 0.05,
};

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  status: CardStatus;
  lapses: number;
  learningStep: number;
}

export type QualityLabel = 'again' | 'hard' | 'good' | 'easy';

export const RATING_MAP: Record<QualityLabel, Rating> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

type CardForReview = Pick<Card, 'status' | 'easeFactor' | 'interval' | 'repetitions' | 'lapses' | 'learningStep'>;

/**
 * Calculate the next review schedule for a card using the Anki-variant SM-2 algorithm.
 *
 * Rating buttons: Again(1) Hard(2) Good(3) Easy(4)
 *
 * Behavior varies by card status:
 * - new/learning: progress through learning steps → graduate to review
 * - review: adjust interval using ease factor
 * - relearning: progress through relearning steps → return to review
 */
export function calculateNextReview(
  card: CardForReview,
  rating: Rating,
  config: SchedulingConfig = DEFAULT_SCHEDULING_CONFIG,
  now = new Date(),
): ReviewResult {
  if (card.status === 'new' || card.status === 'learning') {
    return handleLearning(card, rating, config, now);
  }
  if (card.status === 'relearning') {
    return handleRelearning(card, rating, config, now);
  }
  return handleReview(card, rating, config, now);
}

function handleLearning(card: CardForReview, rating: Rating, config: SchedulingConfig, now: Date): ReviewResult {
  const steps = config.learningSteps;
  const { easeFactor, lapses, repetitions } = card;
  let { learningStep } = card;

  if (rating === 1) {
    learningStep = 0;
    return {
      easeFactor,
      interval: 0,
      repetitions,
      nextReview: addMinutes(now, steps[0] ?? 1),
      status: 'learning',
      lapses,
      learningStep,
    };
  }

  if (rating === 2) {
    const nextStepIndex = learningStep + 1;
    const currentStepInterval = steps[learningStep] ?? 1;
    const nextStepInterval = nextStepIndex < steps.length ? steps[nextStepIndex] : config.graduatingInterval * 24 * 60; // graduatingInterval is in days

    const averageInterval = (currentStepInterval + nextStepInterval) / 2;
    return {
      easeFactor,
      interval: 0,
      repetitions,
      nextReview: addMinutes(now, averageInterval),
      status: 'learning',
      lapses,
      learningStep,
    };
  }

  if (rating === 4) {
    return graduate(easeFactor, config.easyInterval, repetitions, lapses, config, now);
  }

  const nextStep = learningStep + 1;
  if (nextStep >= steps.length) {
    return graduate(easeFactor, config.graduatingInterval, repetitions, lapses, config, now);
  }
  return {
    easeFactor,
    interval: 0,
    repetitions,
    nextReview: addMinutes(now, steps[nextStep] ?? 10),
    status: 'learning',
    lapses,
    learningStep: nextStep,
  };
}

function graduate(
  easeFactor: number,
  interval: number,
  repetitions: number,
  lapses: number,
  config: SchedulingConfig,
  now: Date,
): ReviewResult {
  const clampedInterval = Math.min(interval, config.maxInterval);
  return {
    easeFactor,
    interval: clampedInterval,
    repetitions: repetitions + 1,
    nextReview: addDays(now, clampedInterval),
    status: 'review',
    lapses,
    learningStep: 0,
  };
}

function handleReview(card: CardForReview, rating: Rating, config: SchedulingConfig, now: Date): ReviewResult {
  let { easeFactor, lapses } = card;
  const { interval, repetitions } = card;

  if (rating === 1) {
    lapses += 1;
    const newInterval = Math.max(1, Math.round(interval * config.lapseMultiplier));
    const relearningSteps = config.relearningSteps;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 20);

    return {
      easeFactor,
      interval: newInterval,
      repetitions,
      nextReview: addMinutes(now, relearningSteps[0] ?? 10),
      status: 'relearning',
      lapses,
      learningStep: 0,
    };
  }

  if (rating === 2) {
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 15);
    const hardInterval = Math.max(interval + 1, Math.round(interval * config.hardMultiplier));
    const fuzzedHard = applyFuzz(Math.min(hardInterval, config.maxInterval), config.intervalFuzzRange);
    return {
      easeFactor,
      interval: fuzzedHard,
      repetitions: repetitions + 1,
      nextReview: addDays(now, fuzzedHard),
      status: 'review',
      lapses,
      learningStep: 0,
    };
  }

  if (rating === 4) {
    easeFactor = easeFactor + 15;
    const easyInterval = Math.round(interval * (easeFactor / 100) * config.easyBonus);
    const clampedEasy = Math.max(interval + 1, Math.min(easyInterval, config.maxInterval));
    const fuzzedEasy = applyFuzz(clampedEasy, config.intervalFuzzRange);
    return {
      easeFactor,
      interval: fuzzedEasy,
      repetitions: repetitions + 1,
      nextReview: addDays(now, fuzzedEasy),
      status: 'review',
      lapses,
      learningStep: 0,
    };
  }

  const goodInterval = Math.round(interval * (easeFactor / 100));
  const clampedGood = Math.max(interval + 1, Math.min(goodInterval, config.maxInterval));
  const fuzzedGood = applyFuzz(clampedGood, config.intervalFuzzRange);
  return {
    easeFactor,
    interval: fuzzedGood,
    repetitions: repetitions + 1,
    nextReview: addDays(now, fuzzedGood),
    status: 'review',
    lapses,
    learningStep: 0,
  };
}

function handleRelearning(card: CardForReview, rating: Rating, config: SchedulingConfig, now: Date): ReviewResult {
  const steps = config.relearningSteps;
  const { easeFactor, interval, lapses, repetitions } = card;
  let { learningStep } = card;

  if (rating === 1) {
    learningStep = 0;
    return {
      easeFactor,
      interval,
      repetitions,
      nextReview: addMinutes(now, steps[0] ?? 10),
      status: 'relearning',
      lapses,
      learningStep,
    };
  }

  if (rating === 2) {
    return {
      easeFactor,
      interval,
      repetitions,
      nextReview: addMinutes(now, steps[learningStep] ?? 10),
      status: 'relearning',
      lapses,
      learningStep,
    };
  }

  if (rating === 4) {
    const easyGraduate = Math.max(1, interval);
    return {
      easeFactor,
      interval: easyGraduate,
      repetitions: repetitions + 1,
      nextReview: addDays(now, easyGraduate),
      status: 'review',
      lapses,
      learningStep: 0,
    };
  }

  const nextStep = learningStep + 1;
  if (nextStep >= steps.length) {
    const graduateInterval = Math.max(1, interval);
    return {
      easeFactor,
      interval: graduateInterval,
      repetitions: repetitions + 1,
      nextReview: addDays(now, graduateInterval),
      status: 'review',
      lapses,
      learningStep: 0,
    };
  }
  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: addMinutes(now, steps[nextStep] ?? 10),
    status: 'relearning',
    lapses,
    learningStep: nextStep,
  };
}

export function applyFuzz(interval: number, range: number): number {
  if (interval < 3 || range === 0) return interval;
  const delta = Math.max(1, Math.round(interval * range));
  const fuzz = Math.floor(Math.random() * (2 * delta + 1)) - delta;
  return Math.max(1, interval + fuzz);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getIntervalPreviews(
  card: CardForReview,
  config: SchedulingConfig = DEFAULT_SCHEDULING_CONFIG,
): Record<QualityLabel, string> {
  const now = new Date();
  const previews: Record<QualityLabel, string> = {
    again: '',
    hard: '',
    good: '',
    easy: '',
  };

  for (const label of ['again', 'hard', 'good', 'easy'] as const) {
    const result = calculateNextReview(card, RATING_MAP[label], config, now);
    const diffMs = result.nextReview.getTime() - now.getTime();
    previews[label] = formatDuration(diffMs);
  }

  return previews;
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${String(minutes)}m`;

  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `${String(hours)}h`;

  const days = Math.round(ms / 86_400_000);
  if (days < 30) return `${String(days)}d`;

  const months = (days / 30).toFixed(1).replace(/\.0$/, '');
  if (days < 365) return `${months}mo`;

  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years}y`;
}
