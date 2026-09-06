import { APP_VERSION } from '@/lib/constants';
import { db } from '@/lib/db';
import JSZip from 'jszip';
import type { MissionAttempt, MissionProgress } from '@/features/guidedStudy/missionTypes';
import { MISSIONS } from '@/features/guidedStudy/missionData';
import type { UserStats } from '@/types/flashcard';
import { isPracticeBackup, PRACTICE_TABLES, restorePracticeDates, type PracticeBackup } from './practice-backup';
import type { Table } from 'dexie';

interface BackupManifest {
  version: string;
  appVersion: string;
  exportedAt: string;
  counts: Partial<Record<(typeof PRACTICE_TABLES)[number], number>> & {
    decks: number;
    noteTypes: number;
    notes: number;
    cards: number;
    studySessions: number;
    reviewLogs: number;
    mediaFiles: number;
    missionProgress?: number;
    userStats?: number;
  };
}

interface BackupData extends PracticeBackup {
  manifest: BackupManifest;
  decks: unknown[];
  noteTypes: unknown[];
  notes: unknown[];
  cards: unknown[];
  studySessions: unknown[];
  reviewLogs: unknown[];
  missionProgress?: MissionProgress[];
  userStats?: UserStats[];
}

const BACKUP_FORMAT_VERSION = '1';

function rehydrateDates(rows: unknown[], dateFields: string[]): Record<string, unknown>[] {
  return (rows as Record<string, unknown>[]).map(row => {
    const copy = { ...row };
    for (const field of dateFields) {
      const val = copy[field];
      if (typeof val === 'string') {
        copy[field] = new Date(val);
      }
    }
    return copy;
  });
}

