import { db } from './db';

export interface DailyReviewCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CardStatusBreakdown {
  new: number;
  learning: number;
  review: number;
}

export interface DeckStats {
  deckId: number;
  deckName: string;
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  averageEase: number;
}

export interface OverallStats {
  totalDecks: number;
  totalCards: number;
  totalReviews: number;
  currentStreak: number;
  longestStreak: number;
  reviewsToday: number;
  cardBreakdown: CardStatusBreakdown;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getStreaks(reviewDates: string[]): { current: number; longest: number } {
  if (reviewDates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = [...new Set(reviewDates)].sort().reverse();

  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));

  let current = 0;
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
      if (Math.abs(diffDays - 1) < 0.01) {
        current++;
      } else {
        break;
      }
    }
  }

  let longest = 0;
  let streak = 1;
  const sorted = [...new Set(reviewDates)].sort();
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
  longest = Math.max(longest, streak, current);

  return { current, longest };
}

export async function getDailyReviews(days = 30): Promise<DailyReviewCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const logs = await db.reviewLogs.where('reviewedAt').above(since).toArray();

  const countMap = new Map<string, number>();
  for (const log of logs) {
    const key = toDateKey(log.reviewedAt);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const result: DailyReviewCount[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    result.push({ date: key, count: countMap.get(key) ?? 0 });
  }
  return result;
}

export async function getOverallStats(): Promise<OverallStats> {
  const totalDecks = await db.decks.count();
  const allCards = await db.cards.toArray();
  const totalCards = allCards.length;
  const totalReviews = await db.reviewLogs.count();

  const today = toDateKey(new Date());
  const allLogs = await db.reviewLogs.toArray();
  const reviewsToday = allLogs.filter(l => toDateKey(l.reviewedAt) === today).length;

  const reviewDates = allLogs.map(l => toDateKey(l.reviewedAt));
  const { current, longest } = getStreaks(reviewDates);

  const cardBreakdown: CardStatusBreakdown = { new: 0, learning: 0, review: 0 };
  for (const card of allCards) {
    cardBreakdown[card.status]++;
  }

  return {
    totalDecks,
    totalCards,
    totalReviews,
    currentStreak: current,
    longestStreak: longest,
    reviewsToday,
    cardBreakdown,
  };
}

export async function getDeckStats(): Promise<DeckStats[]> {
  const decks = await db.decks.toArray();
  const result: DeckStats[] = [];

  for (const deck of decks) {
    if (deck.id === undefined) continue;
    const cards = await db.cards.where('deckId').equals(deck.id).toArray();

    let totalEase = 0;
    let newCards = 0;
    let learningCards = 0;
    let reviewCards = 0;

    for (const card of cards) {
      totalEase += card.easeFactor;
      if (card.status === 'new') newCards++;
      else if (card.status === 'learning') learningCards++;
      else reviewCards++;
    }

    result.push({
      deckId: deck.id,
      deckName: deck.name,
      totalCards: cards.length,
      newCards,
      learningCards,
      reviewCards,
      averageEase: cards.length > 0 ? totalEase / cards.length : 2.5,
    });
  }

  return result;
}
