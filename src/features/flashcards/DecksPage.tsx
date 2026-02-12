import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Layers, Library, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from '../../components/mode-toggle';
import { db } from '../../lib/db';
import type { Deck } from '../../types/flashcard';

export function DecksPage() {
  const decks = useLiveQuery<Deck[]>(() => db.decks.orderBy('createdAt').reverse().toArray());

  const cardCounts = useLiveQuery<Record<number, { total: number; due: number }>>(async () => {
    if (!decks) return {};
    const counts: Record<number, { total: number; due: number }> = {};
    const now = new Date();
    for (const deck of decks) {
      const deckId = deck.id;
      if (deckId === undefined) continue;
      const total = await db.cards.where('deckId').equals(deckId).count();
      const due = await db.cards
        .where('deckId')
        .equals(deckId)
        .filter(card => card.nextReview <= now || card.status === 'new')
        .count();
      counts[deckId] = { total, due };
    }
    return counts;
  }, [decks]);

  const isLoading = decks === undefined;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 max-w-md mx-auto relative">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-card transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-primary font-sarabun flex items-center gap-2">
            <Library className="w-6 h-6" />
            My Decks
          </h1>
        </div>
        <ModeToggle />
      </header>

      <main className="flex-1 w-full flex flex-col gap-6 mt-2">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && decks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-16"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-emerald-400/20 to-primary/20 flex items-center justify-center border border-border">
                <Layers className="w-10 h-10 text-primary/60" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">No decks yet</h2>
              <p className="text-muted-foreground text-sm max-w-[260px]">
                Create your first flashcard deck or import an Anki (.apkg) file to get started.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all opacity-60 cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create Deck
              </button>
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-3 bg-card text-foreground rounded-xl font-medium border border-border shadow-sm hover:shadow-md transition-all opacity-60 cursor-not-allowed"
              >
                Import .apkg
              </button>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">Import &amp; Create features coming in Phase 2</p>
          </motion.div>
        )}

        {/* Deck List */}
        {!isLoading && decks.length > 0 && (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {decks.map(deck => {
              const deckId = deck.id;
              const counts = deckId !== undefined ? cardCounts?.[deckId] : undefined;
              return (
                <motion.div key={deckId} variants={item}>
                  <div className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{deck.name}</h3>
                      {deck.description && <p className="text-sm text-muted-foreground truncate">{deck.description}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {counts?.total ?? '...'} cards
                        </span>
                        {(counts?.due ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-accent font-medium">
                            <Clock className="w-3 h-3" />
                            {counts?.due} due
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
