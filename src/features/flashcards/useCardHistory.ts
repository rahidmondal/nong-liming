import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { ReviewLog } from '@/types/flashcard';

export interface CardHistoryStats {
  reviewCount: number;
  successCount: number;
  successRate: number;
  intervalProgression: number[];
  lastReviews: ReviewLog[];
  isLoading: boolean;
}

export function useCardHistory(cardId: number | undefined) {
  const [stats, setStats] = useState<CardHistoryStats>({
    reviewCount: 0,
    successCount: 0,
    successRate: 0,
    intervalProgression: [],
    lastReviews: [],
    isLoading: true,
  });

  const loadHistory = useCallback(async () => {
    if (cardId === undefined) {
      setStats(s => ({ ...s, isLoading: false }));
      return;
    }

    try {
      const logs = await db.reviewLogs.where('cardId').equals(cardId).sortBy('reviewedAt');

      const reviewCount = logs.length;
      const successCount = logs.filter(l => l.rating >= 3).length;
      const successRate = reviewCount > 0 ? (successCount / reviewCount) * 100 : 0;
      const intervalProgression = logs.map(l => l.newInterval);
      const lastReviews = logs.slice(-5).reverse(); // Newest first

      setStats({
        reviewCount,
        successCount,
        successRate,
        intervalProgression,
        lastReviews,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load card history:', error);
      setStats(s => ({ ...s, isLoading: false }));
    }
  }, [cardId]);

  useEffect(() => {
    setIsLoading();
    void loadHistory();
  }, [loadHistory]);

  const setIsLoading = () => {
    setStats(s => ({ ...s, isLoading: true }));
  };

  return stats;
}
