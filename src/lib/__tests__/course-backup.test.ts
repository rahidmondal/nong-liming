// @vitest-environment node
import JSZip from 'jszip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBackup, importBackup } from '@/lib/backup-utils';
import { MISSIONS } from '@/features/guidedStudy/missionData';

const mock = vi.hoisted(() => {
  const names = [
    'decks',
    'noteTypes',
    'notes',
    'cards',
    'studySessions',
    'reviewLogs',
    'mediaFiles',
    'missionProgress',
    'userStats',
    'practiceActivities',
    'lessonProgress',
    'writingPadStats',
    'dailyChallenges',
    'graduatedWords',
    'unalomeProgress',
  ] as const;
  const tables = Object.fromEntries(
    names.map(name => [
      name,
      {
        rows: [] as unknown[],
        toArray: vi.fn(function (this: { rows: unknown[] }) {
          return Promise.resolve(structuredClone(this.rows));
        }),
        clear: vi.fn(function (this: { rows: unknown[] }) {
          this.rows = [];
          return Promise.resolve();
        }),
        bulkAdd: vi.fn(function (this: { rows: unknown[] }, rows: unknown[]) {
          this.rows.push(...rows);
          return Promise.resolve();
        }),
        put: vi.fn(function (this: { rows: unknown[] }, row: unknown) {
          this.rows.push(row);
          return Promise.resolve();
        }),
      },
    ]),
  );
  const transaction = vi.fn(
    async (_mode: string, included: (typeof tables)[string][], action: () => Promise<unknown>) => {
      const snapshots = included.map(table => structuredClone(table.rows));
      try {
        return await action();
      } catch (error) {
        included.forEach((table, index) => {
          table.rows = snapshots[index];
        });
        throw error;
      }
    },
  );
  return { tables, transaction };
});

vi.mock('@/lib/db', () => ({ db: { ...mock.tables, transaction: mock.transaction } }));

const firstMission = MISSIONS.find(mission => mission.id === 'first-words');
if (!firstMission) throw new Error('First course mission is missing');
const firstExercise = firstMission.exercises[0];

const progress = () => ({
  id: 'lesson-first-words',
  missionId: 'first-words',
  run: {
    index: 1,
    started: true,
    completed: false,
    hintUsed: false,
    feedback: null,
    attempts: [
      {
        exerciseId: firstExercise.id,
        selected: firstExercise.answer,
        correct: true,
        usedHint: false,
        skill: firstExercise.skill,
      },
    ],
  },
  updatedAt: 1234,
  completedRuns: 2,
  bestIndependent: 3,
  lastIndependent: 2,
  lastCompletedAt: 1000,
});

const stats = (courseDuration = 45) => ({
  id: 1,
  dailyGoal: 20,
  freezeTokens: 0,
  cardsReviewedToday: 2,
  lastStudyDate: '2026-09-06',
  playbackSpeed: 1,
  dokKemCount: 1,
  yaPraekCount: 0,
  khaoTokCount: 0,
  dokMaKhueCount: 0,
  courseDuration,
});

const legacy = () => ({
  manifest: { version: '1' },
  decks: [],
  noteTypes: [],
  notes: [],
  cards: [],
  studySessions: [],
  reviewLogs: [],
});

async function archive(data: unknown): Promise<File> {
  const zip = new JSZip();
  zip.file('data.json', JSON.stringify(data));
  return (await zip.generateAsync({ type: 'uint8array' })) as unknown as File;
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.values(mock.tables).forEach(table => {
    table.rows = [];
  });
});

