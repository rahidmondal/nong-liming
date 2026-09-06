import { describe, expect, it } from 'vitest';
import { summarizePractice } from '../practiceSummary';

describe('unified practice summary', () => {
  it('keeps different evidence and units separate without inventing mastery', () => {
    const result = summarizePractice({
      course: [{ id: 'lesson-a', missionId: 'a', completedRuns: 2, lastCompletedAt: 100 }],
      dialogues: [
        { lessonId: 'cafe', completed: true, completedAt: 90 },
        { lessonId: 'taxi', completed: false },
      ],
      writing: [{ character: 'ก', attempts: 3, lastAttempt: 80 }],
      reviewCount: 12,
      recentReviews: [{ id: 1, reviewedAt: new Date(70) }],
      activityCounts: { tone: 4, reading: 1, sentence: 2, word: 3 },
      correctTones: 2,
      recentActivities: [{ id: 'read-1', kind: 'reading', label: 'Nick’s story', occurredAt: 110 }],
    });
    expect(result.counts).toMatchObject({
      course: 2,
      dialogue: 1,
      writing: 3,
      flashcard: 12,
      tone: 4,
      reading: 1,
      sentence: 2,
      word: 3,
    });
    expect(result.correctTones).toBe(2);
    expect(result.recent[0]).toMatchObject({ kind: 'reading', label: 'Nick’s story' });
    expect(result.recent).not.toEqual(expect.arrayContaining([expect.objectContaining({ label: 'taxi' })]));
  });

  it('does not count opening or restarting a course lesson as another completion', () => {
    const result = summarizePractice({
      course: [{ id: 'a', missionId: 'a', completedRuns: 0 }],
      dialogues: [],
      writing: [],
      reviewCount: 0,
      recentReviews: [],
      activityCounts: { tone: 0, reading: 0, sentence: 0, word: 0 },
      correctTones: 0,
      recentActivities: [],
    });
    expect(result.counts.course).toBe(0);
    expect(result.recent).toEqual([]);
  });
});
