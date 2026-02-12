import Dexie, { type EntityTable } from 'dexie';
import type { Card, Deck, ReviewLog } from '../types/flashcard';

const db = new Dexie('NongLimingDB') as Dexie & {
  decks: EntityTable<Deck, 'id'>;
  cards: EntityTable<Card, 'id'>;
  reviewLogs: EntityTable<ReviewLog, 'id'>;
};

db.version(1).stores({
  decks: '++id, name, createdAt',
  cards: '++id, deckId, status, nextReview, createdAt',
  reviewLogs: '++id, cardId, deckId, reviewedAt',
});

export { db };
