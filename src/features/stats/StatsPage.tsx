import type { DailyReviewCount, DeckStats, OverallStats } from '@/features/stats/lib/stats';
import { getDailyReviews, getDeckStats, getOverallStats } from '@/features/stats/lib/stats';
import { db } from '@/lib/db';
import type { UserStats } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, BookOpen, Flame, Layers, Snowflake, Star, Target, TrendingUp, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function StatsPage() {
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [daily, setDaily] = useState<DailyReviewCount[]>([]);
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userStats = useLiveQuery<UserStats | undefined>(() => db.userStats.get(1));

  const loadStats = useCallback(async () => {
    const [o, d, ds] = await Promise.all([getOverallStats(), getDailyReviews(30), getDeckStats()]);
    setOverall(o);
    setDaily(d);
    setDeckStats(ds);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const maxDailyCount = Math.max(...daily.map(d => d.count), 1);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto">
      {/* Header */}
      <header className="w-full flex items-center gap-3 py-6">
        <Link to="/decks" className="p-2 -ml-2 rounded-lg hover:bg-card transition-colors" aria-label="Back to decks">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-primary font-sarabun flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Statistics
        </h1>
      </header>

      <main className="flex-1 w-full flex flex-col gap-6 mt-2">
        {/* Overview Cards */}
        {overall && (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
            <motion.div variants={item} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-medium">Total Cards</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{overall.totalCards}</p>
            </motion.div>

            <motion.div variants={item} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Star className="w-4 h-4" />
                <span className="text-xs font-medium">Reviews</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{overall.totalReviews}</p>
            </motion.div>

            <motion.div variants={item} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {overall.currentStreak}
                <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
              </p>
            </motion.div>

            <motion.div variants={item} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{overall.reviewsToday}</p>
            </motion.div>
          </motion.div>
        )}

        {/* Gamification Stats */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Daily Goal</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {userStats.cardsReviewedToday} / {userStats.dailyGoal}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${String(Math.min(100, (userStats.cardsReviewedToday / userStats.dailyGoal) * 100))}%`,
                    }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                {userStats.cardsReviewedToday >= userStats.dailyGoal && (
                  <p className="text-[10px] text-emerald-500 font-medium">Goal Met! Streak secured.</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Snowflake className="w-5 h-5" />
                <span className="font-semibold">Freeze Tokens</span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-2xl font-bold text-foreground">{userStats.freezeTokens}</span>
                <span className="text-sm text-muted-foreground pb-0.5">/ 3 max</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Protects your streak if you miss a day.</p>
            </div>
          </motion.div>
        )}

        {/* Card Status Breakdown */}
        {overall && overall.totalCards > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Card Breakdown
            </h2>
            <div className="space-y-3">
              {(
                [
                  { label: 'New', count: overall.cardBreakdown.new, color: 'bg-blue-500' },
                  {
                    label: 'Learning',
                    count: overall.cardBreakdown.learning,
                    color: 'bg-orange-500',
                  },
                  { label: 'Review', count: overall.cardBreakdown.review, color: 'bg-emerald-500' },
                ] as const
              ).map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium text-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${s.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${String((s.count / overall.totalCards) * 100)}%`,
                      }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity Chart (last 30 days) */}
        {daily.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Last 30 Days
            </h2>
            <div className="flex items-end gap-0.75 h-24">
              {daily.map(d => {
                const height = d.count > 0 ? Math.max(8, (d.count / maxDailyCount) * 100) : 4;
                const dayLabel = new Date(d.date).toLocaleDateString('en', { weekday: 'narrow' });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {d.count} reviews
                    </div>
                    <motion.div
                      className={`w-full rounded-sm ${d.count > 0 ? 'bg-primary' : 'bg-muted'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${String(height)}%` }}
                      transition={{ duration: 0.4, delay: 0.02 }}
                    />
                    {/* Show day letter every 7 days */}
                    {daily.indexOf(d) % 7 === 0 && (
                      <span className="text-[9px] text-muted-foreground mt-1">{dayLabel}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Per-Deck Stats */}
        {deckStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 pb-6"
          >
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Per Deck
            </h2>
            {deckStats.map(ds => (
              <div key={ds.deckId} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-medium text-foreground truncate">{ds.deckName}</h3>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">{ds.totalCards}</span> cards
                  </span>
                  <span className="text-blue-500">{ds.newCards} new</span>
                  <span className="text-orange-500">{ds.learningCards} learning</span>
                  <span className="text-emerald-500">{ds.reviewCards} review</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Avg Ease: {ds.averageEase.toFixed(2)}</span>
                  {ds.totalCards > 0 && (
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${String((ds.reviewCards / ds.totalCards) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
