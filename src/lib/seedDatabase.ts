import { db, getOrCreateDefaultNoteType, createNoteAndCard } from './db';
import { consonants } from '../data/consonants';
import { vowels } from '../data/vowels';
import { DEFAULT_DECK_CONFIG } from '../types/flashcard';

export async function seedDatabaseForBeginner(): Promise<void> {
  const existingDeck = await db.decks.where('name').equals('Thai Starter Deck').first();
  if (existingDeck) {
    return;
  }

  const now = new Date();
  const deckId = await db.decks.add({
    name: 'Thai Starter Deck',
    createdAt: now,
    updatedAt: now,
    ...DEFAULT_DECK_CONFIG,
  } as any);

  const noteTypeId = await getOrCreateDefaultNoteType();

  // Seed first 10 consonants
  for (const c of consonants.slice(0, 10)) {
    await createNoteAndCard(noteTypeId, deckId!, {
      Front: c.thaiChar,
      Back: `${c.thaiName} - ${c.startSound} / ${c.finalSound}`,
    });
  }

  // Seed first 10 vowels
  for (const v of vowels.slice(0, 10)) {
    await createNoteAndCard(noteTypeId, deckId!, {
      Front: v.thaiChar,
      Back: `${v.thaiName} - ${v.english}`,
    });
  }
}
