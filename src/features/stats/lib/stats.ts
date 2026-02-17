import { db } from '@/lib/db';

export interface DailyReviewCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CardStatusBreakdown {
  new: number;
  learning: number;
  review: number;
  relearning: number;
}

export interface DeckStats {
  deckId: number;
  deckName: string;
  totalCards: number;
  totalNotes: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  relearningCards: number;
  averageEase: number;
}

export interface OverallStats {
  totalDecks: number;
  totalCards: number;
  totalNotes: number;
  totalReviews: number;
  currentStreak: number;
  longestStreak: number;
  reviewsToday: number;
  cardBreakdown: CardStatusBreakdown;
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

export function getStreaks(reviewDates: string[]): { current: number; longest: number } {
  if (reviewDates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(reviewDates)].sort();

  let longest = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (Math.abs(diffDays - 1) < 0.01) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak);

  const today = toLocalDateKey(new Date());
  const yesterday = toLocalDateKey(new Date(Date.now() - 86400000));
  const last = sorted[sorted.length - 1];

  let current = 0;
  if (last === today || last === yesterday) {
    current = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const newer = new Date(sorted[i + 1]);
      const older = new Date(sorted[i]);
      const diffDays = (newer.getTime() - older.getTime()) / 86400000;
      if (Math.abs(diffDays - 1) < 0.01) {
        current++;
      } else {
        break;
      }
    }
  }

  longest = Math.max(longest, current);
  return { current, longest };
}

export async function getDailyReviews(days = 30): Promise<DailyReviewCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const logs = await db.reviewLogs.where('reviewedAt').above(since).toArray();

  const countMap = new Map<string, number>();
  for (const log of logs) {
    const key = toLocalDateKey(log.reviewedAt);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const result: DailyReviewCount[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toLocalDateKey(d);
    result.push({ date: key, count: countMap.get(key) ?? 0 });
  }
  return result;
}

export async function getOverallStats(): Promise<OverallStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalDecks, allCards, totalNotes, totalReviews, todaysLogs] = await Promise.all([
    db.decks.count(),
    db.cards.toArray(),
    db.notes.count(),
    db.reviewLogs.count(),
    db.reviewLogs.where('reviewedAt').aboveOrEqual(startOfToday).count(),
  ]);

  const totalCards = allCards.length;
  const cardBreakdown: CardStatusBreakdown = { new: 0, learning: 0, review: 0, relearning: 0 };
  for (const card of allCards) {
    cardBreakdown[card.status]++;
  }

  const dateSet = new Set<string>();
  await db.reviewLogs.each(log => {
    dateSet.add(toLocalDateKey(log.reviewedAt));
  });
  const { current, longest } = getStreaks([...dateSet]);

  return {
    totalDecks,
    totalCards,
    totalNotes,
    totalReviews,
    currentStreak: current,
    longestStreak: longest,
    reviewsToday: todaysLogs,
    cardBreakdown,
  };
}

export async function getDeckStats(): Promise<DeckStats[]> {
  const [decks, allCards, allNotes] = await Promise.all([db.decks.toArray(), db.cards.toArray(), db.notes.toArray()]);

  const cardsByDeck = new Map<number, typeof allCards>();
  for (const card of allCards) {
    const list = cardsByDeck.get(card.deckId);
    if (list) {
      list.push(card);
    } else {
      cardsByDeck.set(card.deckId, [card]);
    }
  }

  const noteCountByDeck = new Map<number, number>();
  for (const note of allNotes) {
    noteCountByDeck.set(note.deckId, (noteCountByDeck.get(note.deckId) ?? 0) + 1);
  }

  const result: DeckStats[] = [];
  for (const deck of decks) {
    if (deck.id === undefined) continue;
    const cards = cardsByDeck.get(deck.id) ?? [];
    const noteCount = noteCountByDeck.get(deck.id) ?? 0;

    let totalEase = 0;
    let newCards = 0;
    let learningCards = 0;
    let reviewCards = 0;
    let relearningCards = 0;

    for (const card of cards) {
      totalEase += card.easeFactor;
      switch (card.status) {
        case 'new':
          newCards++;
          break;
        case 'learning':
          learningCards++;
          break;
        case 'review':
          reviewCards++;
          break;
        case 'relearning':
          relearningCards++;
          break;
      }
    }

    result.push({
      deckId: deck.id,
      deckName: deck.name,
      totalCards: cards.length,
      totalNotes: noteCount,
      newCards,
      learningCards,
      reviewCards,
      relearningCards,
      averageEase: cards.length > 0 ? totalEase / cards.length : 250,
    });
  }

  return result;
}
