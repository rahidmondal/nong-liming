import { db } from './db';
import { PRACTICE_TABLES } from './practice-backup';

export async function clearPracticeHistory(): Promise<void> {
  await db.transaction(
    'rw',
    [db.studySessions, db.reviewLogs, db.missionProgress, db.userStats, ...PRACTICE_TABLES.map(name => db[name])],
    async () => {
      await db.studySessions.clear();
      await db.reviewLogs.clear();
      await db.missionProgress.clear();
      for (const name of PRACTICE_TABLES) await db[name].clear();
      await db.userStats.update(1, {
        cardsReviewedToday: 0,
        lastStudyDate: '',
        freezeTokens: 0,
        dokKemCount: 0,
        yaPraekCount: 0,
        khaoTokCount: 0,
        dokMaKhueCount: 0,
      });
    },
  );
}
