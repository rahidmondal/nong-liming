/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WeaknessDiagnostic() {
  const weakCards = useLiveQuery(async () => {
    const allCards = await db.cards.toArray();
    // Filter out unseen cards, we only drop cards with low ease or high lapses
    const active = allCards.filter(c => c.status !== 'new');

    // Sort by a rudimentary "weakness score": (300 - easeFactor) + (lapses * 20)
    const topCards = active
      .map(c => ({ card: c, score: 300 - c.easeFactor + c.lapses * 20 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // top 5 weakest
      .map(entry => entry.card);
      
    if (topCards.length === 0) return [];
    
    // Fetch associated notes to get front/back text
    const noteIds = topCards.map(c => c.noteId);
    const notes = await db.notes.where('id').anyOf(noteIds).toArray();
    const noteMap = new Map(notes.map(n => [n.id, n]));
    
    return topCards.map(c => {
      const note = noteMap.get(c.noteId);
      return {
        ...c,
        front: note?.fields['Front'] ?? 'Unknown',
        back: note?.fields['Back'] ?? 'Unknown'
      };
    });
  }, []);

  if (!weakCards || weakCards.length === 0) {
    return null;
  }

  // If the top 1 is perfectly fine (ease 250, 0 lapses), then we don't have weaknesses.
  if (weakCards[0].easeFactor >= 250 && weakCards[0].lapses === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground mb-4">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        Identified Weaknesses
      </h3>
      <div className="space-y-2">
        {weakCards.map(card => {
          // If a card is fine, don't show it in the weaknesses tab
          if (card.easeFactor >= 250 && card.lapses === 0) return null;

          return (
            <div
              key={card.id}
              className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground font-sarabun w-8 text-center">{card.front}</span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{card.back}</p>
                  <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                    Lapses: {card.lapses} • Ease: {(card.easeFactor / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <Link
                to={`/decks/${String(card.deckId)}/study`}
                className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg transition-colors"
                title="Study this deck"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
