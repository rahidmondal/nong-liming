import { APP_VERSION } from '@/lib/constants';
import { db } from '@/lib/db';
import JSZip from 'jszip';

interface BackupManifest {
  version: string;
  appVersion: string;
  exportedAt: string;
  counts: {
    decks: number;
    noteTypes: number;
    notes: number;
    cards: number;
    studySessions: number;
    reviewLogs: number;
    mediaFiles: number;
  };
}

interface BackupData {
  manifest: BackupManifest;
  decks: unknown[];
  noteTypes: unknown[];
  notes: unknown[];
  cards: unknown[];
  studySessions: unknown[];
  reviewLogs: unknown[];
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

  const decks = await db.decks.toArray();
  const noteTypes = await db.noteTypes.toArray();
  const notes = await db.notes.toArray();
  const cards = await db.cards.toArray();
  const studySessions = await db.studySessions.toArray();
  const reviewLogs = await db.reviewLogs.toArray();
  const mediaFiles = await db.mediaFiles.toArray();

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
    Array.isArray(data.cards)
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
    [db.decks, db.noteTypes, db.notes, db.cards, db.studySessions, db.reviewLogs, db.mediaFiles],
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
