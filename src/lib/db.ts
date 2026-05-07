import type {
  Card,
  Deck,
  GraduatedWord,
  MediaFile,
  Note,
  NoteType,
  ReviewLog,
  StudySession,
  UserStats,
} from '@/types/flashcard';
import type { DailyChallenge } from '@/types/dailyChallenge';
import type { WritingPadStat } from '@/types/writingPad';
import type { LessonProgress } from '@/types/lesson';
import type { UnalomeProgress } from '@/types/unalome';
import { DEFAULT_DECK_CONFIG, DEFAULT_EASE_FACTOR } from '@/types/flashcard';
import Dexie, { type EntityTable } from 'dexie';

function toId(val: number | undefined): number {
  if (val === undefined) throw new Error('Dexie add() returned undefined');
  return val;
}

const db = new Dexie('NongLimingDB') as Dexie & {
  decks: EntityTable<Deck, 'id'>;
  noteTypes: EntityTable<NoteType, 'id'>;
  notes: EntityTable<Note, 'id'>;
  cards: EntityTable<Card, 'id'>;
  studySessions: EntityTable<StudySession, 'id'>;
  reviewLogs: EntityTable<ReviewLog, 'id'>;
  mediaFiles: EntityTable<MediaFile, 'filename'>;
  userStats: EntityTable<UserStats, 'id'>;
  graduatedWords: EntityTable<GraduatedWord, 'id'>;
  dailyChallenges: EntityTable<DailyChallenge, 'id'>;
  writingPadStats: EntityTable<WritingPadStat, 'id'>;
  lessonProgress: EntityTable<LessonProgress, 'lessonId'>;
  unalomeProgress: EntityTable<UnalomeProgress, 'nodeId'>;
};

db.version(1).stores({
  decks: '++id, name, createdAt',
  cards: '++id, deckId, status, nextReview, createdAt',
  reviewLogs: '++id, cardId, deckId, reviewedAt',
});

db.version(2)
  .stores({
    decks: '++id, name, createdAt',
    noteTypes: '++id, name',
    notes: '++id, noteTypeId, deckId, createdAt',
    cards: '++id, noteId, deckId, status, nextReview, createdAt',
    studySessions: '++id, deckId, startedAt, completedAt',
    reviewLogs: '++id, cardId, noteId, deckId, reviewedAt',
  })
  .upgrade(async tx => {
    const noteTypesTable = tx.table<NoteType, number>('noteTypes');
    const notesTable = tx.table<Note, number>('notes');

    const noteTypeId = await noteTypesTable.add({
      name: 'Basic',
      fields: ['Front', 'Back'],
      questionTemplate: '{{Front}}',
      answerTemplate: '{{FrontSide}}<hr id="answer">{{Back}}',
      css: '.card { font-family: sans-serif; font-size: 1.2em; text-align: center; }',
      createdAt: new Date(),
    });

    interface OldCard {
      id?: number;
      deckId: number;
      front: string;
      back: string;
      status: string;
      nextReview: Date;
      interval: number;
      easeFactor: number;
      repetitions: number;
      createdAt: Date;
      updatedAt: Date;
    }

    const cardsTable = tx.table<OldCard, number>('cards');
    const oldCards = await cardsTable.toArray();

    for (const oldCard of oldCards) {
      const noteId = await notesTable.add({
        noteTypeId: noteTypeId,
        deckId: oldCard.deckId,
        fields: {
          Front: oldCard.front,
          Back: oldCard.back,
        },
        tags: [],
        createdAt: oldCard.createdAt,
        updatedAt: oldCard.updatedAt,
      });

      const easeAsPercent = Math.round(oldCard.easeFactor * 100);

      if (oldCard.id !== undefined) {
        await cardsTable.update(oldCard.id, {
          noteId,
          ordinal: 0,
          easeFactor: easeAsPercent,
          lapses: 0,
          learningStep: 0,
        } as unknown as Partial<OldCard>);
      }
    }

    interface OldDeck {
      id?: number;
      name: string;
      description?: string;
      createdAt: Date;
      updatedAt: Date;
    }

    const decksTable = tx.table<OldDeck, number>('decks');
    const oldDecks = await decksTable.toArray();

    for (const deck of oldDecks) {
      if (deck.id !== undefined) {
        await decksTable.update(deck.id, {
          ...DEFAULT_DECK_CONFIG,
        } as unknown as Partial<OldDeck>);
      }
    }

    interface OldReviewLog {
      id?: number;
      cardId: number;
      deckId: number;
      quality: number;
      previousInterval: number;
      newInterval: number;
      easeFactor: number;
      reviewedAt: Date;
    }

    const logsTable = tx.table<OldReviewLog, number>('reviewLogs');
    const oldLogs = await logsTable.toArray();

    for (const log of oldLogs) {
      if (log.id !== undefined) {
        let rating: number;
        if (log.quality <= 1) rating = 1;
        else if (log.quality <= 2) rating = 2;
        else if (log.quality <= 4) rating = 3;
        else rating = 4;

        await logsTable.update(log.id, {
          rating,
          noteId: 0,
          timeTakenMs: 0,
        } as unknown as Partial<OldReviewLog>);
      }
    }
  });

