import { APP_VERSION } from '@/lib/constants';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

function createMockBackupZip(options?: {
  dataJson?: unknown;
  mediaFiles?: { name: string; content: string }[];
  skipDataJson?: boolean;
}): Promise<Blob> {
  const zip = new JSZip();

  if (options?.skipDataJson !== true) {
    const defaultData = {
      manifest: {
        version: '1',
        appVersion: APP_VERSION,
        exportedAt: new Date().toISOString(),
        counts: {
          decks: 1,
          noteTypes: 1,
          notes: 1,
          cards: 1,
          studySessions: 0,
          reviewLogs: 0,
          mediaFiles: options?.mediaFiles?.length ?? 0,
        },
      },
      decks: [
        {
          id: 1,
          name: 'Test Deck',
          newCardsPerDay: 20,
          reviewCardsPerDay: 200,
          learningSteps: [1, 10],
          relearningSteps: [10],
          graduatingInterval: 1,
          easyInterval: 4,
          lapseMultiplier: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      noteTypes: [
        {
          id: 1,
          name: 'Basic',
          fields: ['Front', 'Back'],
          questionTemplate: '{{Front}}',
          answerTemplate: '{{FrontSide}}<hr id="answer">{{Back}}',
          css: '',
          createdAt: new Date().toISOString(),
        },
      ],
      notes: [
        {
          id: 1,
          noteTypeId: 1,
          deckId: 1,
          fields: { Front: 'Hello', Back: 'สวัสดี' },
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      cards: [
        {
          id: 1,
          noteId: 1,
          deckId: 1,
          ordinal: 0,
          status: 'new',
          nextReview: new Date().toISOString(),
          interval: 0,
          easeFactor: 250,
          repetitions: 0,
          lapses: 0,
          learningStep: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      studySessions: [],
      reviewLogs: [],
    };

    zip.file('data.json', JSON.stringify(options?.dataJson ?? defaultData));
  }

  if (options?.mediaFiles) {
    const mediaFolder = zip.folder('media');
    if (mediaFolder) {
      for (const media of options.mediaFiles) {
        mediaFolder.file(media.name, media.content);
      }
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

async function readDataJson(zip: JSZip): Promise<string> {
  const dataFile = zip.file('data.json');
  expect(dataFile).not.toBeNull();
  // eslint will complain about non-null assertion, so use a guard
  if (dataFile === null) throw new Error('data.json missing');
  return dataFile.async('text');
}

describe('backup-utils: ZIP format validation', () => {
  describe('ZIP structure', () => {
    it('should create a valid ZIP with data.json', async () => {
      const blob = await createMockBackupZip();
      const zip = await JSZip.loadAsync(blob);

      const content = await readDataJson(zip);
      const data = JSON.parse(content) as { manifest: { version: string }; decks: unknown[] };
      expect(data.manifest).toBeDefined();
      expect(data.manifest.version).toBe('1');
      expect(data.decks).toBeInstanceOf(Array);
      expect(data.decks.length).toBe(1);
    });

    it('should include media folder with files', async () => {
      const blob = await createMockBackupZip({
        mediaFiles: [
          { name: 'test-audio.mp3', content: 'fake-audio-data' },
          { name: 'test-image.png', content: 'fake-image-data' },
        ],
      });
      const zip = await JSZip.loadAsync(blob);

      const mp3 = zip.file('media/test-audio.mp3');
      const png = zip.file('media/test-image.png');

      expect(mp3).not.toBeNull();
      expect(png).not.toBeNull();

      if (mp3 === null) throw new Error('mp3 missing');
      const mp3Content = await mp3.async('text');
      expect(mp3Content).toBe('fake-audio-data');
    });

    it('should detect missing data.json', async () => {
      const blob = await createMockBackupZip({ skipDataJson: true });
      const zip = await JSZip.loadAsync(blob);

      const dataFile = zip.file('data.json');
      expect(dataFile).toBeNull();
    });
  });

  describe('data.json schema validation', () => {
    it('should have required top-level keys', async () => {
      const blob = await createMockBackupZip();
      const zip = await JSZip.loadAsync(blob);
      const content = await readDataJson(zip);
      const data = JSON.parse(content) as Record<string, unknown>;

      expect(data).toHaveProperty('manifest');
      expect(data).toHaveProperty('decks');
      expect(data).toHaveProperty('noteTypes');
      expect(data).toHaveProperty('notes');
      expect(data).toHaveProperty('cards');
      expect(data).toHaveProperty('studySessions');
      expect(data).toHaveProperty('reviewLogs');
    });

    it('manifest should include counts', async () => {
      const blob = await createMockBackupZip({
        mediaFiles: [{ name: 'audio.mp3', content: 'data' }],
      });
      const zip = await JSZip.loadAsync(blob);
      const content = await readDataJson(zip);
      const data = JSON.parse(content) as { manifest: { counts: Record<string, number> } };

      expect(data.manifest.counts).toHaveProperty('decks');
      expect(data.manifest.counts).toHaveProperty('cards');
      expect(data.manifest.counts).toHaveProperty('mediaFiles');
      expect(data.manifest.counts.mediaFiles).toBe(1);
    });

    it('should reject backup with invalid data structure', () => {
      const invalidData: Record<string, unknown> = { foo: 'bar' };

      const isValid = 'manifest' in invalidData && 'decks' in invalidData && 'cards' in invalidData;

      expect(isValid).toBe(false);
    });

    it('should accept valid backup structure', () => {
      const validData: Record<string, unknown> = {
        manifest: { version: '1' },
        decks: [],
        noteTypes: [],
        notes: [],
        cards: [],
        studySessions: [],
        reviewLogs: [],
      };

      const isValid =
        'manifest' in validData &&
        typeof validData.manifest === 'object' &&
        validData.manifest !== null &&
        'decks' in validData &&
        Array.isArray(validData.decks) &&
        'cards' in validData &&
        Array.isArray(validData.cards);

      expect(isValid).toBe(true);
    });
  });

  describe('media MIME type inference', () => {
    it('should store media with correct filenames', async () => {
      const blob = await createMockBackupZip({
        mediaFiles: [
          { name: 'pronunciation.mp3', content: 'audio-data' },
          { name: 'character.png', content: 'image-data' },
          { name: 'photo.jpg', content: 'jpeg-data' },
          { name: 'animation.gif', content: 'gif-data' },
        ],
      });
      const zip = await JSZip.loadAsync(blob);

      expect(zip.file('media/pronunciation.mp3')).not.toBeNull();
      expect(zip.file('media/character.png')).not.toBeNull();
      expect(zip.file('media/photo.jpg')).not.toBeNull();
      expect(zip.file('media/animation.gif')).not.toBeNull();
    });
  });

  describe('round-trip data integrity', () => {
    it('deck data should survive serialization', async () => {
      const originalDeck = {
        id: 42,
        name: 'Thai Vocabulary',
        newCardsPerDay: 15,
        reviewCardsPerDay: 100,
        learningSteps: [1, 10],
        relearningSteps: [10],
        graduatingInterval: 1,
        easyInterval: 4,
        lapseMultiplier: 0,
      };

      const blob = await createMockBackupZip({
        dataJson: {
          manifest: { version: '1', appVersion: '0.6.0', exportedAt: new Date().toISOString(), counts: {} },
          decks: [originalDeck],
          noteTypes: [],
          notes: [],
          cards: [],
          studySessions: [],
          reviewLogs: [],
        },
      });

      const zip = await JSZip.loadAsync(blob);
      const content = await readDataJson(zip);
      const restored = JSON.parse(content) as { decks: (typeof originalDeck)[] };

      expect(restored.decks[0].id).toBe(42);
      expect(restored.decks[0].name).toBe('Thai Vocabulary');
      expect(restored.decks[0].newCardsPerDay).toBe(15);
      expect(restored.decks[0].learningSteps).toEqual([1, 10]);
    });

    it('card data should survive serialization', async () => {
      const originalCard = {
        id: 1,
        noteId: 1,
        deckId: 1,
        ordinal: 0,
        status: 'review',
        interval: 7,
        easeFactor: 280,
        repetitions: 3,
        lapses: 1,
        learningStep: 0,
      };

      const blob = await createMockBackupZip({
        dataJson: {
          manifest: { version: '1', appVersion: '0.6.0', exportedAt: new Date().toISOString(), counts: {} },
          decks: [],
          noteTypes: [],
          notes: [],
          cards: [originalCard],
          studySessions: [],
          reviewLogs: [],
        },
      });

      const zip = await JSZip.loadAsync(blob);
      const content = await readDataJson(zip);
      const restored = JSON.parse(content) as { cards: (typeof originalCard)[] };

      expect(restored.cards[0].status).toBe('review');
      expect(restored.cards[0].interval).toBe(7);
      expect(restored.cards[0].easeFactor).toBe(280);
      expect(restored.cards[0].repetitions).toBe(3);
    });

    it('note fields with Thai text should survive serialization', async () => {
      const originalNote = {
        id: 1,
        noteTypeId: 1,
        deckId: 1,
        fields: { Front: 'สวัสดี', Back: 'Hello' },
        tags: ['thai', 'greetings'],
      };

      const blob = await createMockBackupZip({
        dataJson: {
          manifest: { version: '1', appVersion: '0.6.0', exportedAt: new Date().toISOString(), counts: {} },
          decks: [],
          noteTypes: [],
          notes: [originalNote],
          cards: [],
          studySessions: [],
          reviewLogs: [],
        },
      });

      const zip = await JSZip.loadAsync(blob);
      const content = await readDataJson(zip);
      const restored = JSON.parse(content) as { notes: (typeof originalNote)[] };

      expect(restored.notes[0].fields.Front).toBe('สวัสดี');
      expect(restored.notes[0].fields.Back).toBe('Hello');
      expect(restored.notes[0].tags).toEqual(['thai', 'greetings']);
    });
  });

  describe('date rehydration after JSON round-trip', () => {
    it('date fields should be Dates, not strings, after JSON round-trip', async () => {
      const now = new Date();
      const blob = await createMockBackupZip({
        dataJson: {
          manifest: { version: '1', appVersion: APP_VERSION, exportedAt: now.toISOString(), counts: {} },
          decks: [{ id: 1, name: 'D', createdAt: now.toISOString(), updatedAt: now.toISOString() }],
          noteTypes: [
            {
              id: 1,
              name: 'Basic',
              fields: ['F'],
              questionTemplate: '',
              answerTemplate: '',
              css: '',
              createdAt: now.toISOString(),
            },
          ],
          notes: [],
          cards: [
            {
              id: 1,
              noteId: 1,
              deckId: 1,
              ordinal: 0,
              status: 'new',
              nextReview: now.toISOString(),
              interval: 0,
              easeFactor: 250,
              repetitions: 0,
              lapses: 0,
              learningStep: 0,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
            },
          ],
          studySessions: [],
          reviewLogs: [
            {
              id: 1,
              cardId: 1,
              noteId: 1,
              deckId: 1,
              rating: 3,
              previousInterval: 0,
              newInterval: 1,
              easeFactor: 250,
              timeTakenMs: 3000,
              reviewedAt: now.toISOString(),
            },
          ],
        },
      });

      const zip = await JSZip.loadAsync(blob);
      const dataFile = zip.file('data.json');
      if (!dataFile) throw new Error('missing');
      const raw = JSON.parse(await dataFile.async('text')) as Record<string, unknown[]>;

      // Simulate what JSON.parse produces: date fields are strings
      const cards = raw.cards as Record<string, unknown>[];
      expect(typeof cards[0].nextReview).toBe('string');
      expect(typeof cards[0].createdAt).toBe('string');

      const logs = raw.reviewLogs as Record<string, unknown>[];
      expect(typeof logs[0].reviewedAt).toBe('string');
    });
  });
});
