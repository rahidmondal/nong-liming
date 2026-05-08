import { db } from '@/lib/db';
import type { UserStats } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';

export type OfferingType = 'dokKem' | 'yaPraek' | 'khaoTok' | 'dokMaKhue';

export async function addOffering(type: OfferingType, amount = 1) {
  await db.transaction('rw', db.userStats, async () => {
    const current = await db.userStats.get(1);
    if (!current) return;
    const c = current as Partial<UserStats>;

    const updates: Partial<UserStats> = {};
    if (type === 'dokKem') updates.dokKemCount = (c.dokKemCount ?? 0) + amount;
    if (type === 'yaPraek') updates.yaPraekCount = (c.yaPraekCount ?? 0) + amount;
    if (type === 'khaoTok') updates.khaoTokCount = (c.khaoTokCount ?? 0) + amount;
    if (type === 'dokMaKhue') updates.dokMaKhueCount = (c.dokMaKhueCount ?? 0) + amount;

    await db.userStats.update(1, updates as unknown as UserStats);
  });
}

export function useWaiKru(): {
  inventory: {
    dokKem: number;
    yaPraek: number;
    khaoTok: number;
    dokMaKhue: number;
  };
} {
  const stats = useLiveQuery(() => db.userStats.get(1));

  return {
    inventory: {
      dokKem: stats?.dokKemCount ?? 0,
      yaPraek: stats?.yaPraekCount ?? 0,
      khaoTok: stats?.khaoTokCount ?? 0,
      dokMaKhue: stats?.dokMaKhueCount ?? 0,
    },
  };
}
