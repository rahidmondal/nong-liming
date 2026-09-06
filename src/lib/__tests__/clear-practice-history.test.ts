import { describe, expect, it, vi } from 'vitest';
import { clearPracticeHistory } from '../clear-practice-history';

const state = vi.hoisted(() => {
  const names = [
    'studySessions',
    'reviewLogs',
    'missionProgress',
    'practiceActivities',
    'lessonProgress',
    'writingPadStats',
    'dailyChallenges',
    'graduatedWords',
    'unalomeProgress',
    'decks',
    'cards',
    'userStats',
  ];
  const tables = Object.fromEntries(
    names.map(name => [name, { clear: vi.fn().mockResolvedValue(undefined), update: vi.fn().mockResolvedValue(1) }]),
  );
  return {
    tables,
    transaction: vi.fn(async (_mode: string, _tables: unknown[], action: () => Promise<void>) => action()),
  };
});
vi.mock('@/lib/db', () => ({ db: { ...state.tables, transaction: state.transaction } }));

describe('clear unified history', () => {
  it('clears all practice and reward history together, preserving cards and preferences', async () => {
    await clearPracticeHistory();
    for (const name of [
      'studySessions',
      'reviewLogs',
      'missionProgress',
      'practiceActivities',
      'lessonProgress',
      'writingPadStats',
      'dailyChallenges',
      'graduatedWords',
      'unalomeProgress',
    ])
      expect(state.tables[name].clear).toHaveBeenCalledOnce();
    expect(state.tables.cards.clear).not.toHaveBeenCalled();
    expect(state.tables.decks.clear).not.toHaveBeenCalled();
    expect(state.tables.userStats.clear).not.toHaveBeenCalled();
    expect(state.tables.userStats.update).toHaveBeenCalledWith(1, {
      cardsReviewedToday: 0,
      lastStudyDate: '',
      freezeTokens: 0,
      dokKemCount: 0,
      yaPraekCount: 0,
      khaoTokCount: 0,
      dokMaKhueCount: 0,
    });
    expect(state.transaction).toHaveBeenCalledOnce();
  });
});
