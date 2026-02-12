import type { Card } from '../types/flashcard';

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  status: Card['status'];
}

/**
 * SM-2 algorithm: calculate the next review schedule for a card.
 *
 * Quality ratings:
 *   0 = complete blackout
 *   1 = wrong, but recognized on reveal
 *   2 = wrong, but easy recall after seeing answer
 *   3 = correct with serious difficulty
 *   4 = correct with some hesitation
 *   5 = perfect recall
 *
 * Mapping to UI buttons:
 *   Again = 0, Hard = 2, Good = 4, Easy = 5
 */
export function calculateNextReview(
  card: Pick<Card, 'easeFactor' | 'interval' | 'repetitions'>,
  quality: ReviewQuality,
  now = new Date(),
): ReviewResult {
  const MIN_EASE_FACTOR = 1.3;

  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed recall — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  const status: Card['status'] = quality < 3 ? 'learning' : 'review';

  return { easeFactor, interval, repetitions, nextReview, status };
}

export const QUALITY_MAP = {
  again: 0 as ReviewQuality,
  hard: 2 as ReviewQuality,
  good: 4 as ReviewQuality,
  easy: 5 as ReviewQuality,
};

export type QualityLabel = keyof typeof QUALITY_MAP;