export async function exportBackup(): Promise<Blob> {
  const zip = new JSZip();

  // Capture one consistent database snapshot even if a practice save is in flight.
  const [
    decks,
    noteTypes,
    notes,
    cards,
    studySessions,
    reviewLogs,
    mediaFiles,
    missionProgress,
    userStats,
    practiceEntries,
  ] = await db.transaction(
    'r',
    [
      db.decks,
      db.noteTypes,
      db.notes,
      db.cards,
      db.studySessions,
      db.reviewLogs,
      db.mediaFiles,
      db.missionProgress,
      db.userStats,
      ...PRACTICE_TABLES.map(name => db[name]),
    ],
    async () =>
      Promise.all([
        db.decks.toArray(),
        db.noteTypes.toArray(),
        db.notes.toArray(),
        db.cards.toArray(),
        db.studySessions.toArray(),
        db.reviewLogs.toArray(),
        db.mediaFiles.toArray(),
        db.missionProgress.toArray(),
        db.userStats.toArray(),
        Promise.all(PRACTICE_TABLES.map(async name => [name, await db[name].toArray()])),
      ]),
  );
  const practice = Object.fromEntries(practiceEntries) as PracticeBackup;

  const manifest: BackupManifest = {
    version: BACKUP_FORMAT_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    counts: {
      decks: decks.length,
      noteTypes: noteTypes.length,
      notes: notes.length,
      cards: cards.length,
      studySessions: studySessions.length,
      reviewLogs: reviewLogs.length,
      mediaFiles: mediaFiles.length,
      missionProgress: missionProgress.length,
      userStats: userStats.length,
      ...Object.fromEntries(PRACTICE_TABLES.map(name => [name, practice[name]?.length ?? 0])),
    },
  };

  const data: BackupData = {
    manifest,
    decks,
    noteTypes,
    notes,
    cards,
    studySessions,
    reviewLogs,
    missionProgress,
    userStats,
    ...practice,
  };

  zip.file('data.json', JSON.stringify(data));

  const mediaFolder = zip.folder('media');
  if (mediaFolder) {
    for (const media of mediaFiles) {
      mediaFolder.file(media.filename, media.data);
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function exportAndDownload(): Promise<void> {
  const blob = await exportBackup();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nong-liming-backup-${new Date().toISOString().slice(0, 10)}.nong`;
  a.click();
  URL.revokeObjectURL(url);
}

function isBackupData(obj: unknown): obj is BackupData {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as Record<string, unknown>;
  return (
    typeof data.manifest === 'object' &&
    data.manifest !== null &&
    Array.isArray(data.decks) &&
    Array.isArray(data.cards) &&
    Array.isArray(data.noteTypes) &&
    Array.isArray(data.notes) &&
    Array.isArray(data.studySessions) &&
    Array.isArray(data.reviewLogs) &&
    isPracticeBackup(data) &&
    (!('missionProgress' in data) ||
      (Array.isArray(data.missionProgress) &&
        data.missionProgress.every(isMissionProgress) &&
        new Set(data.missionProgress.map(row => row.id)).size === data.missionProgress.length)) &&
    (!('userStats' in data) ||
      (Array.isArray(data.userStats) && data.userStats.length <= 1 && data.userStats.every(isUserStats)))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAttempt(value: unknown): value is MissionAttempt {
  return (
    isRecord(value) &&
    isNonemptyString(value.exerciseId) &&
    isNonemptyString(value.skill) &&
    Array.isArray(value.selected) &&
    value.selected.every(isNonemptyString) &&
    typeof value.correct === 'boolean' &&
    typeof value.usedHint === 'boolean'
  );
}

function isMissionProgress(value: unknown): value is MissionProgress {
  if (!isRecord(value) || !isRecord(value.run)) return false;
  const run = value.run;
  const validStructure =
    isNonemptyString(value.id) &&
    isNonemptyString(value.missionId) &&
    isCount(value.updatedAt) &&
    isCount(value.completedRuns) &&
    isCount(value.bestIndependent) &&
    (value.lastCompletedAt === undefined || isCount(value.lastCompletedAt)) &&
    (value.lastIndependent === undefined || isCount(value.lastIndependent)) &&
    isCount(run.index) &&
    typeof run.started === 'boolean' &&
    typeof run.completed === 'boolean' &&
    typeof run.hintUsed === 'boolean' &&
    (run.feedback === null || isAttempt(run.feedback)) &&
    Array.isArray(run.attempts) &&
    run.attempts.every(isAttempt);
  if (!validStructure) return false;
  const progress = value as unknown as MissionProgress;
  const mission = MISSIONS.find(item => item.id === progress.missionId);
  // Retain unknown mission data for compatibility with later course catalogs.
  if (!mission) return true;
  if (progress.run.index >= mission.exercises.length) return false;
  const validAttempt = (attempt: MissionAttempt) => {
    const exercise = mission.exercises.find(item => item.id === attempt.exerciseId);
    return (
      exercise !== undefined &&
      attempt.selected.length > 0 &&
      new Set(attempt.selected).size === attempt.selected.length &&
      attempt.selected.every(id => exercise.options.some(option => option.id === id))
    );
  };
  if (!progress.run.attempts.every(validAttempt)) return false;
  const feedback = progress.run.feedback;
  if (feedback && !validAttempt(feedback)) return false;
  // Recall days rotate exercises, so only core lessons share the catalog's index order.
  const isCoreLesson = progress.id === `lesson-${mission.id}` || progress.id === mission.id;
  return !feedback || !isCoreLesson || feedback.exerciseId === mission.exercises[progress.run.index].id;
}

function isUserStats(value: unknown): value is UserStats {
  if (!isRecord(value)) return false;
  return (
    value.id === 1 &&
    [
      'dailyGoal',
      'freezeTokens',
      'cardsReviewedToday',
      'dokKemCount',
      'yaPraekCount',
      'khaoTokCount',
      'dokMaKhueCount',
    ].every(field => isCount(value[field])) &&
    typeof value.lastStudyDate === 'string' &&
    (value.lastStudyDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(value.lastStudyDate)) &&
    typeof value.playbackSpeed === 'number' &&
    Number.isFinite(value.playbackSpeed) &&
    value.playbackSpeed > 0 &&
    (value.courseDuration === undefined ||
      value.courseDuration === 30 ||
      value.courseDuration === 45 ||
      value.courseDuration === 60)
  );
}

export async function importBackup(file: File): Promise<{ deckCount: number; cardCount: number; mediaCount: number }> {
  const zip = await JSZip.loadAsync(file);

  const dataFile = zip.file('data.json');
  if (!dataFile) {
    throw new Error('Invalid backup: missing data.json');
  }

  const rawJson = await dataFile.async('text');
  const data: unknown = JSON.parse(rawJson);

  if (!isBackupData(data)) {
    throw new Error('Invalid backup: data.json has an unexpected structure');
  }

  const mediaEntries: { filename: string; blob: Blob; mimeType: string; deckId: number }[] = [];
  const mediaFolder = zip.folder('media');

  if (mediaFolder) {
    const mediaPromises: Promise<void>[] = [];

    mediaFolder.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      const filename = relativePath;

      mediaPromises.push(
        zipEntry.async('blob').then(blob => {
          const ext = filename.split('.').pop()?.toLowerCase() ?? '';
          const mimeMap: Record<string, string> = {
            mp3: 'audio/mpeg',
            ogg: 'audio/ogg',
            wav: 'audio/wav',
            m4a: 'audio/mp4',
            flac: 'audio/flac',
            webm: 'audio/webm',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            svg: 'image/svg+xml',
            webp: 'image/webp',
            mp4: 'video/mp4',
          };
          const mimeType = mimeMap[ext] ?? 'application/octet-stream';

          mediaEntries.push({ filename, blob, mimeType, deckId: 0 });
        }),
      );
    });

    await Promise.all(mediaPromises);
  }

  const mediaDeckMap = new Map<string, number>();
  if (Array.isArray(data.notes)) {
    for (const note of data.notes as { deckId?: number; fields?: Record<string, string> }[]) {
      if (!note.fields || !note.deckId) continue;
      for (const value of Object.values(note.fields)) {
        const soundMatches = value.matchAll(/\[sound:([^\]]+)\]/g);
        for (const match of soundMatches) {
          mediaDeckMap.set(match[1].trim(), note.deckId);
        }
        const imgMatches = value.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
        for (const match of imgMatches) {
          mediaDeckMap.set(match[1].trim(), note.deckId);
        }
      }
    }
  }

  for (const entry of mediaEntries) {
    entry.deckId = mediaDeckMap.get(entry.filename) ?? 0;
  }

  await db.transaction(
    'rw',
    [
      db.decks,
      db.noteTypes,
      db.notes,
      db.cards,
      db.studySessions,
      db.reviewLogs,
      db.mediaFiles,
      db.missionProgress,
      db.userStats,
      ...PRACTICE_TABLES.map(name => db[name]),
    ],
    async () => {
      await db.mediaFiles.clear();
      await db.reviewLogs.clear();
      await db.studySessions.clear();
      await db.cards.clear();
      await db.notes.clear();
      await db.noteTypes.clear();
      await db.decks.clear();

      if (data.decks.length > 0)
        await db.decks.bulkAdd(rehydrateDates(data.decks, ['createdAt', 'updatedAt']) as never[]);
      if (data.noteTypes.length > 0)
        await db.noteTypes.bulkAdd(rehydrateDates(data.noteTypes, ['createdAt']) as never[]);
      if (data.notes.length > 0)
        await db.notes.bulkAdd(rehydrateDates(data.notes, ['createdAt', 'updatedAt']) as never[]);
      if (data.cards.length > 0)
        await db.cards.bulkAdd(rehydrateDates(data.cards, ['nextReview', 'createdAt', 'updatedAt']) as never[]);
      if (data.studySessions.length > 0)
        await db.studySessions.bulkAdd(
          rehydrateDates(data.studySessions, ['startedAt', 'lastActiveAt', 'completedAt']) as never[],
        );
      if (data.reviewLogs.length > 0)
        await db.reviewLogs.bulkAdd(rehydrateDates(data.reviewLogs, ['reviewedAt']) as never[]);

      // Missing optional tables mean a legacy backup: retain this device's course and settings.
      if (data.missionProgress !== undefined) {
        await db.missionProgress.clear();
        if (data.missionProgress.length > 0) await db.missionProgress.bulkAdd(data.missionProgress);
      }
      if (data.userStats !== undefined) {
        await db.userStats.clear();
        if (data.userStats.length > 0) await db.userStats.bulkAdd(data.userStats);
      }

      // Absent optional tables belong to older formats and must remain intact.
      for (const name of PRACTICE_TABLES) {
        const rows = data[name];
        if (rows !== undefined) {
          await db[name].clear();
          if (rows.length)
            await (db[name] as unknown as Table<Record<string, unknown>>).bulkAdd(restorePracticeDates(name, rows));
        }
      }

      for (const entry of mediaEntries) {
        await db.mediaFiles.put({
          filename: entry.filename,
          data: entry.blob,
          mimeType: entry.mimeType,
          deckId: entry.deckId,
          createdAt: new Date(),
        });
      }
    },
  );

  return {
    deckCount: data.decks.length,
    cardCount: data.cards.length,
    mediaCount: mediaEntries.length,
  };
}
