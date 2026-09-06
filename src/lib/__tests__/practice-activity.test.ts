import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordPractice } from '../practice-activity';

const mock = vi.hoisted(() => ({ rows: new Map<string, unknown>(), fail: false }));
vi.mock('@/lib/db', () => ({
  db: {
    practiceActivities: {
      get: (id: string) => Promise.resolve(mock.rows.get(id)),
      add: (row: { id: string }) => {
        if (mock.fail) throw new Error('Storage full');
        mock.rows.set(row.id, row);
        return Promise.resolve(row.id);
      },
    },
    transaction: (_mode: string, _table: unknown, action: () => Promise<unknown>) => action(),
  },
}));

describe('saved practice actions', () => {
  beforeEach(() => {
    mock.rows.clear();
    mock.fail = false;
  });
  const entry = {
    id: 'tone-session-1',
    kind: 'tone' as const,
    label: 'กา',
    occurredAt: 100,
    outcome: 'correct' as const,
  };
  it('stores a retry only once and retains the original answer', async () => {
    expect(await recordPractice(entry)).toBe(true);
    expect(await recordPractice({ ...entry, outcome: 'incorrect' })).toBe(false);
    expect(mock.rows.size).toBe(1);
    expect(mock.rows.get(entry.id)).toMatchObject({ outcome: 'correct' });
  });
  it('allows retry after a failed save', async () => {
    mock.fail = true;
    await expect(recordPractice(entry)).rejects.toThrow('Storage full');
    mock.fail = false;
    expect(await recordPractice(entry)).toBe(true);
  });
  it('rejects fake assessment results on self-reported practice', async () => {
    await expect(recordPractice({ ...entry, kind: 'reading' })).rejects.toThrow('Invalid practice');
    expect(mock.rows.size).toBe(0);
  });
});
