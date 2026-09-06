import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { MISSIONS } from '@/features/guidedStudy/missionData';
import { summarizePractice, type ActivityKind } from './practiceSummary';

const activities: { kind: ActivityKind; title: string; unit: string; path: string }[] = [
  { kind: 'course', title: 'Guided lessons', unit: 'completions, including repeats', path: '/' },
  { kind: 'flashcard', title: 'Vocabulary', unit: 'flashcard reviews', path: '/decks' },
  { kind: 'dialogue', title: 'Conversations', unit: 'different dialogues completed', path: '/lessons' },
  { kind: 'tone', title: 'Listening', unit: 'tone answers', path: '/tone-trainer' },
  { kind: 'writing', title: 'Handwriting', unit: 'recognized-character attempts', path: '/builder' },
  { kind: 'word', title: 'Build Thai words', unit: 'patterns practised', path: '/builder' },
  { kind: 'reading', title: 'Reading', unit: 'passage practice entries', path: '/reading' },
  { kind: 'sentence', title: 'Make a sentence', unit: 'sentence practice entries', path: '/sentence-practice' },
];

export function PracticeOverview() {
  const data = useLiveQuery(async () => {
    try {
      const [
        course,
        dialogues,
        writing,
        reviewCount,
        recentReviews,
        recentActivities,
        tone,
        reading,
        sentence,
        word,
        correctTones,
      ] = await Promise.all([
        db.missionProgress.toArray(),
        db.lessonProgress.toArray(),
        db.writingPadStats.toArray(),
        db.reviewLogs.count(),
        db.reviewLogs.orderBy('reviewedAt').reverse().limit(8).toArray(),
        db.practiceActivities.orderBy('occurredAt').reverse().limit(8).toArray(),
        db.practiceActivities.where('kind').equals('tone').count(),
        db.practiceActivities.where('kind').equals('reading').count(),
        db.practiceActivities.where('kind').equals('sentence').count(),
        db.practiceActivities.where('kind').equals('word').count(),
        db.practiceActivities.where('[kind+outcome]').equals(['tone', 'correct']).count(),
      ]);
      return {
        summary: summarizePractice({
          course,
          dialogues,
          writing,
          reviewCount,
          recentReviews,
          recentActivities,
          activityCounts: { tone, reading, sentence, word },
          correctTones,
        }),
        error: false,
      };
    } catch {
      return { summary: null, error: true };
    }
  });
  if (!data)
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading your practice…
      </p>
    );
  if (!data.summary)
    return (
      <p className="text-sm text-destructive" role="alert">
        Practice history could not be loaded. Reopen Profile to try again.
      </p>
    );
  const { counts, recent, correctTones } = data.summary;
  return (
    <section className="space-y-4" aria-label="All Thai practice">
      <div>
        <h2 className="text-xl font-bold">Every step counts.</h2>
        <p className="text-sm text-muted-foreground mt-1">Your saved practice across the whole app.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {activities.map(activity => (
          <Link
            key={activity.kind}
            to={activity.path}
            className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50"
          >
            <p className="text-sm font-semibold">{activity.title}</p>
            <p className="text-2xl text-primary font-bold mt-2">{counts[activity.kind]}</p>
            <p className="text-xs text-muted-foreground mt-1">{activity.unit}</p>
            {activity.kind === 'tone' && counts.tone > 0 && (
              <p className="text-xs mt-1">{correctTones} matched the expected tone</p>
            )}
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Reading and sentence entries are self-reported practice. Word building checks supported patterns; handwriting
        counts OCR attempts. These totals show practice, not fluency or pronunciation accuracy.
      </p>
      {recent.length > 0 ? (
        <details className="rounded-2xl border border-border bg-card p-4">
          <summary className="font-semibold cursor-pointer">Recent practice</summary>
          <ul className="mt-3 divide-y divide-border">
            {recent.map(entry => (
              <li key={`${entry.kind}-${entry.id}`} className="py-3 flex justify-between gap-3 text-sm">
                <span>
                  <span className="block font-medium">
                    {activities.find(activity => activity.kind === entry.kind)?.title}
                  </span>
                  <span className="block text-muted-foreground break-words">
                    {entry.kind === 'course'
                      ? (MISSIONS.find(mission => mission.id === entry.label)?.title ?? 'Guided lesson completed')
                      : entry.kind === 'dialogue'
                        ? 'Dialogue completed'
                        : entry.label}
                  </span>
                </span>
                <time
                  className="text-xs text-muted-foreground shrink-0"
                  dateTime={new Date(entry.occurredAt).toISOString()}
                >
                  {new Date(entry.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </time>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Older course, dialogue and handwriting records retain only their latest date for each item.
          </p>
        </details>
      ) : (
        <p className="rounded-2xl bg-primary/5 p-4 text-sm">
          Finish a lesson or save a practice entry to begin your history.
        </p>
      )}
    </section>
  );
}
