import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { db } from '../../lib/db';

interface CreateDeckDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDeckDialog({ open, onClose }: CreateDeckDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const now = new Date();
      await db.decks.add({
        name: name.trim(),
        description: description.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
      setName('');
      setDescription('');
      onClose();
    } finally {
      setSaving(false);
    }
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
            onClick={onClose}
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
              <h2 className="text-xl font-bold text-foreground">Create New Deck</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
              <div>
                <label htmlFor="deck-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Deck Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="deck-name"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                  }}
                  placeholder="e.g. Thai Vocabulary"
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="deck-description" className="block text-sm font-medium text-foreground mb-1.5">
                  Description <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <textarea
                  id="deck-description"
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                  }}
                  placeholder="What is this deck about?"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                />
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
                  disabled={!name.trim() || saving}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creating...' : 'Create Deck'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
