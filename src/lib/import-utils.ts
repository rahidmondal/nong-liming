import { DEFAULT_DECK_CONFIG, DEFAULT_EASE_FACTOR } from '@/types/flashcard';
import { type ParsedApkg } from './apkg-parser';
import { db, getOrCreateDefaultNoteType, storeMediaFile } from './db';

export async function importApkgToDb(parsedResult: ParsedApkg, onProgress: (count: number) => void): Promise<number> {
  let totalCards = 0;

  const modelIdMap = new Map<string, number>();

  for (const model of parsedResult.models) {
    const noteTypeId = await db.noteTypes.add({
      name: model.name,
      fields: model.fields.map(f => f.name),
      questionTemplate: model.templates[0]?.qfmt ?? '{{Front}}',
      answerTemplate: model.templates[0]?.afmt ?? '{{FrontSide}}<hr id="answer">{{Back}}',
      css: model.css,
      createdAt: new Date(),
    });
    if (noteTypeId === undefined) throw new Error('Failed to add NoteType');
    modelIdMap.set(model.id, noteTypeId);
  }

  const defaultNoteTypeId = await getOrCreateDefaultNoteType();

  for (const parsedDeck of parsedResult.decks) {
    const now = new Date();
    const deckId = await db.decks.add({
      name: parsedDeck.name,
      createdAt: now,
      updatedAt: now,
      ...DEFAULT_DECK_CONFIG,
    });
    if (deckId === undefined) throw new Error('Failed to add Deck');

    const batchSize = 50;
    const notes = parsedDeck.notes;

    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);

      for (const parsedNote of batch) {
        const noteTypeId = modelIdMap.get(parsedNote.modelId) ?? defaultNoteTypeId;

        const noteId = await db.notes.add({
          noteTypeId,
          deckId,
          fields: parsedNote.fields,
          tags: [],
          createdAt: now,
          updatedAt: now,
        });

        await db.cards.add({
          noteId: noteId ?? 0,
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

        totalCards++;
      }

      onProgress(totalCards);

      await new Promise(resolve => {
        setTimeout(resolve, 0);
      });
    }
  }

  const firstDeckId = await db.decks
    .toCollection()
    .last()
    .then(d => d?.id);
  const targetDeckId = firstDeckId ?? 0;

  if (parsedResult.availableMedia.length > 0) {
    const mediaFiles = parsedResult.availableMedia;
    const mediaBatchSize = 10;

    for (let i = 0; i < mediaFiles.length; i += mediaBatchSize) {
      const batch = mediaFiles.slice(i, i + mediaBatchSize);
      await Promise.all(
        batch.map(async filename => {
          try {
            const blob = await parsedResult.getMediaBlob(filename);
            if (blob) {
              await storeMediaFile(filename, blob, blob.type, targetDeckId);
            }
          } catch (e) {
            console.warn(`Failed to import media: ${filename}`, e);
          }
        }),
      );

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return totalCards;
}
