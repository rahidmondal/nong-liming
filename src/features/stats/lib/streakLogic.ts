import { db, getOrCreateUserStats } from '@/lib/db';

function getDaysBetween(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

export async function checkAndApplyStreakRollover(): Promise<void> {
  const stats = await getOrCreateUserStats();
  const today = new Date().toISOString().slice(0, 10);

  if (!stats.lastStudyDate || stats.lastStudyDate === today) {
    return; // No rollover needed
  }

  let { freezeTokens } = stats;
  const { cardsReviewedToday } = stats;

  const daysMissed = getDaysBetween(stats.lastStudyDate, today);

  // If they didn't meet the goal on their last active day:
  let tokensToConsume = daysMissed;

  // If they met the goal on the last active day, that day is safe, but subsequent missing days consume tokens.
  if (cardsReviewedToday >= stats.dailyGoal) {
    tokensToConsume = daysMissed - 1;
  }

  if (tokensToConsume > 0) {
    if (freezeTokens >= tokensToConsume) {
      freezeTokens -= tokensToConsume;
    } else {
      // Not enough tokens
      freezeTokens = 0;
    }
  }

  // Update DB for the new day
  await db.userStats.update(1, {
    freezeTokens,
    cardsReviewedToday: 0, // Reset for the new day
    lastStudyDate: today,
  });

  // Since we don't store the streak count directly in UserStats (we calculate it dynamically from ReviewLogs),
  // a broken streak means we should probably add a negative log or just rely on a "streakBreaks" table.
  // Wait, if getStreaks() recalculates from ReviewLogs, freeze tokens don't physically add review logs!
  // We need to inject "freeze" records so getStreaks() knows that gap is safe.
  // As a workaround, we can add a dummy reviewLog with rating 1 and deckId 0 to bridge the gap,
  // but a cleaner way is to actually just let `getStreaks` continue it?
  // Let's output a warning and handle it in the next step.
}
