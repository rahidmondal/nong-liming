import { describe, expect, it } from 'vitest';
import { transitionProgress } from '../missionRepository';
import { createRun } from '../missionEngine';
import { MISSIONS } from '../missionData';
import type { MissionProgress } from '../missionTypes';

describe('saved lesson progress', () => {
  const mission = MISSIONS[0];
  const fresh = (): MissionProgress => ({
    id: 'lesson-first-words',
    missionId: mission.id,
    run: createRun(mission),
    updatedAt: 0,
    completedRuns: 0,
    bestIndependent: 0,
  });

  it('keeps a completed result when replaying and cannot count completion twice', () => {
    let progress = fresh();
    for (const exercise of mission.exercises) {
      progress = transitionProgress(mission, progress, { type: 'answer', selected: exercise.answer });
      progress = transitionProgress(mission, progress, { type: 'continue' });
    }
    expect(progress.completedRuns).toBe(1);
    expect(progress.lastIndependent).toBe(mission.exercises.length);
    progress = transitionProgress(mission, progress, { type: 'continue' });
    expect(progress.completedRuns).toBe(1);
    progress = transitionProgress(mission, progress, { type: 'restart' });
    expect(progress.run.started).toBe(false);
    expect(progress.lastCompletedAt).toBeGreaterThan(0);
    expect(progress.lastIndependent).toBe(mission.exercises.length);
  });

  it('preserves a hinted attempt and its feedback through serialization and reopening', () => {
    let progress = transitionProgress(mission, fresh(), { type: 'hint' });
    progress = transitionProgress(mission, progress, { type: 'answer', selected: ['m'] });
    const restored = JSON.parse(JSON.stringify(progress)) as MissionProgress;
    const reopened = transitionProgress(mission, restored, { type: 'open' });
    expect(reopened.run.feedback).toMatchObject({ correct: true, usedHint: true });
    expect(reopened.completedRuns).toBe(0);
  });
});
