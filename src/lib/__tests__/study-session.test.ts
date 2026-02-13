import { buildStudyQueue, getTodaysCounts } from '@/lib/study-session';
import type { Card, Deck } from '@/types/flashcard';
import { DEFAULT_DECK_CONFIG } from '@/types/flashcard';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCards: Card[] = [];
const mockReviewLogs: { deckId: number; reviewedAt: Date; previousInterval: number }[] = [];

vi.mock('@/lib/db', () => ({
  db: {
    cards: {
      where: (field: string) => ({
        equals: (val: number) => ({
          toArray: () => Promise.resolve(mockCards.filter(c => (field === 'deckId' ? c.deckId === val : false))),
          filter: (fn: (c: Card) => boolean) => ({
            toArray: () =>
              Promise.resolve(mockCards.filter(c => (field === 'deckId' ? c.deckId === val : false)).filter(fn)),
          }),
        }),
      }),
    },
    reviewLogs: {
      where: (field: string) => ({
        equals: (val: number) => ({
          filter: (fn: (l: { deckId: number; reviewedAt: Date; previousInterval: number }) => boolean) => ({
            toArray: () =>
              Promise.resolve(mockReviewLogs.filter(l => (field === 'deckId' ? l.deckId === val : false)).filter(fn)),
          }),
        }),
      }),
    },
  },
}));

function makeCard(overrides: Partial<Card> & { id: number; deckId: number }): Card {
  return {
    noteId: 1,
    ordinal: 0,
    status: 'new',
    nextReview: new Date(),
    interval: 0,
    easeFactor: 250,
    repetitions: 0,
    lapses: 0,
    learningStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 1,
    name: 'Test Deck',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...DEFAULT_DECK_CONFIG,
    ...overrides,
  };
}

describe('getTodaysCounts', () => {
  beforeEach(() => {
    mockReviewLogs.length = 0;
  });

  it('returns 0/0 when no reviews today', async () => {
    const result = await getTodaysCounts(1);
    expect(result.newToday).toBe(0);
    expect(result.reviewToday).toBe(0);
  });

  it('counts new cards (previousInterval = 0) and review cards separately', async () => {
    const today = new Date();
    mockReviewLogs.push(
      { deckId: 1, reviewedAt: today, previousInterval: 0 },
      { deckId: 1, reviewedAt: today, previousInterval: 0 },
      { deckId: 1, reviewedAt: today, previousInterval: 5 },
    );

    const result = await getTodaysCounts(1);
    expect(result.newToday).toBe(2);
    expect(result.reviewToday).toBe(1);
  });

  it('ignores reviews from other decks', async () => {
    const today = new Date();
    mockReviewLogs.push(
      { deckId: 1, reviewedAt: today, previousInterval: 0 },
      { deckId: 2, reviewedAt: today, previousInterval: 0 },
    );

    const result = await getTodaysCounts(1);
    expect(result.newToday).toBe(1);
    expect(result.reviewToday).toBe(0);
  });
});

describe('buildStudyQueue', () => {
  beforeEach(() => {
    mockCards.length = 0;
    mockReviewLogs.length = 0;
  });

  it('returns empty queue for deck with no cards', async () => {
    const deck = makeDeck();
    const result = await buildStudyQueue(deck);
    expect(result.cards).toHaveLength(0);
  });

  it('orders: learning → review → new', async () => {
    const past = new Date(Date.now() - 60000);
    mockCards.push(
      makeCard({ id: 1, deckId: 1, status: 'new' }),
      makeCard({ id: 2, deckId: 1, status: 'review', nextReview: past, interval: 3 }),
      makeCard({ id: 3, deckId: 1, status: 'learning', nextReview: past }),
    );

    const deck = makeDeck();
    const result = await buildStudyQueue(deck);

    expect(result.cards[0].id).toBe(3);
    expect(result.cards[1].id).toBe(2);
    expect(result.cards[2].id).toBe(1);
  });

  it('respects newCardsPerDay limit', async () => {
    for (let i = 1; i <= 5; i++) {
      mockCards.push(makeCard({ id: i, deckId: 1, status: 'new' }));
    }

    const deck = makeDeck({ newCardsPerDay: 2 });
    const result = await buildStudyQueue(deck);

    expect(result.newCount).toBe(2);
    expect(result.cards).toHaveLength(2);
  });

  it('respects reviewCardsPerDay limit', async () => {
    const past = new Date(Date.now() - 60000);
    for (let i = 1; i <= 10; i++) {
      mockCards.push(makeCard({ id: i, deckId: 1, status: 'review', nextReview: past, interval: 3 }));
    }

    const deck = makeDeck({ reviewCardsPerDay: 3 });
    const result = await buildStudyQueue(deck);

    expect(result.reviewCount).toBe(3);
    expect(result.cards).toHaveLength(3);
  });

  it('subtracts already-studied-today from daily limits', async () => {
    const today = new Date();
    for (let i = 0; i < 18; i++) {
      mockReviewLogs.push({ deckId: 1, reviewedAt: today, previousInterval: 0 });
    }

    for (let i = 1; i <= 5; i++) {
      mockCards.push(makeCard({ id: i, deckId: 1, status: 'new' }));
    }

    const deck = makeDeck({ newCardsPerDay: 20 });
    const result = await buildStudyQueue(deck);

    expect(result.newCount).toBe(2);
  });

  it('includes learning/relearning cards without daily limit', async () => {
    const past = new Date(Date.now() - 60000);
    for (let i = 1; i <= 5; i++) {
      mockCards.push(makeCard({ id: i, deckId: 1, status: 'learning', nextReview: past }));
    }

    const deck = makeDeck({ newCardsPerDay: 0, reviewCardsPerDay: 0 });
    const result = await buildStudyQueue(deck);

    expect(result.learningCount).toBe(5);
    expect(result.cards).toHaveLength(5);
  });

  it('does not include future review cards', async () => {
    const future = new Date(Date.now() + 86400000);
    mockCards.push(makeCard({ id: 1, deckId: 1, status: 'review', nextReview: future, interval: 3 }));

    const deck = makeDeck();
    const result = await buildStudyQueue(deck);

    expect(result.reviewCount).toBe(0);
    expect(result.cards).toHaveLength(0);
  });
});
