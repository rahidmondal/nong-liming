import { consonants } from '../data/consonants';
import { vowels } from '../data/vowels';
import type { Deck } from '../types/flashcard';
import { DEFAULT_DECK_CONFIG } from '../types/flashcard';
import { createNoteAndCard, db, getOrCreateDefaultNoteType } from './db';

function toId(value: number | undefined): number {
  if (value === undefined) {
    throw new Error('Dexie add() returned undefined');
  }

  return value;
}

export async function seedDatabaseForBeginner(): Promise<void> {
  const existingDeck = await db.decks.where('name').equals('Thai Starter Deck').first();
  if (existingDeck) {
    return;
  }

  const now = new Date();
  const deckId = toId(
    await db.decks.add({
      name: 'Thai Starter Deck',
      createdAt: now,
      updatedAt: now,
      ...DEFAULT_DECK_CONFIG,
    } satisfies Omit<Deck, 'id'>),
  );

  const noteTypeId = await getOrCreateDefaultNoteType();

  // Seed first 10 consonants
  for (const c of consonants.slice(0, 10)) {
    await createNoteAndCard(noteTypeId, deckId, {
      Front: c.thaiChar,
      Back: `${c.thaiName} - ${c.startSound} / ${c.finalSound}`,
    });
  }

  // Seed first 10 vowels
  for (const v of vowels.slice(0, 10)) {
    await createNoteAndCard(noteTypeId, deckId, {
      Front: v.thaiChar,
      Back: `${v.thaiName} - ${v.english}`,
    });
  }
}
