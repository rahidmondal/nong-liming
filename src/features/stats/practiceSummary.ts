import type { PracticeActivity, PracticeKind } from '@/types/practice';

export type ActivityKind = PracticeKind | 'course' | 'dialogue' | 'writing' | 'flashcard';
export interface RecentPractice {
  id: string;
  kind: ActivityKind;
  label: string;
  occurredAt: number;
}
interface PracticeSources {
  course: { id: string; missionId: string; completedRuns: number; lastCompletedAt?: number }[];
  dialogues: { lessonId: string; completed: boolean; completedAt?: number }[];
  writing: { character: string; attempts: number; lastAttempt: number }[];
  reviewCount: number;
  recentReviews: { id?: number; reviewedAt: Date }[];
  activityCounts: Record<PracticeKind, number>;
  correctTones: number;
  recentActivities: PracticeActivity[];
}

export function summarizePractice(sources: PracticeSources) {
  const counts: Record<ActivityKind, number> = {
    ...sources.activityCounts,
    course: sources.course.reduce((total, row) => total + row.completedRuns, 0),
    dialogue: sources.dialogues.filter(row => row.completed).length,
    writing: sources.writing.reduce((total, row) => total + row.attempts, 0),
    flashcard: sources.reviewCount,
  };
  const recent: RecentPractice[] = [
    ...sources.recentActivities,
    ...sources.course
      .filter(row => row.completedRuns > 0 && row.lastCompletedAt)
      .map(row => ({
        id: `course-${row.id}`,
        kind: 'course' as const,
        label: row.missionId,
        occurredAt: row.lastCompletedAt ?? 0,
      })),
    ...sources.dialogues
      .filter(row => row.completed && row.completedAt)
      .map(row => ({
        id: `dialogue-${row.lessonId}`,
        kind: 'dialogue' as const,
        label: row.lessonId,
        occurredAt: row.completedAt ?? 0,
      })),
    ...sources.writing
      .filter(row => row.attempts > 0)
      .map(row => ({
        id: `writing-${row.character}`,
        kind: 'writing' as const,
        label: row.character,
        occurredAt: row.lastAttempt,
      })),
    ...sources.recentReviews.map(row => ({
      id: `review-${String(row.id)}`,
      kind: 'flashcard' as const,
      label: 'Flashcard reviewed',
      occurredAt: row.reviewedAt.getTime(),
    })),
  ];
  return {
    counts,
    correctTones: sources.correctTones,
    recent: recent
      .filter(row => Number.isFinite(new Date(row.occurredAt).getTime()) && row.occurredAt > 0)
      .sort((a, b) => b.occurredAt - a.occurredAt)
      .slice(0, 8),
  };
}