db.version(3).stores({
  decks: '++id, name, createdAt',
  noteTypes: '++id, name',
  notes: '++id, noteTypeId, deckId, createdAt',
  cards: '++id, noteId, deckId, status, nextReview, createdAt',
  studySessions: '++id, deckId, startedAt, completedAt',
  reviewLogs: '++id, cardId, noteId, deckId, reviewedAt',
  mediaFiles: 'filename, deckId',
});

db.version(4).stores({
  cards: '++id, noteId, deckId, status, nextReview, [deckId+status], createdAt',
});

db.version(5).stores({
  userStats: 'id',
  graduatedWords: '++id, word, graduatedAt',
});

db.version(6).stores({
  dailyChallenges: '++id, date',
  writingPadStats: '++id, character',
  lessonProgress: 'lessonId',
});

db.version(7).stores({
  unalomeProgress: 'nodeId, status',
}).upgrade(async tx => {
  const statsTable = tx.table<UserStats, number>('userStats');
  const stats = await statsTable.get(1);
  if (stats) {
    await statsTable.update(1, {
      dokKemCount: stats.dokKemCount ?? 0,
      yaPraekCount: stats.yaPraekCount ?? 0,
      khaoTokCount: stats.khaoTokCount ?? 0,
      dokMaKhueCount: stats.dokMaKhueCount ?? 0,
    } as unknown as Partial<UserStats>);
  }
});

export { db };

const blobUrlCache = new Map<string, string>();

export async function getMediaUrl(filename: string): Promise<string> {
  const cached = blobUrlCache.get(filename);
  if (cached) return cached;

  const media = await db.mediaFiles.get(filename);
  if (!media) return '';

  const url = URL.createObjectURL(media.data);
  blobUrlCache.set(filename, url);
  return url;
}

export async function storeMediaFile(filename: string, data: Blob, mimeType: string, deckId: number): Promise<void> {
  await db.mediaFiles.put({
    filename,
    data,
    mimeType,
    deckId,
    createdAt: new Date(),
  });
}

export async function getOrCreateDefaultNoteType(): Promise<number> {
  const existing = await db.noteTypes.where('name').equals('Basic').first();
  if (existing?.id !== undefined) return existing.id;

  const id = await db.noteTypes.add({
    name: 'Basic',
    fields: ['Front', 'Back'],
    questionTemplate: '{{Front}}',
    answerTemplate: '{{FrontSide}}<hr id="answer">{{Back}}',
    css: '.card { font-family: sans-serif; font-size: 1.2em; text-align: center; }',
    createdAt: new Date(),
  });

  return toId(id);
}

export async function createNoteAndCard(
  noteTypeId: number,
  deckId: number,
  fields: Record<string, string>,
  tags: string[] = [],
): Promise<{ noteId: number; cardId: number }> {
  const now = new Date();
  const noteId = await db.notes.add({
    noteTypeId,
    deckId,
    fields,
    tags,
    createdAt: now,
    updatedAt: now,
  });

  const cardId = await db.cards.add({
    noteId: toId(noteId),
    deckId,
    ordinal: 0,
    status: 'new',
    nextReview: now,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    lapses: 0,
    learningStep: 0,
    createdAt: now,
    updatedAt: now,
  });

  return { noteId: toId(noteId), cardId: toId(cardId) };
}

export async function getOrCreateUserStats(): Promise<UserStats> {
  let stats = await db.userStats.get(1);
  if (!stats) {
    stats = {
      id: 1,
      dailyGoal: 20,
      freezeTokens: 0,
      cardsReviewedToday: 0,
      lastStudyDate: '',
      playbackSpeed: 1.0,
      dokKemCount: 0,
      yaPraekCount: 0,
      khaoTokCount: 0,
      dokMaKhueCount: 0,
    };
    await db.userStats.put(stats);
  }
  return stats;
}
