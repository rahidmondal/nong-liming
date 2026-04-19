/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkAndApplyStreakRollover } from '../lib/streakLogic';
import { db } from '@/lib/db';

// Mock Dexie
vi.mock('@/lib/db', () => {
  const mockTable = {
    get: vi.fn(),
    update: vi.fn(),
    toArray: vi.fn(),
    add: vi.fn(),
  };
  return {
    db: {
      userStats: mockTable,
      reviewLogs: mockTable,
      graduatedWords: mockTable,
      decks: mockTable,
      cards: mockTable,
      notes: mockTable,
      noteTypes: mockTable,
    },
    getOrCreateUserStats: vi.fn(),
  };
});

import { getOrCreateUserStats } from '@/lib/db';

describe('streakLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consumes a freeze token if a day is missed and goal was not met', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Mock user stats: missed yesterday, had 2 tokens
    vi.mocked(getOrCreateUserStats).mockResolvedValue({
      id: 1,
      lastStudyDate: yesterday,
      cardsReviewedToday: 5, // Missed goal (default likely 20)
      dailyGoal: 20,
      freezeTokens: 2,
    });

    await checkAndApplyStreakRollover();

    // Should consume 1 token because 1 day gap where goal was missed
    const updateSpy = vi.mocked(db.userStats.update);
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        freezeTokens: 1,
        cardsReviewedToday: 0,
        lastStudyDate: today,
      }),
    );
  });

  it('does NOT consume a token if the goal was met on the last study date', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    vi.mocked(getOrCreateUserStats).mockResolvedValue({
      id: 1,
      lastStudyDate: yesterday,
      cardsReviewedToday: 20, // Met goal
      dailyGoal: 20,
      freezeTokens: 2,
    });

    await checkAndApplyStreakRollover();

    // tokensToConsume = daysMissed (1) - 1 = 0
    const updateSpy = vi.mocked(db.userStats.update);
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        freezeTokens: 2,
        cardsReviewedToday: 0,
        lastStudyDate: today,
      }),
    );
  });

  it('consumes multiple tokens for multiple missed days', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

    vi.mocked(getOrCreateUserStats).mockResolvedValue({
      id: 1,
      lastStudyDate: threeDaysAgo,
      cardsReviewedToday: 0, // Missed goal 3 days ago
      dailyGoal: 20,
      freezeTokens: 5,
    });

    await checkAndApplyStreakRollover();

    // daysMissed = 3. Goal was NOT met on the last active day.
    // tokensToConsume = 3.
    const updateSpy = vi.mocked(db.userStats.update);
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        freezeTokens: 2,
        cardsReviewedToday: 0,
        lastStudyDate: today,
      }),
    );
  });

  it('bottoms out at 0 tokens if not enough are available', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);

    vi.mocked(getOrCreateUserStats).mockResolvedValue({
      id: 1,
      lastStudyDate: fiveDaysAgo,
      cardsReviewedToday: 0,
      dailyGoal: 20,
      freezeTokens: 2,
    });

    await checkAndApplyStreakRollover();

    const updateSpy = vi.mocked(db.userStats.update);
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        freezeTokens: 0,
        cardsReviewedToday: 0,
        lastStudyDate: today,
      }),
    );
  });
});
