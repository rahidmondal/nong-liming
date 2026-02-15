import { useToast } from '@/components/toast-provider';
import { parseApkgFile } from '@/lib/apkg-parser';
import { db } from '@/lib/db';
import { importApkgToDb } from '@/lib/import-utils';
import { getTodaysCounts } from '@/lib/study-session';
import type { Deck } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Download,
  FileUp,
  Layers,
  Library,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddCardDialog } from './AddCardDialog';
import { CreateDeckDialog } from './CreateDeckDialog';
import { ImportDialog } from './ImportDialog';
import { RenameDeckDialog } from './RenameDeckDialog';

import thai1000Url from '@/assets/Thai_1000_Common_Words_incl_Audio_Phonetics_Examples.apkg?url';
import thaiReadUrl from '@/assets/Thai_Read_Hear_Translate.apkg?url';

export function DecksPage() {
  const decks = useLiveQuery<Deck[]>(() => db.decks.orderBy('createdAt').reverse().toArray());

  const cardCounts = useLiveQuery<
    Record<number, { total: number; newCount: number; learningCount: number; reviewCount: number }>
  >(async () => {
    if (!decks) return {};
    const counts: Record<number, { total: number; newCount: number; learningCount: number; reviewCount: number }> = {};
    const now = new Date();
    for (const deck of decks) {
      const deckId = deck.id;
      if (deckId === undefined) continue;
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      const { newToday, reviewToday } = await getTodaysCounts(deckId);

      let newCount = 0;
      let learningCount = 0;
      let reviewCount = 0;

      const remainingNew = Math.max(0, deck.newCardsPerDay - newToday);
      const remainingReview = Math.max(0, deck.reviewCardsPerDay - reviewToday);

      let newSoFar = 0;
      let reviewSoFar = 0;

      for (const card of allCards) {
        if (card.status === 'learning' || card.status === 'relearning') {
          if (card.nextReview <= now) learningCount++;
        } else if (card.status === 'review') {
          if (card.nextReview <= now && reviewSoFar < remainingReview) {
            reviewCount++;
            reviewSoFar++;
          }
        } else if (newSoFar < remainingNew) {
          newCount++;
          newSoFar++;
        }
      }

      counts[deckId] = { total: allCards.length, newCount, learningCount, reviewCount };
    }
    return counts;
  }, [decks]);

  const isLoading = decks === undefined;

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [addCardDeckId, setAddCardDeckId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [renameDeck, setRenameDeck] = useState<{ id: number; name: string } | null>(null);
  const [isImportingSamples, setIsImportingSamples] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleDeleteDeck = async (deckId: number) => {
    await db.cards.where('deckId').equals(deckId).delete();
    await db.notes.where('deckId').equals(deckId).delete();
    await db.reviewLogs.where('deckId').equals(deckId).delete();
    await db.decks.delete(deckId);
    setConfirmDeleteId(null);
    toast.show('Deck deleted', { type: 'success' });
  };

  const handleLoadSamples = async () => {
    if (isImportingSamples) return;
    setIsImportingSamples(true);
    const toastId = toast.show('Loading sample decks...', { type: 'loading', persistent: true });

    try {
      const samples = [
        { name: 'Thai 1000 Words', url: thai1000Url },
        { name: 'Thai Read & Hear', url: thaiReadUrl },
      ];

      let importedCount = 0;

      for (const sample of samples) {
        toast.update(toastId, { detail: `Downloading ${sample.name}...` });
        const resp = await fetch(sample.url);
        if (!resp.ok) throw new Error(`Failed to fetch ${sample.name}`);
        const blob = await resp.blob();
        const file = new File([blob], sample.name + '.apkg');

        toast.update(toastId, { detail: `Parsing ${sample.name}...` });
        const parsed = await parseApkgFile(file);

        toast.update(toastId, { detail: `Importing ${sample.name}...` });
        await importApkgToDb(parsed, _count => {
          // Optional: update detail with card count
        });
        importedCount++;
      }

      toast.update(toastId, {
        type: 'success',
        message: 'Sample decks loaded!',
        detail: `Successfully imported ${String(importedCount)} decks.`,
        persistent: false,
      });
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        type: 'error',
        message: 'Failed to load samples',
        detail: e instanceof Error ? e.message : 'Unknown error',
        persistent: false,
      });
    } finally {
      setIsImportingSamples(false);
    }
  };

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
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto relative">
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
        <Link
          to="/stats"
          className="p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-primary"
          aria-label="View statistics"
        >
          <BarChart3 className="w-5 h-5" />
        </Link>
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
              <p className="text-muted-foreground text-sm max-w-65">
                Create your first flashcard deck or import an Anki (.apkg) file to get started.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-65">
              <button
                onClick={() => {
                  setShowCreateDeck(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Deck
              </button>
              <button
                onClick={() => {
                  setShowImport(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-card text-foreground rounded-xl font-medium border border-border shadow-sm hover:shadow-md transition-all"
              >
                <FileUp className="w-4 h-4" />
                Import .apkg
              </button>
              <button
                onClick={() => void handleLoadSamples()}
                disabled={isImportingSamples}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-card text-foreground rounded-xl font-medium border border-border shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isImportingSamples ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Load Sample Decks
              </button>
            </div>
          </motion.div>
        )}

        {/* Deck List */}
        {!isLoading && decks.length > 0 && (
          <>
            {/* Action buttons bar */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setShowCreateDeck(true);
                }}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                New Deck
              </button>
              <button
                onClick={() => {
                  setShowImport(true);
                }}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl font-medium border border-border shadow-sm hover:shadow-md transition-all text-sm"
              >
                <FileUp className="w-4 h-4" />
                Import
              </button>
            </div>

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3 pb-20">
              {decks.map(deck => {
                const deckId = deck.id;
                const counts = deckId !== undefined ? cardCounts?.[deckId] : undefined;
                const isConfirmingDelete = deckId !== undefined && confirmDeleteId === deckId;
                return (
                  <motion.div key={deckId} variants={item}>
                    <div className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div
                        className="flex items-center flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          if (deckId !== undefined) void navigate(`/decks/${String(deckId)}/study`);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                          if ((e.key === 'Enter' || e.key === ' ') && deckId !== undefined)
                            void navigate(`/decks/${String(deckId)}/study`);
                        }}
                      >
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{deck.name}</h3>
                          {deck.description && (
                            <p className="text-sm text-muted-foreground truncate">{deck.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {counts?.total ?? '...'} cards
                            </span>
                            {counts && counts.newCount + counts.learningCount + counts.reviewCount > 0 && (
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3" />
                                <span className="text-blue-500">{counts.newCount}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-orange-500">{counts.learningCount}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-emerald-500">{counts.reviewCount}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {deckId !== undefined && !isConfirmingDelete && (
                        <div className="relative z-10 flex items-center gap-1 pl-2">
                          <button
                            onClick={() => {
                              setAddCardDeckId(deckId);
                            }}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            aria-label={`Add card to ${deck.name}`}
                            title="Add Card"
                          >
                            <Plus className="w-5 h-5 text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setRenameDeck({ id: deckId, name: deck.name });
                            }}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            aria-label={`Rename ${deck.name}`}
                            title="Rename"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(deckId);
                            }}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            aria-label={`Delete ${deck.name}`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}

                      {/* Delete confirmation */}
                      {isConfirmingDelete && (
                        <div className="relative z-10 flex items-center gap-2 pl-2">
                          <span className="text-xs text-destructive font-medium hidden sm:inline">Delete?</span>
                          <button
                            onClick={() => void handleDeleteDeck(deckId)}
                            className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium hover:bg-destructive/90 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(null);
                            }}
                            className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </main>

      {/* Dialogs */}
      <CreateDeckDialog
        open={showCreateDeck}
        onClose={() => {
          setShowCreateDeck(false);
        }}
      />
      <ImportDialog
        open={showImport}
        onClose={() => {
          setShowImport(false);
        }}
      />
      <RenameDeckDialog
        deckId={renameDeck?.id ?? null}
        currentName={renameDeck?.name ?? ''}
        onClose={() => {
          setRenameDeck(null);
        }}
      />
      {addCardDeckId !== null && (
        <AddCardDialog
          open
          deckId={addCardDeckId}
          onClose={() => {
            setAddCardDeckId(null);
          }}
        />
      )}
    </div>
  );
}
