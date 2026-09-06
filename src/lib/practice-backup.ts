import { isPracticeActivity } from '@/types/practice';

export const PRACTICE_TABLES = [
  'practiceActivities',
  'lessonProgress',
  'writingPadStats',
  'dailyChallenges',
  'graduatedWords',
  'unalomeProgress',
] as const;
export type PracticeBackup = Partial<Record<(typeof PRACTICE_TABLES)[number], Record<string, unknown>[]>>;

const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const count = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const timestamp = (v: unknown): v is number => count(v) && v <= 8640000000000000;
const date = (v: unknown) => (typeof v === 'string' || v instanceof Date) && Number.isFinite(new Date(v).getTime());
const dateKey = (v: unknown) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && date(v) && new Date(v).toISOString().slice(0, 10) === v;
const optionalId = (row: Record<string, unknown>) => row.id === undefined || (count(row.id) && row.id > 0);

function validChallenge(v: unknown): boolean {
  return (
    object(v) &&
    text(v.id) &&
    ['write', 'build', 'review'].includes(String(v.type)) &&
    text(v.title) &&
    typeof v.description === 'string' &&
    count(v.target) &&
    v.target > 0 &&
    count(v.progress) &&
    typeof v.completed === 'boolean' &&
    (v.completedAt === undefined || timestamp(v.completedAt)) &&
    (v.deckId === undefined || count(v.deckId)) &&
    ['consonants', 'vowels', 'tones', 'vocabulary', 'general'].includes(String(v.focusArea))
  );
}

const validators: Record<(typeof PRACTICE_TABLES)[number], (row: Record<string, unknown>) => boolean> = {
  practiceActivities: isPracticeActivity,
  lessonProgress: row =>
    text(row.lessonId) &&
    typeof row.completed === 'boolean' &&
    (row.completedAt === undefined || timestamp(row.completedAt)) &&
    count(row.exchangesCompleted) &&
    Array.isArray(row.selectedOptions) &&
    row.selectedOptions.every(
      option =>
        object(option) &&
        count(option.exchangeIndex) &&
        text(option.selectedOptionId) &&
        ['good', 'okay', 'poor'].includes(String(option.quality)),
    ),
  writingPadStats: row =>
    optionalId(row) &&
    text(row.character) &&
    count(row.attempts) &&
    count(row.successes) &&
    row.successes <= row.attempts &&
    typeof row.avgConfidence === 'number' &&
    Number.isFinite(row.avgConfidence) &&
    row.avgConfidence >= 0 &&
    row.avgConfidence <= 100 &&
    timestamp(row.lastAttempt),
  dailyChallenges: row =>
    optionalId(row) &&
    dateKey(row.date) &&
    Array.isArray(row.challenges) &&
    row.challenges.every(validChallenge) &&
    typeof row.allCompleted === 'boolean' &&
    count(row.completionStreakDays),
  graduatedWords: row => optionalId(row) && text(row.word) && typeof row.meaning === 'string' && date(row.graduatedAt),
  unalomeProgress: row =>
    text(row.nodeId) &&
    ['locked', 'unlocked', 'completed'].includes(String(row.status)) &&
    (row.unlockedAt === undefined || date(row.unlockedAt)) &&
    (row.completedAt === undefined || date(row.completedAt)),
};

/** Check optional legacy tables before an import can clear any existing records. */
export function isPracticeBackup(data: Record<string, unknown>): boolean {
  return PRACTICE_TABLES.every(name => {
    if (!(name in data)) return true;
    const rows = data[name];
    if (!Array.isArray(rows) || !rows.every(row => object(row) && validators[name](row))) return false;
    const key = name === 'lessonProgress' ? 'lessonId' : name === 'unalomeProgress' ? 'nodeId' : 'id';
    const ids = (rows as Record<string, unknown>[]).map(row => row[key]).filter(id => id !== undefined);
    return ids.length === new Set(ids).size;
  });
}

export function restorePracticeDates(name: (typeof PRACTICE_TABLES)[number], rows: Record<string, unknown>[]) {
  const fields =
    name === 'graduatedWords' ? ['graduatedAt'] : name === 'unalomeProgress' ? ['unlockedAt', 'completedAt'] : [];
  return rows.map(row => {
    const copy = { ...row };
    for (const field of fields) if (typeof copy[field] === 'string') copy[field] = new Date(copy[field]);
    return copy;
  });
}
