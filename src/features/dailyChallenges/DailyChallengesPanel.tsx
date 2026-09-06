import { fireConfetti } from '@/lib/confetti';
import type { ChallengeItem } from '@/types/dailyChallenge';
import { motion } from 'framer-motion';
import {
  ThaiScriptIcon as Blocks,
  ThaiManuscriptIcon as Layers,
  ThaiScriptIcon as PenLine,
  ThaiLotusIcon as Trophy,
  ThaiFlameIcon,
} from '@/components/ThaiIcons';
import { ThaiFlameIcon as Sparkles } from '@/components/ThaiIcons';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDailyChallenges } from './useDailyChallenges';

const CHALLENGE_ICONS: Record<string, React.ReactNode> = {
  write: <PenLine className="w-4 h-4" />,
  build: <Blocks className="w-4 h-4" />,
  review: <Layers className="w-4 h-4" />,
};

const CHALLENGE_ROUTES: Record<string, string> = {
  write: '/builder',
  build: '/builder',
  review: '/decks',
};

function ChallengeCard({ challenge, index }: { challenge: ChallengeItem; index: number }) {
  const progress = challenge.target > 0 ? (challenge.progress / challenge.target) * 100 : 0;
  const route = CHALLENGE_ROUTES[challenge.type] ?? '/';

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
      <Link
        to={route}
        className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
          challenge.completed
            ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50'
            : 'bg-card border-border hover:border-primary/50 hover:shadow-sm'
        }`}
      >
        {/* Icon */}
        <div
          className={`shrink-0 p-2 rounded-lg ${
            challenge.completed
              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {challenge.completed ? <CheckCircle2 className="w-4 h-4" /> : CHALLENGE_ICONS[challenge.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              challenge.completed ? 'text-purple-700 dark:text-purple-300 line-through' : 'text-foreground'
            }`}
          >
            {challenge.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
        </div>

        {/* Progress */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span
            className={`text-xs font-semibold ${
              challenge.completed ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
            }`}
          >
            {challenge.progress}/{challenge.target}
          </span>
          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${challenge.completed ? 'bg-purple-500' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${String(Math.min(100, progress))}%` }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function DailyChallengesPanel() {
  const { challenges, isLoading, completedCount, totalCount, allCompleted, resetChallenges } = useDailyChallenges();
  const confettiFired = useRef(false);

  // Fire confetti when all challenges are completed
  useEffect(() => {
    if (allCompleted && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
  }, [allCompleted]);

  if (isLoading) {
    return (
      <div className="w-full bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-14 rounded-xl bg-muted/50" />
          <div className="h-14 rounded-xl bg-muted/50" />
          <div className="h-14 rounded-xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (!challenges || challenges.challenges.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {allCompleted ? (
              <Trophy className="w-5 h-5 text-purple-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-sm font-semibold text-foreground">Daily Challenges</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                allCompleted
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={() => void resetChallenges()}
              className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Reset challenges (testing)"
              aria-label="Reset daily challenges"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* All complete banner */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/30"
          >
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 text-center">
              🎉 All challenges completed! Great work today!
            </p>
          </motion.div>
        )}

        {/* Challenge list */}
        <div className="space-y-2">
          {challenges.challenges.map((ch, i) => (
            <ChallengeCard key={ch.id} challenge={ch} index={i} />
          ))}
        </div>

        {/* Streak info */}
        {challenges.completionStreakDays > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            <ThaiFlameIcon className="inline-block w-4 h-4 mr-1" /> {challenges.completionStreakDays} day challenge
            streak
          </p>
        )}
      </div>
    </motion.div>
  );
}
