import { describe, expect, it } from 'vitest';
import { consonants } from '@/data/consonants';
import { vowels } from '@/data/vowels';
import { MISSIONS, COURSE_LESSON_IDS } from '../missionData';
import { buildCoursePlan, getDayMission } from '../coursePlan';

describe('authored Thai course', () => {
  it.each([30, 45, 60] as const)('%i study days retain all thirty core lessons in order', duration => {
    const plan = buildCoursePlan(duration);
    expect(plan).toHaveLength(duration);
    expect(plan.map(day => day.day)).toEqual(Array.from({ length: duration }, (_, i) => i + 1));
    expect(new Set(plan.map(day => day.id)).size).toBe(duration);
    expect(plan.filter(day => day.kind === 'lesson').map(day => day.missionId)).toEqual(COURSE_LESSON_IDS);
    const taught = new Set<string>();
    for (const day of plan) {
      if (day.kind === 'lesson') taught.add(day.missionId);
      else expect(taught.has(day.missionId)).toBe(true);
      expect(getDayMission(day).id).toBe(day.missionId);
    }
    if (duration > 30) expect(plan.slice(0, 6).some(day => day.kind === 'review')).toBe(true);
  });

  it('keeps core progress identities when changing the study pace', () => {
    const ids = (duration: 30 | 45 | 60) =>
      buildCoursePlan(duration)
        .filter(day => day.kind === 'lesson')
        .map(day => day.id);
    expect(ids(30)).toEqual(ids(45));
    expect(ids(30)).toEqual(ids(60));
  });

  it('reviews every lesson once at the 60-day pace and includes the final checkpoint at both longer paces', () => {
    const reviews = buildCoursePlan(60)
      .filter(day => day.kind === 'review')
      .map(day => day.missionId);
    expect(reviews).toEqual(COURSE_LESSON_IDS);
    for (const duration of [45, 60] as const) {
      const plan = buildCoursePlan(duration);
      const reviewIds = plan.filter(day => day.kind === 'review').map(day => day.missionId);
      expect(new Set(reviewIds).size).toBe(reviewIds.length);
      expect(plan.at(-1)?.missionId).toBe('checkpoint');
      expect(plan.at(-1)?.kind).toBe('review');
    }
  });

  it('teaches every consonant and all 32 vowel representations explicitly', () => {
    expect(MISSIONS).toHaveLength(30);
    expect(new Set(COURSE_LESSON_IDS).size).toBe(30);
    const notes = MISSIONS.flatMap(mission => mission.notes);
    for (const consonant of consonants)
      expect(
        notes.some(note => note.thai === consonant.thaiChar),
        consonant.thaiChar,
      ).toBe(true);
    for (const vowel of vowels)
      expect(
        notes.some(note => note.thai === vowel.thaiChar),
        vowel.thaiChar,
      ).toBe(true);
    for (const rare of ['ฃ', 'ฅ', 'ฤๅ', 'ฦ', 'ฦๅ']) {
      expect(
        notes.some(note => note.thai === rare && /rare|obsolete/i.test(`${note.meaning} ${note.detail ?? ''}`)),
      ).toBe(true);
    }
  });

  it('has taught, answerable exercises without duplicate labels or sound ambiguity', () => {
    for (const mission of MISSIONS) {
      expect(mission.introduction.length).toBeGreaterThan(60);
      expect(mission.notes.length).toBeGreaterThanOrEqual(3);
      expect(mission.exercises.length).toBeGreaterThanOrEqual(4);
      expect(mission.exercises.length).toBeLessThanOrEqual(7);
      expect(new Set(mission.exercises.map(exercise => exercise.id)).size).toBe(mission.exercises.length);
      for (const exercise of mission.exercises) {
        const ids = exercise.options.map(option => option.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(exercise.options.map(option => option.label)).size, `${mission.id}/${exercise.id}`).toBe(
          ids.length,
        );
        expect(exercise.answer.length).toBeGreaterThan(0);
        expect(exercise.answer.every(id => ids.includes(id))).toBe(true);
        if (exercise.kind === 'choice') expect(exercise.answer).toHaveLength(1);
        if (exercise.skill === 'initial-sound') {
          const letters = exercise.options.map(option => consonants.find(letter => letter.thaiChar === option.label));
          expect(letters.every(Boolean)).toBe(true);
          expect(new Set(letters.map(letter => letter?.startSound)).size).toBe(letters.length);
          const correct = exercise.options.find(option => option.id === exercise.answer[0]);
          if (!correct) throw new Error('Missing correct option');
          expect(exercise.prompt).not.toContain(correct.label);
        }
      }
    }
  });

  it('varies review exercise order without mutating the core lesson', () => {
    const review = buildCoursePlan(60).find(day => day.kind === 'review');
    if (!review) throw new Error('Missing review day');
    const source = MISSIONS.find(mission => mission.id === review.missionId);
    if (!source) throw new Error('Missing review source');
    const before = JSON.stringify(source);
    const variant = getDayMission(review);
    expect(variant.exercises.map(exercise => exercise.id)).not.toEqual(source.exercises.map(exercise => exercise.id));
    expect(JSON.stringify(source)).toBe(before);
    expect(getDayMission(review)).toEqual(variant);
  });
});
