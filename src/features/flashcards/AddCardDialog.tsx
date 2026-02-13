import { createNoteAndCard, getOrCreateDefaultNoteType } from '@/lib/db';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AddCardDialogProps {
  open: boolean;
  deckId: number;
  onClose: () => void;
}

export function AddCardDialog({ open, deckId, onClose }: AddCardDialogProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [saving, setSaving] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setSaving(true);
    try {
      const noteTypeId = await getOrCreateDefaultNoteType();
      await createNoteAndCard(noteTypeId, deckId, {
        Front: front.trim(),
        Back: back.trim(),
      });
      setFront('');
      setBack('');
      setAddedCount(c => c + 1);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAddedCount(0);
    setFront('');
    setBack('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Add Card</h2>
                {addedCount > 0 && (
                  <p className="text-xs text-accent font-medium mt-0.5">
                    {addedCount} card{addedCount > 1 ? 's' : ''} added
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
              <div>
                <label htmlFor="card-front" className="block text-sm font-medium text-foreground mb-1.5">
                  Front <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="card-front"
                  value={front}
                  onChange={e => {
                    setFront(e.target.value);
                  }}
                  placeholder="Question or prompt"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="card-back" className="block text-sm font-medium text-foreground mb-1.5">
                  Back <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="card-back"
                  value={back}
                  onChange={e => {
                    setBack(e.target.value);
                  }}
                  placeholder="Answer"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                >
                  Done
                </button>
                <button
                  type="submit"
                  disabled={!front.trim() || !back.trim() || saving}
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
