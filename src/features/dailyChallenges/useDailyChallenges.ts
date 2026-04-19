import { useCallback, useEffect, useState } from 'react';
import type { DailyChallenge } from '@/types/dailyChallenge';
import { getTodaysChallenges, updateChallengeProgress, resetTodaysChallenges } from './challengeGenerator';

interface UseDailyChallengesReturn {
  challenges: DailyChallenge | null;
  isLoading: boolean;
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  updateProgress: (challengeId: string, delta: number) => Promise<void>;
  resetChallenges: () => Promise<void>;
}

export function useDailyChallenges(): UseDailyChallengesReturn {
  const [challenges, setChallenges] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadChallenges = useCallback(async () => {
    try {
      const data = await getTodaysChallenges();
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load daily challenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenges();
  }, [loadChallenges]);

  const updateProgress = useCallback(async (challengeId: string, delta: number) => {
    const updated = await updateChallengeProgress(challengeId, delta);
    if (updated) {
      setChallenges(updated);
    }
  }, []);

  const resetChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await resetTodaysChallenges();
      setChallenges(fresh);
    } catch (err) {
      console.error('Failed to reset challenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completedCount = challenges?.challenges.filter(c => c.completed).length ?? 0;
  const totalCount = challenges?.challenges.length ?? 0;
  const allCompleted = challenges?.allCompleted ?? false;

  return {
    challenges,
    isLoading,
    completedCount,
    totalCount,
    allCompleted,
    updateProgress,
    resetChallenges,
  };
}
