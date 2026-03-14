import { createNoteAndCard, db, getOrCreateDefaultNoteType } from '@/lib/db';
import type { Deck } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DictionaryEntryData } from './dictionaryData';

interface AddFromDictionaryDialogProps {
  open: boolean;
  entry: DictionaryEntryData | null;
  onClose: () => void;
  onAdded: () => void;
}

export function AddFromDictionaryDialog({ open, entry, onClose, onAdded }: AddFromDictionaryDialogProps) {
  const decks = useLiveQuery<Deck[]>(() => db.decks.orderBy('createdAt').reverse().toArray());
  const [selectedDeckId, setSelectedDeckId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (decks && decks.length > 0 && selectedDeckId === '') {
      setSelectedDeckId(decks[0].id ?? '');
    }
  }, [decks, selectedDeckId]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!entry || selectedDeckId === '' || saving) return;

    setSaving(true);
    try {
      const noteTypeId = await getOrCreateDefaultNoteType();

      const front = entry.word;
      const back = `<p><strong>${entry.meaning}</strong></p><p><em>Pronunciation:</em> ${entry.pronunciation}</p><p><em>Example:</em> ${entry.example}</p>`;

      await createNoteAndCard(noteTypeId, selectedDeckId, {
        Front: front,
        Back: back,
      });
      onAdded();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && entry && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Add to Deck</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form
              onSubmit={e => {
                void handleSubmit(e);
              }}
              className="space-y-4"
            >
              <div className="p-4 bg-muted/30 rounded-xl mb-4">
                <p className="text-lg font-bold text-primary mb-1">{entry.word}</p>
                <p className="text-sm text-foreground">{entry.meaning}</p>
                <p className="text-xs text-muted-foreground mt-1">{entry.pronunciation}</p>
              </div>

              <div>
                <label htmlFor="deck-select" className="block text-sm font-medium text-foreground mb-1.5">
                  Select Deck
                </label>
                {decks && decks.length > 0 ? (
                  <select
                    id="deck-select"
                    value={selectedDeckId}
                    onChange={e => {
                      setSelectedDeckId(Number(e.target.value));
                    }}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    required
                  >
                    {decks.map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-destructive">You must create a deck first.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedDeckId === '' || saving || decks?.length === 0}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
