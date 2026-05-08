import { DailyChallengesPanel } from '@/features/dailyChallenges/DailyChallengesPanel';
import { getOverallStats, type OverallStats } from '@/features/stats/lib/stats';
import { useTutorial } from '@/lib/useTutorial';
import { motion } from 'framer-motion';
import { BookA, BookOpen, BookOpenText, Flame, Layers, Map, MessageSquareText, Music, PenTool, Settings, Zap } from 'lucide-react';
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
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto relative">
      <header className="w-full flex justify-between items-center py-6">
        <div className="text-2xl font-bold text-primary font-sarabun">น้องลีมิง</div>
        <Link
          to="/settings"
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label="Settings"
          id="settings-link"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      <main className="flex-1 w-full flex flex-col items-center gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="w-32 h-32 mx-auto flex items-center justify-center filter drop-shadow-lg">
            <img
              src={`${import.meta.env.BASE_URL}pwa-icon.svg`}
              alt="Nong Li Ming Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Hi, I am <br />
            <span className="text-primary">Nong Li Ming</span>
          </h1>
          <p className="text-muted-foreground">Your personal Thai learning partner.</p>
        </motion.div>

        {/* The Unalome Path - Main Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <Link
            to="/unalome"
            className="group relative flex items-center p-5 bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 bg-primary text-primary-foreground rounded-xl mr-5 shadow-inner">
              <Map className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors">The Unalome Path</h2>
              <p className="text-sm text-muted-foreground mt-1">Your guided journey to Thai fluency</p>
            </div>
          </Link>
        </motion.div>

        {/* ── Global Insights ── */}
        {stats && (stats.totalCards > 0 || stats.totalReviews > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame
                    className={`w-4 h-4 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}
                  />
                </div>
                <p className={`text-xl font-bold ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                  {stats.currentStreak}
                </p>
                <p className="text-[10px] text-muted-foreground">day streak</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xl font-bold text-foreground">{stats.reviewsToday}</p>
                <p className="text-[10px] text-muted-foreground">today</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalCards}</p>
                <p className="text-[10px] text-muted-foreground">cards</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">{getStreakMessage(stats.currentStreak)}</p>
          </motion.div>
        )}

        <div className="w-full">
          <PhanKhru />
        </div>

        {/* Daily Challenges */}
        <DailyChallengesPanel />

        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-4">
          {/* Flashcards */}
          <motion.div variants={item}>
            <Link
              to="/decks"
              id="nav-flashcards"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Flashcards</h3>
                <p className="text-sm text-muted-foreground">Review your Flashcards</p>
              </div>
            </Link>
          </motion.div>

          {/* Dictionary */}
          <motion.div variants={item}>
            <Link
              to="/dictionary"
              id="nav-dictionary"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookA className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Dictionary</h3>
                <p className="text-sm text-muted-foreground">Search and Quick Add</p>
              </div>
            </Link>
          </motion.div>

          {/* Tone Trainer */}
          <motion.div variants={item}>
            <Link
              to="/tone-trainer"
              id="nav-tone-trainer"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Tone Trainer</h3>
                <p className="text-sm text-muted-foreground">Practice Thai Tones</p>
              </div>
            </Link>
          </motion.div>

          {/* Reference */}
          <motion.div variants={item}>
            <Link
              to="/reference"
              id="nav-reference"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Reference</h3>
                <p className="text-sm text-muted-foreground">Alphabet/Number/Tone Reference</p>
              </div>
            </Link>
          </motion.div>

          {/* Builder */}
          <motion.div variants={item}>
            <Link
              to="/builder"
              id="nav-builder"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Writing Builder</h3>
                <p className="text-sm text-muted-foreground">Word & Writing Pad</p>
              </div>
            </Link>
          </motion.div>

          {/* Dialogues */}
          <motion.div variants={item}>
            <Link
              to="/lessons"
              id="nav-lessons"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Conversations</h3>
                <p className="text-sm text-muted-foreground">Interactive Dialogues</p>
              </div>
            </Link>
          </motion.div>

          {/* Smart Reading */}
          <motion.div variants={item}>
            <Link
              to="/reading"
              id="nav-reading"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookOpenText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Smart Reading</h3>
                <p className="text-sm text-muted-foreground">Tap words to translate & learn</p>
              </div>
            </Link>
          </motion.div>

          {/* Sentence Practice */}
          <motion.div variants={item}>
            <Link
              to="/sentence-practice"
              id="nav-sentence-practice"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Sentence Practice</h3>
                <p className="text-sm text-muted-foreground">Combine Words Intelligently</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
