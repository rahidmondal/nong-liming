import { DailyChallengesPanel } from '@/features/dailyChallenges/DailyChallengesPanel';
import { Mascot } from '@/features/landing/components/Mascot';
import { getOverallStats, type OverallStats } from '@/features/stats/lib/stats';
import { useTutorial } from '@/lib/useTutorial';
import { motion } from 'framer-motion';
import { Flame, Layers, Play, Settings, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhanKhru } from '@/features/waikru/PhanKhru';

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start today's session!";
  if (streak === 1) return 'Great start! 🌱';
  if (streak <= 3) return 'Keep it up! 💪';
  if (streak <= 7) return 'On a roll! 🔥';
  if (streak <= 14) return 'Unstoppable! ⚡';
  if (streak <= 30) return "You're on fire! 🔥🔥";
  return 'Legendary! 🏆';
}

export function LandingPage() {
  useTutorial();
  const [stats, setStats] = useState<OverallStats | null>(null);

  const loadStats = useCallback(async () => {
    const data = await getOverallStats();
    setStats(data);
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full w-full flex justify-center p-6 relative">
      <div className="w-full max-w-md flex flex-col items-center">
        <header className="w-full flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-primary font-sarabun drop-shadow-sm">น้องลีมิง</div>
          <Link
            to="/settings"
            className="p-2 rounded-xl hover:bg-muted transition-colors shadow-sm bg-card"
            aria-label="Settings"
            id="settings-link"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </header>

      <main className="flex-1 w-full flex flex-col items-center gap-8 mt-4 pb-8">
        {/* Mascot Integration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center mt-2"
        >
          <Mascot />
        </motion.div>

        {/* Primary CTA: Daily Session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mt-2"
        >
          <Link
            to="/decks"
            id="nav-daily-session"
            className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden border-2 border-primary/20"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-inner">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="font-bold text-3xl text-white font-sarabun tracking-tight">Start Daily Session</h2>
            </div>
            <p className="text-primary-foreground/90 font-medium">Continue The Unalome Path</p>
          </Link>
        </motion.div>

        {/* Global Insights */}
        {stats && (stats.totalCards > 0 || stats.totalReviews > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Flame className={`w-5 h-5 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                </div>
                <p className={`text-2xl font-bold ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                  {stats.currentStreak}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">day streak</p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.reviewsToday}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">today</p>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCards}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">cards</p>
              </div>
            </div>
            <p className="text-sm font-medium text-center text-muted-foreground mt-3 bg-muted/50 py-2 rounded-full w-4/5 mx-auto">
              {getStreakMessage(stats.currentStreak)}
            </p>
          </motion.div>
        )}

        {/* PhanKhru & Daily Challenges */}
        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-6">
          <motion.div variants={item} className="w-full">
            <PhanKhru />
          </motion.div>
          
          <motion.div variants={item} className="w-full">
            <DailyChallengesPanel />
          </motion.div>
        </motion.div>
      </main>
      </div>
    </div>
  );
}
