import { db } from '@/lib/db';
import type { Card, Deck, StudySession } from '@/types/flashcard';

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getTodaysCounts(deckId: number): Promise<{ newToday: number; reviewToday: number }> {
  const startOfDay = getStartOfToday();

  const todaysLogs = await db.reviewLogs
    .where('deckId')
    .equals(deckId)
    .filter(log => log.reviewedAt >= startOfDay)
    .toArray();

  let newToday = 0;
  let reviewToday = 0;
  for (const log of todaysLogs) {
    if (log.previousInterval === 0) {
      newToday++;
    } else {
      reviewToday++;
    }
  }

  return { newToday, reviewToday };
}

export interface StudyQueueResult {
  cards: Card[];
  newCount: number;
  reviewCount: number;
  learningCount: number;
}

export async function buildStudyQueue(deck: Deck): Promise<StudyQueueResult> {
  const deckId = deck.id;
  if (deckId === undefined) return { cards: [], newCount: 0, reviewCount: 0, learningCount: 0 };

  const now = new Date();
  const { newToday, reviewToday } = await getTodaysCounts(deckId);

  const remainingNew = Math.max(0, deck.newCardsPerDay - newToday);
  const remainingReview = Math.max(0, deck.reviewCardsPerDay - reviewToday);

  const [learningCards, relearningCards, reviewCards, newCardsRaw] = await Promise.all([
    db.cards.where({ deckId, status: 'learning' }).toArray(),
    db.cards.where({ deckId, status: 'relearning' }).toArray(),
    db.cards.where({ deckId, status: 'review' }).toArray(),
    db.cards.where({ deckId, status: 'new' }).toArray(),
  ]);

  const learning: Card[] = [];
  const review: Card[] = [];

  // Filter learning/relearning due now
  for (const card of [...learningCards, ...relearningCards]) {
    if (card.nextReview <= now) {
      learning.push(card);
    }
  }

  // Filter reviews due now
  for (const card of reviewCards) {
    if (card.nextReview <= now) {
      review.push(card);
    }
  }

  // Shuffle new cards (Fisher-Yates) to vary the order
  const newCards = [...newCardsRaw];
  for (let i = newCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newCards[i];
    newCards[i] = newCards[j];
    newCards[j] = temp;
  }

  learning.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

  review.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

  const limitedReview = review.slice(0, remainingReview);
  const limitedNew = newCards.slice(0, remainingNew);

  const queue = [...learning, ...limitedReview, ...limitedNew];

  return {
    cards: queue,
    newCount: limitedNew.length,
    reviewCount: limitedReview.length,
    learningCount: learning.length,
  };
}

export async function getOrCreateSession(deckId: number, queueCardIds: number[]): Promise<StudySession> {
  const startOfDay = getStartOfToday();

  const existing = await db.studySessions
    .where('deckId')
    .equals(deckId)
    .filter(s => s.startedAt >= startOfDay && s.completedAt === undefined)
    .first();

  if (existing) {
    return existing;
  }

  const now = new Date();
  const session: StudySession = {
    deckId,
    startedAt: now,
    lastActiveAt: now,
    newCardsSeen: 0,
    reviewCardsSeen: 0,
    correctCount: 0,
    totalReviewed: 0,
    queue: queueCardIds,
  };

  const id = await db.studySessions.add(session);
  return { ...session, id: id ?? undefined };
}

export async function updateSessionProgress(
  sessionId: number,
  updates: {
    wasNew: boolean;
    wasReview: boolean;
    wasCorrect: boolean;
    remainingQueue: number[];
  },
): Promise<void> {
  const session = await db.studySessions.get(sessionId);
  if (!session) return;

  await db.studySessions.update(sessionId, {
    lastActiveAt: new Date(),
    newCardsSeen: session.newCardsSeen + (updates.wasNew ? 1 : 0),
    reviewCardsSeen: session.reviewCardsSeen + (updates.wasReview ? 1 : 0),
    correctCount: session.correctCount + (updates.wasCorrect ? 1 : 0),
    totalReviewed: session.totalReviewed + 1,
    queue: updates.remainingQueue,
  });
}

export async function completeSession(sessionId: number): Promise<void> {
  await db.studySessions.update(sessionId, {
    completedAt: new Date(),
    lastActiveAt: new Date(),
    queue: [],
  });
}
