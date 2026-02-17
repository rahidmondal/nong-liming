import { DEFAULT_DECK_CONFIG, DEFAULT_EASE_FACTOR } from '@/types/flashcard';
import { type ParsedApkg } from './apkg-parser';
import { db, getOrCreateDefaultNoteType, storeMediaFile } from './db';

export async function importApkgToDb(parsedResult: ParsedApkg, onProgress: (count: number) => void): Promise<number> {
  let totalCards = 0;
  const suffix = `_${Date.now().toString(36)}`;

  const renameMap = new Map<string, string>();
  for (const filename of parsedResult.availableMedia) {
    const ext = filename.split('.').pop() ?? '';
    const name = filename.replace(`.${ext}`, '');
    const newName = `${name}${suffix}.${ext}`;
    renameMap.set(filename, newName);
  }

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

  const mediaToDeckId = new Map<string, number>();

  for (const parsedDeck of parsedResult.decks) {
    const now = new Date();
    const deckId = await db.decks.add({
      name: parsedDeck.name,
      createdAt: now,
      updatedAt: now,
      ...DEFAULT_DECK_CONFIG,
    });
    if (deckId === undefined) throw new Error('Failed to add Deck');

    // Map original filenames to this deck, but we'll store them as new filenames later
    for (const ref of parsedDeck.mediaRefs) {
      mediaToDeckId.set(renameMap.get(ref) ?? ref, deckId);
    }

    const batchSize = 50;
    const notes = parsedDeck.notes;

    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);

      for (const parsedNote of batch) {
        const noteTypeId = modelIdMap.get(parsedNote.modelId) ?? defaultNoteTypeId;

        // 2. Replace media references in fields
        const processedFields: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsedNote.fields)) {
          let newValue = value;
          // Replace images: src="fname" -> src="fname_suffix"
          newValue = newValue.replace(
            /(<img[^>]+src=["'])([^"']+)["']/gi,
            (match: string, prefix: string, fname: string) => {
              const newName = renameMap.get(fname);
              return newName ? `${prefix}${newName}"` : match;
            },
          );
          // Replace sounds: [sound:fname] -> [sound:fname_suffix]
          newValue = newValue.replace(
            /(\[sound:)([^\]]+)(\])/gi,
            (match: string, prefix: string, fname: string, suffix: string) => {
              const newName = renameMap.get(fname);
              return newName ? `${prefix}${newName}${suffix}` : match;
            },
          );
          processedFields[key] = newValue;
        }

        const noteId = await db.notes.add({
          noteTypeId,
          deckId,
          fields: processedFields,
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

  const fallbackDeckId = await db.decks
    .toCollection()
    .last()
    .then(d => d?.id ?? 0);

  if (parsedResult.availableMedia.length > 0) {
    const mediaFiles = parsedResult.availableMedia;
    const mediaBatchSize = 10;

    for (let i = 0; i < mediaFiles.length; i += mediaBatchSize) {
      const batch = mediaFiles.slice(i, i + mediaBatchSize);
      await Promise.all(
        batch.map(async originalFilename => {
          try {
            const blob = await parsedResult.getMediaBlob(originalFilename);
            if (blob) {
              const newFilename = renameMap.get(originalFilename) ?? originalFilename;
              const targetDeckId = mediaToDeckId.get(newFilename) ?? fallbackDeckId;
              // 3. Store with new filename
              await storeMediaFile(newFilename, blob, blob.type, targetDeckId);
            }
          } catch (e) {
            console.warn(`Failed to import media: ${originalFilename}`, e);
          }
        }),
      );

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return totalCards;
}
