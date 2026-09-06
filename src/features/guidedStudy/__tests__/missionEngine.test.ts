import { describe, expect, it } from 'vitest';
import { advanceRun, answerExercise, createRun, revealHint, summarizeRun } from '../missionEngine';
import { MISSIONS } from '../missionData';

describe('guided mission attempts', () => {
  const mission = MISSIONS[0];

  it('does not let opening a mission or pressing next complete an unanswered exercise', () => {
    const run = createRun(mission);
    expect(advanceRun(mission, run)).toEqual(run);
    expect(summarizeRun(run).independent).toBe(0);
    expect(run.completed).toBe(false);
  });

  it('keeps a wrong answer on the same exercise and excludes a corrected answer from independent results', () => {
    const run = createRun(mission);
    const wrong = answerExercise(mission, run, ['k']);
    expect(wrong.feedback?.correct).toBe(false);
    const retry = advanceRun(mission, wrong);
    expect(retry.index).toBe(0);
    const corrected = answerExercise(mission, retry, ['m']);
    expect(corrected.feedback?.correct).toBe(true);
    expect(summarizeRun(corrected).independent).toBe(0);
    expect(advanceRun(mission, corrected).index).toBe(1);
  });

  it('records help and ignores repeated submissions while feedback is showing', () => {
    const run = revealHint(createRun(mission));
    const answered = answerExercise(mission, run, ['m']);
    expect(answerExercise(mission, answered, ['m'])).toEqual(answered);
    expect(summarizeRun(answered)).toMatchObject({ independent: 0, supported: 1 });
  });

  it('requires every answer and explicit continuation before completing', () => {
    let run = createRun(mission);
    for (const exercise of mission.exercises) {
      run = answerExercise(mission, run, exercise.answer);
      expect(run.completed).toBe(false);
      run = advanceRun(mission, run);
    }
    expect(run.completed).toBe(true);
    expect(summarizeRun(run).independent).toBe(5);
    expect(advanceRun(mission, run)).toEqual(run);
  });

  it('checks phrase order rather than accepting the right tiles in any order', () => {
    const coffee = MISSIONS[1];
    const run = { ...createRun(coffee), index: 2 };
    expect(answerExercise(coffee, run, ['polite', 'request', 'sweet']).feedback?.correct).toBe(false);
    expect(answerExercise(coffee, run, ['request', 'sweet', 'polite']).feedback?.correct).toBe(true);
  });

  it('rejects unknown options without awarding progress', () => {
    const run = createRun(mission);
    expect(answerExercise(mission, run, ['not-an-option'])).toEqual(run);
  });
});
