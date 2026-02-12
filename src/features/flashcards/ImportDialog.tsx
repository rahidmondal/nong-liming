import { AnimatePresence, motion } from 'framer-motion';
import { FileUp, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { parseApkgFile, type ParsedDeck } from '../../lib/apkg-parser';
import { db } from '../../lib/db';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ImportStep = 'select' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>('select');
  const [parsedDecks, setParsedDecks] = useState<ParsedDeck[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const resetState = () => {
    setStep('select');
    setParsedDecks([]);
    setErrorMessage('');
    setImportedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('parsing');
    try {
      const decks = await parseApkgFile(file);
      if (decks.length === 0) {
        setErrorMessage('No cards found in this .apkg file.');
        setStep('error');
        return;
      }
      setParsedDecks(decks);
      setStep('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse .apkg file.';
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    try {
      let totalCards = 0;
      for (const parsedDeck of parsedDecks) {
        const now = new Date();
        const deckId = await db.decks.add({
          name: parsedDeck.name,
          createdAt: now,
          updatedAt: now,
        });

        const cards = parsedDeck.cards.map(card => ({
          deckId: Number(deckId),
          front: card.front,
          back: card.back,
          status: 'new' as const,
          nextReview: now,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          createdAt: now,
          updatedAt: now,
        }));

        await db.cards.bulkAdd(cards);
        totalCards += cards.length;
      }
      setImportedCount(totalCards);
      setStep('done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import cards.';
      setErrorMessage(message);
      setStep('error');
    }
  };

  const totalCards = parsedDecks.reduce((sum, d) => sum + d.cards.length, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Import .apkg</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Step: Select File */}
            {step === 'select' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an Anki deck file (.apkg) to import your flashcards.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apkg"
                  onChange={e => void handleFileSelect(e)}
                  className="hidden"
                  id="apkg-file-input"
                />
                <label
                  htmlFor="apkg-file-input"
                  className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <FileUp className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Click to select .apkg file</span>
                  <span className="text-xs text-muted-foreground">Supports Anki 2.x deck files</span>
                </label>
              </div>
            )}

            {/* Step: Parsing */}
            {step === 'parsing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Parsing deck file...</p>
              </div>
            )}

            {/* Step: Preview */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="bg-background rounded-xl border border-input p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Found:</p>
                  {parsedDecks.map((deck, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground truncate mr-2">{deck.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{deck.cards.length} cards</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span className="text-primary">{totalCards} cards</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleImport()}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Import {totalCards} Cards
                  </button>
                </div>
              </div>
            )}

            {/* Step: Importing */}
            {step === 'importing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Importing cards to your library...</p>
              </div>
            )}

            {/* Step: Done */}
            {step === 'done' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Import Complete!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Successfully imported {importedCount} cards across {parsedDecks.length} deck
                    {parsedDecks.length > 1 ? 's' : ''}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            )}

            {/* Step: Error */}
            {step === 'error' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Import Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
