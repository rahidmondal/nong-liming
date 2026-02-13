import { db } from '@/lib/db';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RenameDeckDialogProps {
  deckId: number | null;
  currentName: string;
  onClose: () => void;
}

export function RenameDeckDialog({ deckId, currentName, onClose }: RenameDeckDialogProps) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  useEffect(() => {
    if (deckId !== null) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [deckId]);

  const handleSave = async () => {
    if (deckId === null || !name.trim()) return;
    await db.decks.update(deckId, { name: name.trim() });
    onClose();
  };

  return (
    <AnimatePresence>
      {deckId !== null && (
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-card rounded-2xl border border-border shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Rename Deck</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="rename-input" className="text-sm font-medium text-foreground">
                  Deck Name
                </label>
                <input
                  ref={inputRef}
                  id="rename-input"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      void handleSave();
                    }
                  }}
                  className="w-full px-3 py-2 bg-input rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Thai Vocabulary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleSave()}
                  disabled={!name.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4 inline-block mr-2" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
