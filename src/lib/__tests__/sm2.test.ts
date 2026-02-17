import {
  applyFuzz,
  calculateNextReview,
  DEFAULT_SCHEDULING_CONFIG,
  formatDuration,
  type SchedulingConfig,
} from '@/lib/sm2';
import type { Card } from '@/types/flashcard';
import { describe, expect, it, vi } from 'vitest';

type CardForReview = Pick<Card, 'status' | 'easeFactor' | 'interval' | 'repetitions' | 'lapses' | 'learningStep'>;

const NO_FUZZ_CONFIG: SchedulingConfig = {
  ...DEFAULT_SCHEDULING_CONFIG,
  intervalFuzzRange: 0,
};

const newCard = {
  status: 'new' as const,
  easeFactor: 250,
  interval: 0,
  repetitions: 0,
  lapses: 0,
  learningStep: 0,
};

const learningCard = {
  status: 'learning' as const,
  easeFactor: 250,
  interval: 0,
  repetitions: 0,
  lapses: 0,
  learningStep: 0,
};

const reviewCard = {
  status: 'review' as const,
  easeFactor: 250,
  interval: 10,
  repetitions: 3,
  lapses: 0,
  learningStep: 0,
};

const relearningCard = {
  status: 'relearning' as const,
  easeFactor: 230,
  interval: 5,
  repetitions: 3,
  lapses: 1,
  learningStep: 0,
};

describe('calculateNextReview', () => {
  const now = new Date('2026-02-13T00:00:00Z');

  describe('new/learning cards', () => {
    it('Again: resets to step 0', () => {
      const result = calculateNextReview(learningCard, 1, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('learning');
      expect(result.learningStep).toBe(0);
      expect(result.nextReview.getTime() - now.getTime()).toBe(1 * 60 * 1000);
    });

    it('Hard: calculates average of current and next step (or graduating)', () => {
      const card = { ...learningCard, learningStep: 1 };
      const result = calculateNextReview(card, 2, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('learning');
      expect(result.learningStep).toBe(1);
      expect(result.nextReview.getTime() - now.getTime()).toBe(725 * 60 * 1000);
    });

    it('Good: advances to next step', () => {
      const result = calculateNextReview(newCard, 3, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('learning');
      expect(result.learningStep).toBe(1);
      expect(result.nextReview.getTime() - now.getTime()).toBe(10 * 60 * 1000);
    });

    it('Good on last step: graduates to review', () => {
      const card = { ...learningCard, learningStep: 1 };
      const result = calculateNextReview(card, 3, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('Easy: graduates immediately with easy interval', () => {
      const result = calculateNextReview(newCard, 4, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.interval).toBe(4);
      expect(result.repetitions).toBe(1);
    });
  });

  describe('review cards', () => {
    it('Again: lapses and enters relearning', () => {
      const result = calculateNextReview(reviewCard, 1, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('relearning');
      expect(result.lapses).toBe(1);
      expect(result.easeFactor).toBe(230);
      expect(result.learningStep).toBe(0);
      expect(result.nextReview.getTime() - now.getTime()).toBe(10 * 60 * 1000);
    });

    it('Again with lapseMultiplier: multiplies interval', () => {
      const config = { ...NO_FUZZ_CONFIG, lapseMultiplier: 0.5 };
      const result = calculateNextReview(reviewCard, 1, config, now);
      expect(result.interval).toBe(5);
    });

    it('Again with lapseMultiplier 0: sets interval to min 1', () => {
      const result = calculateNextReview(reviewCard, 1, NO_FUZZ_CONFIG, now);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('Hard: increases interval slightly, decreases ease', () => {
      const result = calculateNextReview(reviewCard, 2, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.easeFactor).toBe(235);
      expect(result.interval).toBe(12);
      expect(result.repetitions).toBe(4);
    });

    it('Good: normal interval, ease unchanged', () => {
      const result = calculateNextReview(reviewCard, 3, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.easeFactor).toBe(250);
      expect(result.interval).toBe(25);
      expect(result.repetitions).toBe(4);
    });

    it('Easy: larger interval, ease increases', () => {
      const result = calculateNextReview(reviewCard, 4, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.easeFactor).toBe(265);
      expect(result.interval).toBe(34);
      expect(result.repetitions).toBe(4);
    });

    it('never drops ease below MIN_EASE_FACTOR (130)', () => {
      const card = { ...reviewCard, easeFactor: 135 };
      const result = calculateNextReview(card, 1, NO_FUZZ_CONFIG, now);
      expect(result.easeFactor).toBe(130);
    });
  });

  describe('relearning cards', () => {
    it('Again: resets to first relearning step', () => {
      const result = calculateNextReview(relearningCard, 1, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('relearning');
      expect(result.learningStep).toBe(0);
    });

    it('Hard: stays on current step', () => {
      const result = calculateNextReview(relearningCard, 2, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('relearning');
      expect(result.learningStep).toBe(0);
    });

    it('Good on last step: graduates back to review', () => {
      const result = calculateNextReview(relearningCard, 3, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.interval).toBe(5);
      expect(result.repetitions).toBe(4);
    });

    it('Easy: graduates immediately back to review', () => {
      const result = calculateNextReview(relearningCard, 4, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.interval).toBe(5);
      expect(result.repetitions).toBe(4);
    });
  });

  describe('progression simulation', () => {
    it('correctly progresses a new card through learning to review', () => {
      let card: CardForReview = { ...newCard };
      const statuses: string[] = [];

      let result = calculateNextReview(card, 3, NO_FUZZ_CONFIG, now);
      statuses.push(result.status);
      card = { ...card, ...result };

      result = calculateNextReview(card, 3, NO_FUZZ_CONFIG, now);
      statuses.push(result.status);
      card = { ...card, ...result };

      result = calculateNextReview(card, 3, NO_FUZZ_CONFIG, now);
      statuses.push(result.status);
      card = { ...card, ...result };

      expect(statuses).toEqual(['learning', 'review', 'review']);
      expect(card.interval).toBeGreaterThan(1);
    });

    it('handles a lapse and recovery cycle', () => {
      let card: CardForReview = { ...reviewCard };

      let result = calculateNextReview(card, 1, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('relearning');
      card = { ...card, ...result };

      result = calculateNextReview(card, 3, NO_FUZZ_CONFIG, now);
      expect(result.status).toBe('review');
      expect(result.lapses).toBe(1);
    });
  });
});

describe('applyFuzz', () => {
  it('does not fuzz intervals less than 3 days', () => {
    expect(applyFuzz(1, 0.05)).toBe(1);
    expect(applyFuzz(2, 0.05)).toBe(2);
  });

  it('fuzzes intervals >= 3 days', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = applyFuzz(100, 0.05);
    expect(result).toBeGreaterThanOrEqual(95);
    expect(result).toBeLessThanOrEqual(105);
    vi.restoreAllMocks();
  });

  it('never returns less than 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyFuzz(3, 0.5);
    expect(result).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });
});

describe('formatDuration', () => {
  it('formats minutes', () => {
    expect(formatDuration(60_000)).toBe('1m');
    expect(formatDuration(10 * 60_000)).toBe('10m');
  });

  it('formats hours', () => {
    expect(formatDuration(2 * 3_600_000)).toBe('2h');
  });

  it('formats days', () => {
    expect(formatDuration(5 * 86_400_000)).toBe('5d');
  });

  it('formats months', () => {
    expect(formatDuration(45 * 86_400_000)).toBe('1.5mo');
  });

  it('formats years', () => {
    expect(formatDuration(400 * 86_400_000)).toBe('1.1y');
  });
});
