import { COURSE_LESSON_IDS, MISSIONS } from './missionData';
import type { Mission } from './missionTypes';

export type CourseDuration = 30 | 45 | 60;
export interface CourseDay {
  id: string;
  day: number;
  missionId: string;
  kind: 'lesson' | 'review';
  title: string;
}

function findMission(id: string): Mission {
  const mission = MISSIONS.find(item => item.id === id);
  if (!mission) throw new Error(`Unknown course mission: ${id}`);
  return mission;
}

export function buildCoursePlan(duration: CourseDuration): CourseDay[] {
  const days: CourseDay[] = [];
  for (const [index, missionId] of COURSE_LESSON_IDS.entries()) {
    const mission = findMission(missionId);
    days.push({ id: `lesson-${missionId}`, day: days.length + 1, missionId, kind: 'lesson', title: mission.title });
    // Three lessons followed by three recall days gives each lesson a revisit
    // with intervening study days. The 45-day plan selects one per pair.
    const reviewIds =
      duration === 60 && index % 3 === 2
        ? COURSE_LESSON_IDS.slice(index - 2, index + 1)
        : duration === 45 && index % 2 === 1
          ? [missionId]
          : [];
    for (const reviewId of reviewIds) {
      const original = findMission(reviewId);
      days.push({
        id: `review-${reviewId}-1`,
        day: days.length + 1,
        missionId: reviewId,
        kind: 'review',
        title: `Recall: ${original.title}`,
      });
    }
  }
  return days;
}

export function getDayMission(day: CourseDay): Mission {
  const original = findMission(day.missionId);
  if (day.kind === 'lesson') return original;
  const occurrence = Number(day.id.split('-').at(-1)) || 1;
  const shift = 1 + ((occurrence - 1) % (original.exercises.length - 1));
  const exercises = [...original.exercises.slice(shift), ...original.exercises.slice(0, shift)].map(exercise => ({
    ...exercise,
    // Rotate choices as well as questions; preserve chunk order answers.
    options: [...exercise.options.slice(1), ...exercise.options.slice(0, 1)],
    answer: [...exercise.answer],
  }));
  return {
    ...original,
    title: `Recall: ${original.title}`,
    introduction:
      'See what you remember from this lesson. Try the questions first, then use the notes or a hint whenever you need support. ' +
      original.introduction,
    exercises,
  };
}
