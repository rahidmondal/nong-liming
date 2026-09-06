import { db } from '@/lib/db';
import { advanceRun, answerExercise, createRun, revealHint, summarizeRun } from './missionEngine';
import type { Mission, MissionProgress } from './missionTypes';

export type MissionAction =
  | { type: 'open' | 'start' | 'hint' | 'continue' | 'restart' }
  | { type: 'answer'; selected: string[] };

export function transitionProgress(mission: Mission, current: MissionProgress, action: MissionAction): MissionProgress {
  let run = current.run;
  switch (action.type) {
    case 'start':
      run = { ...run, started: true };
      break;
    case 'hint':
      run = revealHint(run);
      break;
    case 'answer':
      run = answerExercise(mission, run, action.selected);
      break;
    case 'continue':
      run = advanceRun(mission, run);
      break;
    case 'restart':
      run = createRun(mission);
      break;
    case 'open':
      return current;
  }
  const justCompleted = !current.run.completed && run.completed;
  return {
    ...current,
    run,
    updatedAt: Date.now(),
    completedRuns: current.completedRuns + (justCompleted ? 1 : 0),
    bestIndependent: justCompleted
      ? Math.max(current.bestIndependent, summarizeRun(run).independent)
      : current.bestIndependent,
    lastCompletedAt: justCompleted ? Date.now() : current.lastCompletedAt,
    lastIndependent: justCompleted ? summarizeRun(run).independent : current.lastIndependent,
  };
}

export async function saveMissionAction(id: string, mission: Mission, action: MissionAction): Promise<MissionProgress> {
  return db.transaction('rw', db.missionProgress, async () => {
    const existing = await db.missionProgress.get(id);
    const current: MissionProgress = existing ?? {
      id,
      missionId: mission.id,
      run: createRun(mission),
      updatedAt: Date.now(),
      completedRuns: 0,
      bestIndependent: 0,
    };
    const next = transitionProgress(mission, current, action);
    await db.missionProgress.put(next);
    return next;
  });
}
