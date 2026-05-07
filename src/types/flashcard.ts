export type CardStatus = 'new' | 'learning' | 'review' | 'relearning';

export type Rating = 1 | 2 | 3 | 4;

export interface NoteType {
  id?: number;
  name: string;
  fields: string[];
  questionTemplate: string;
  answerTemplate: string;
  css: string;
  createdAt: Date;
}

export interface Note {
  id?: number;
  noteTypeId: number;
  deckId: number;
  fields: Record<string, string>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id?: number;
  noteId: number;
  deckId: number;
  ordinal: number;
  status: CardStatus;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  learningStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id?: number;
  name: string;
  description?: string;
  newCardsPerDay: number;
  reviewCardsPerDay: number;
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  lapseMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id?: number;
  deckId: number;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  newCardsSeen: number;
  reviewCardsSeen: number;
  correctCount: number;
  totalReviewed: number;
  queue: number[];
}

export interface ReviewLog {
  id?: number;
  cardId: number;
  noteId: number;
  deckId: number;
  rating: Rating;
  previousInterval: number;
  newInterval: number;
  easeFactor: number;
  timeTakenMs: number;
  reviewedAt: Date;
}

export const DEFAULT_DECK_CONFIG: Pick<
  Deck,
  | 'newCardsPerDay'
  | 'reviewCardsPerDay'
  | 'learningSteps'
  | 'relearningSteps'
  | 'graduatingInterval'
  | 'easyInterval'
  | 'lapseMultiplier'
> = {
  newCardsPerDay: 20,
  reviewCardsPerDay: 200,
  learningSteps: [1, 10],
  relearningSteps: [10],
  graduatingInterval: 1,
  easyInterval: 4,
  lapseMultiplier: 0,
};

export const DEFAULT_EASE_FACTOR = 250;

export const MIN_EASE_FACTOR = 130;

export interface MediaFile {
  filename: string;
  data: Blob;
  mimeType: string;
  deckId: number;
  createdAt: Date;
}

export interface UserStats {
  id: number; // Expected to always be 1
  dailyGoal: number;
  freezeTokens: number;
  cardsReviewedToday: number;
  lastStudyDate: string; // e.g. YYYY-MM-DD
  playbackSpeed: number; // 0.5-2.0, default 1.0
  dokKemCount: number; // Ixora flower (flashcards)
  yaPraekCount: number; // Bermuda grass (streaks)
  khaoTokCount: number; // Popped rice (lessons)
  dokMaKhueCount: number; // Eggplant flower (writing)
}

export interface GraduatedWord {
  id?: number;
  word: string;
  meaning: string;
  graduatedAt: Date;
}
