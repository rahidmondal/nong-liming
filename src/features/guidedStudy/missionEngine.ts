import type { Mission, MissionRun } from './missionTypes';

export function createRun(_mission: Mission): MissionRun {
  return { index: 0, started: false, completed: false, hintUsed: false, feedback: null, attempts: [] };
}

export function revealHint(run: MissionRun): MissionRun {
  return run.completed || run.feedback ? run : { ...run, hintUsed: true };
}

export function answerExercise(mission: Mission, run: MissionRun, selected: string[]): MissionRun {
  if (run.completed || run.feedback) return run;
  const exercise = mission.exercises.at(run.index);
  if (!exercise || selected.length === 0 || new Set(selected).size !== selected.length) return run;
  if (selected.some(id => !exercise.options.some(option => option.id === id))) return run;
  const correct = selected.length === exercise.answer.length && selected.every((id, i) => id === exercise.answer[i]);
  const attempt = { exerciseId: exercise.id, selected, correct, usedHint: run.hintUsed, skill: exercise.skill };
  return { ...run, started: true, feedback: attempt, attempts: [...run.attempts, attempt] };
}

export function advanceRun(mission: Mission, run: MissionRun): MissionRun {
  if (run.completed || !run.feedback) return run;
  if (!run.feedback.correct) return { ...run, feedback: null, hintUsed: true };
  const completed = run.index + 1 >= mission.exercises.length;
  return { ...run, index: completed ? run.index : run.index + 1, completed, feedback: null, hintUsed: false };
}

export function summarizeRun(run: MissionRun) {
  const ids = [...new Set(run.attempts.map(attempt => attempt.exerciseId))];
  let independent = 0;
  let supported = 0;
  const practiceSkills = new Set<string>();
  for (const id of ids) {
    const attempts = run.attempts.filter(attempt => attempt.exerciseId === id);
    const first = attempts[0];
    if (first.correct && !first.usedHint) independent++;
    else {
      if (attempts.some(attempt => attempt.correct)) supported++;
      practiceSkills.add(first.skill);
    }
  }
  return { independent, supported, practiceSkills: [...practiceSkills] };
}
