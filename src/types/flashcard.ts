export type CardStatus = 'new' | 'learning' | 'review';

export interface Deck {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  status: CardStatus;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewLog {
  id?: number;
  cardId: number;
  deckId: number;
  rating: 1 | 2 | 3 | 4;
  reviewedAt: Date;
  previousInterval: number;
  newInterval: number;
}