describe('course backup through the real export/import functions', () => {
  const practiceData = () => ({
    practiceActivities: [{ id: 'tone-1', kind: 'tone', label: 'กา', occurredAt: 100, outcome: 'correct' }],
    lessonProgress: [
      {
        lessonId: 'lesson-1',
        completed: true,
        completedAt: 100,
        exchangesCompleted: 1,
        selectedOptions: [{ exchangeIndex: 0, selectedOptionId: 'hello', quality: 'good' }],
      },
    ],
    writingPadStats: [{ id: 1, character: 'ก', attempts: 2, successes: 1, avgConfidence: 65, lastAttempt: 100 }],
    dailyChallenges: [
      {
        id: 1,
        date: '2026-09-06',
        challenges: [
          {
            id: 'write',
            type: 'write',
            title: 'Write',
            description: 'Practice Thai',
            target: 3,
            progress: 1,
            completed: false,
            focusArea: 'consonants',
          },
        ],
        allCompleted: false,
        completionStreakDays: 0,
      },
    ],
    graduatedWords: [{ id: 1, word: 'กา', meaning: 'crow', graduatedAt: new Date('2026-09-01') }],
    unalomeProgress: [{ nodeId: 'old-node', status: 'completed', completedAt: new Date('2026-09-01') }],
  });
  it('round trips every practice and reward table, including dates', async () => {
    const rows = practiceData();
    for (const [name, values] of Object.entries(rows)) mock.tables[name].rows = values;
    const bytes = await (await exportBackup()).arrayBuffer();
    for (const name of Object.keys(rows)) mock.tables[name].rows = [];
    await importBackup(bytes as unknown as File);
    for (const [name, values] of Object.entries(rows)) expect(mock.tables[name].rows).toEqual(values);
  });
  it('preserves practice omitted by an older backup', async () => {
    const rows = practiceData();
    for (const [name, values] of Object.entries(rows)) mock.tables[name].rows = values;
    await importBackup(await archive(legacy()));
    for (const [name, values] of Object.entries(rows)) expect(mock.tables[name].rows).toEqual(values);
  });
  it.each([
    { practiceActivities: [{ id: 'x', kind: 'reading', label: 'story', occurredAt: 1, outcome: 'correct' }] },
    { lessonProgress: [{ lessonId: 'a', completed: true, exchangesCompleted: -1, selectedOptions: [] }] },
    { writingPadStats: [{ id: 1, character: 'ก', attempts: 1, successes: 2, avgConfidence: 30, lastAttempt: 1 }] },
    { dailyChallenges: [{ date: '2026-99-99', challenges: [] }] },
    { graduatedWords: [{ word: 'กา', meaning: 'crow', graduatedAt: 'invalid date' }] },
    { unalomeProgress: [{ nodeId: 'a', status: 'invented' }] },
  ])('rejects invalid practice data before modifying any table: %j', async rows => {
    await expect(importBackup(await archive({ ...legacy(), ...rows }))).rejects.toThrow('Invalid backup');
    expect(mock.transaction).not.toHaveBeenCalled();
  });
  it('rolls back all tables if restoring practice fails', async () => {
    mock.tables.decks.rows = [{ id: 42 }];
    mock.tables.practiceActivities.rows = practiceData().practiceActivities;
    mock.tables.lessonProgress.bulkAdd.mockRejectedValueOnce(new Error('write failed'));
    await expect(importBackup(await archive({ ...legacy(), ...practiceData() }))).rejects.toThrow('write failed');
    expect(mock.tables.decks.rows).toEqual([{ id: 42 }]);
    expect(mock.tables.practiceActivities.rows).toEqual(practiceData().practiceActivities);
  });
  it.each([30, 45, 60])('round trips progress and the %i-day preference', async duration => {
    mock.tables.missionProgress.rows = [progress()];
    mock.tables.userStats.rows = [stats(duration)];
    const blob = await exportBackup();
    const bytes = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);
    const dataFile = zip.file('data.json');
    if (!dataFile) throw new Error('Export is missing data.json');
    const data: unknown = JSON.parse(await dataFile.async('text'));
    expect(data).toMatchObject({ manifest: { counts: { missionProgress: 1, userStats: 1 } } });
    mock.tables.missionProgress.rows = [];
    mock.tables.userStats.rows = [];
    await importBackup(bytes as unknown as File);
    expect(mock.tables.missionProgress.rows).toEqual([progress()]);
    expect(mock.tables.userStats.rows).toEqual([stats(duration)]);
    expect(mock.transaction.mock.calls[0][1]).toEqual(
      expect.arrayContaining([mock.tables.missionProgress, mock.tables.userStats]),
    );
  });

  it('preserves course data and preferences absent from legacy backups', async () => {
    mock.tables.missionProgress.rows = [progress()];
    mock.tables.userStats.rows = [stats()];
    await importBackup(await archive(legacy()));
    expect(mock.tables.missionProgress.rows).toEqual([progress()]);
    expect(mock.tables.userStats.rows).toEqual([stats()]);
    expect(mock.tables.missionProgress.clear).not.toHaveBeenCalled();
    expect(mock.tables.userStats.clear).not.toHaveBeenCalled();
  });

  it('restores explicitly empty course tables', async () => {
    mock.tables.missionProgress.rows = [progress()];
    mock.tables.userStats.rows = [stats()];
    await importBackup(await archive({ ...legacy(), missionProgress: [], userStats: [] }));
    expect(mock.tables.missionProgress.rows).toEqual([]);
    expect(mock.tables.userStats.rows).toEqual([]);
  });

  it('accepts stats without the optional duration', async () => {
    const { courseDuration: _duration, ...oldStats } = stats();
    await importBackup(await archive({ ...legacy(), userStats: [oldStats] }));
    expect(mock.tables.userStats.rows).toEqual([oldStats]);
  });

  it('retains structurally valid progress for an unknown future mission', async () => {
    const futureProgress = {
      ...progress(),
      id: 'lesson-future',
      missionId: 'future',
      run: { ...progress().run, index: 99 },
    };
    await importBackup(await archive({ ...legacy(), missionProgress: [futureProgress] }));
    expect(mock.tables.missionProgress.rows).toEqual([futureProgress]);
  });

  it('accepts recall feedback after exercises have been reordered', async () => {
    const reviewProgress = {
      ...progress(),
      id: 'review-first-words-1',
      run: { ...progress().run, feedback: progress().run.attempts[0] },
    };
    await importBackup(await archive({ ...legacy(), missionProgress: [reviewProgress] }));
    expect(mock.tables.missionProgress.rows).toEqual([reviewProgress]);
  });

  it.each([
    { missionProgress: null },
    { missionProgress: {} },
    { missionProgress: [null] },
    { missionProgress: [{ ...progress(), run: { ...progress().run, attempts: [null] } }] },
    { missionProgress: [{ ...progress(), run: { ...progress().run, index: -1 } }] },
    { missionProgress: [{ ...progress(), run: { ...progress().run, index: 999 } }] },
    {
      missionProgress: [
        {
          ...progress(),
          run: { ...progress().run, attempts: [{ ...progress().run.attempts[0], exerciseId: 'unknown' }] },
        },
      ],
    },
    {
      missionProgress: [
        {
          ...progress(),
          run: { ...progress().run, attempts: [{ ...progress().run.attempts[0], selected: ['unknown'] }] },
        },
      ],
    },
    { missionProgress: [{ ...progress(), run: { ...progress().run, feedback: progress().run.attempts[0] } }] },
    { missionProgress: [{ ...progress(), run: { ...progress().run, feedback: {} } }] },
    { missionProgress: [{ ...progress(), completedRuns: '2' }] },
    { missionProgress: [{ ...progress(), lastIndependent: '2' }] },
    { missionProgress: [progress(), progress()] },
    { userStats: null },
    { userStats: {} },
    { userStats: [stats(40)] },
    { userStats: [{ ...stats(), dailyGoal: -1 }] },
    { userStats: [{ ...stats(), playbackSpeed: 0 }] },
    { userStats: [{ ...stats(), id: 2 }] },
    { userStats: [stats(), stats()] },
  ])('rejects malformed optional data before touching existing tables: %j', async optional => {
    mock.tables.decks.rows = [{ id: 42 }];
    await expect(importBackup(await archive({ ...legacy(), ...optional }))).rejects.toThrow('Invalid backup');
    expect(mock.transaction).not.toHaveBeenCalled();
    expect(mock.tables.decks.rows).toEqual([{ id: 42 }]);
    Object.values(mock.tables).forEach(table => {
      expect(table.clear).not.toHaveBeenCalled();
    });
  });

  it('rolls back flashcards and course data together if restoring a course table fails', async () => {
    mock.tables.decks.rows = [{ id: 42 }];
    mock.tables.missionProgress.rows = [progress()];
    mock.tables.userStats.rows = [stats(60)];
    mock.tables.userStats.bulkAdd.mockRejectedValueOnce(new Error('write failed'));
    await expect(
      importBackup(await archive({ ...legacy(), missionProgress: [], userStats: [stats(30)] })),
    ).rejects.toThrow('write failed');
    expect(mock.tables.decks.rows).toEqual([{ id: 42 }]);
    expect(mock.tables.missionProgress.rows).toEqual([progress()]);
    expect(mock.tables.userStats.rows).toEqual([stats(60)]);
  });
});
