import { db } from './db';
import { isPracticeActivity, type PracticeActivity } from '@/types/practice';

/** The same action ID is safe to retry, including after an ambiguous save result. */
export async function recordPractice(activity: PracticeActivity): Promise<boolean> {
  if (!isPracticeActivity(activity)) throw new Error('Invalid practice activity');
  return db.transaction('rw', db.practiceActivities, async () => {
    if (await db.practiceActivities.get(activity.id)) return false;
    await db.practiceActivities.add(activity);
    return true;
  });
}
