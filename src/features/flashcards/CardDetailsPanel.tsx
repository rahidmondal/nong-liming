import { useCardHistory } from './useCardHistory';
import type { Card } from '@/types/flashcard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, History, TrendingUp, BarChart2 } from 'lucide-react';
import { useState } from 'react';

function formatEaseFactor(easeFactor: number): string {
  const decimal = (easeFactor / 100).toFixed(2);
  let label = 'Moderate';
  if (easeFactor < 150) label = 'Difficult';
  else if (easeFactor >= 250) label = 'Very Easy';
  else if (easeFactor >= 200) label = 'Easy';

  return `${decimal} (${label})`;
}

function getRatingColor(rating: number): string {
  switch (rating) {
    case 1:
      return 'text-red-500 bg-red-500/10';
    case 2:
      return 'text-orange-500 bg-orange-500/10';
    case 3:
      return 'text-emerald-500 bg-emerald-500/10';
    case 4:
      return 'text-blue-500 bg-blue-500/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return 'Again';
    case 2:
      return 'Hard';
    case 3:
      return 'Good';
    case 4:
      return 'Easy';
    default:
      return 'Unknown';
  }
}

function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CardDetailsPanel({ card }: { card: Card }) {
  const [isOpen, setIsOpen] = useState(false);
  const stats = useCardHistory(card.id);

  if (stats.isLoading) {
    return null;
  }

  return (
    <div className="w-full mt-4 bg-card border border-border shadow-sm rounded-xl overflow-hidden">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="w-4 h-4 text-muted-foreground" />
          Card History & Stats
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <BarChart2 className="w-3.5 h-3.5" /> Reviews
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {stats.reviewCount} <span className="text-sm font-medium text-muted-foreground">total</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{Math.round(stats.successRate)}% success rate</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Algorithm
                  </div>
                  <p className="text-sm font-medium text-foreground flex items-baseline gap-1">
                    Ease: <span className="text-primary font-bold">{formatEaseFactor(card.easeFactor)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Lapses: {card.lapses}</p>
                </div>
              </div>

              {/* Interval Progression */}
              {stats.intervalProgression.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Interval Progression
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {stats.intervalProgression.map((interval, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-md"
                      >
                        {interval}d
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Logs */}
              {stats.lastReviews.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Recent Reviews
                  </p>
                  <div className="space-y-1.5">
                    {stats.lastReviews.map(log => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs"
                      >
                        <span className="text-muted-foreground font-medium">{formatDate(log.reviewedAt)}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {log.previousInterval}d → {log.newInterval}d
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRatingColor(log.rating)}`}>
                            {getRatingLabel(log.rating)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.reviewCount === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No reviews yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
