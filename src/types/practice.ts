export const PRACTICE_KINDS = ['tone', 'reading', 'sentence', 'word'] as const;
export type PracticeKind = (typeof PRACTICE_KINDS)[number];

export interface PracticeActivity {
  id: string;
  kind: PracticeKind;
  label: string;
  occurredAt: number;
  outcome?: 'correct' | 'incorrect';
}

export function isPracticeActivity(value: unknown): value is PracticeActivity {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    row.id.length > 0 &&
    row.id.length <= 1000 &&
    PRACTICE_KINDS.includes(row.kind as PracticeKind) &&
    typeof row.label === 'string' &&
    row.label.trim().length > 0 &&
    row.label.length <= 1000 &&
    typeof row.occurredAt === 'number' &&
    Number.isSafeInteger(row.occurredAt) &&
    row.occurredAt > 0 &&
    row.occurredAt <= 8640000000000000 &&
    (row.kind === 'tone' ? row.outcome === 'correct' || row.outcome === 'incorrect' : row.outcome === undefined)
  );
}

export function localPracticeDate(date = new Date()): string {
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
