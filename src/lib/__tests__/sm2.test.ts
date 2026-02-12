import { describe, expect, it } from 'vitest';
import { calculateNextReview, QUALITY_MAP } from '../sm2';

const defaultCard = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

describe('calculateNextReview', () => {
  const now = new Date('2026-02-12T00:00:00Z');

  describe('failed recall (quality < 3)', () => {
    it('resets repetitions and sets interval to 1 on "Again" (quality 0)', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.again, now);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.status).toBe('learning');
    });

    it('resets a card with high repetitions back to 0', () => {
      const card = { easeFactor: 2.5, interval: 30, repetitions: 10 };
      const result = calculateNextReview(card, QUALITY_MAP.again, now);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('sets next review to 1 day from now on failure', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.again, now);
      const expected = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(result.nextReview.getTime()).toBe(expected.getTime());
    });
  });

  describe('successful recall (quality >= 3)', () => {
    it('sets interval to 1 on first successful review', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.good, now);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.status).toBe('review');
    });

    it('sets interval to 6 on second successful review', () => {
      const card = { easeFactor: 2.5, interval: 1, repetitions: 1 };
      const result = calculateNextReview(card, QUALITY_MAP.good, now);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('multiplies interval by ease factor on third+ review', () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = calculateNextReview(card, QUALITY_MAP.good, now);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });

    it('calculates correct next review date', () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = calculateNextReview(card, QUALITY_MAP.good, now);
      const expected = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      expect(result.nextReview.getTime()).toBe(expected.getTime());
    });
  });

  describe('ease factor adjustments', () => {
    it('increases ease factor for "Easy" (quality 5)', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.easy, now);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('keeps ease factor roughly the same for "Good" (quality 4)', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.good, now);
      expect(result.easeFactor).toBe(2.5);
    });

    it('decreases ease factor for "Hard" (quality 2)', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.hard, now);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('decreases ease factor for "Again" (quality 0)', () => {
      const result = calculateNextReview(defaultCard, QUALITY_MAP.again, now);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('never drops ease factor below 1.3', () => {
      const card = { easeFactor: 1.3, interval: 1, repetitions: 0 };
      const result = calculateNextReview(card, QUALITY_MAP.again, now);
      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe('progression simulation', () => {
    it('progressively increases intervals for consistent "Good" reviews', () => {
      let card = { ...defaultCard };
      const intervals: number[] = [];

      for (let i = 0; i < 5; i++) {
        const result = calculateNextReview(card, QUALITY_MAP.good, now);
        intervals.push(result.interval);
        card = {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        };
      }

      // intervals should be: 1, 6, 15, 38, 94 (approximately)
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(6);
      for (let i = 2; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
      }
    });
  });
});
