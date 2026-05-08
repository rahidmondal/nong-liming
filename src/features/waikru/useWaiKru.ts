import { db } from '@/lib/db';
import type { UserStats } from '@/types/flashcard';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';

export type OfferingType = 'dokKem' | 'yaPraek' | 'khaoTok' | 'dokMaKhue';

export async function addOffering(type: OfferingType, amount: number = 1) {
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

export function useWaiKru() {
  const stats = useLiveQuery(() => db.userStats.get(1));

    inventory: {
      dokKem: (stats as Partial<UserStats>)?.dokKemCount ?? 0,
      yaPraek: (stats as Partial<UserStats>)?.yaPraekCount ?? 0,
      khaoTok: (stats as Partial<UserStats>)?.khaoTokCount ?? 0,
      dokMaKhue: (stats as Partial<UserStats>)?.dokMaKhueCount ?? 0,
    },
  };
}
