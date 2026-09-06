import { ThaiManuscriptIcon, ThaiTempleIcon, ThaiScriptIcon } from '@/components/ThaiIcons';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowRight, Check, ChevronDown, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { db, getOrCreateUserStats } from '@/lib/db';
import { buildCoursePlan, getDayMission, type CourseDay, type CourseDuration } from './coursePlan';
import { TempleArtifact } from './TempleArtifact';

export function courseDayUrl(day: CourseDay) {
  return `/learn/${day.missionId}?day=${encodeURIComponent(day.id)}`;
}

export function CourseHub() {
  const progress = useLiveQuery(() => db.missionProgress.toArray(), [], []);
  const userStats = useLiveQuery(() => db.userStats.get(1));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const duration = userStats?.courseDuration ?? 45;
  const days = buildCoursePlan(duration);
  const completed = days.filter(day => progress.some(p => p.id === day.id && p.lastCompletedAt));
  const next = days.find(day => !completed.includes(day)) ?? days[0];
  const mission = getDayMission(next);
  const current = progress.find(p => p.id === next.id);
  const allDone = completed.length === days.length;
  const inProgress = current?.run.started && !current.run.completed;
  const latest = [...progress]
    .filter(p => p.lastCompletedAt)
    .sort((a, b) => (b.lastCompletedAt ?? 0) - (a.lastCompletedAt ?? 0))
    .at(0);

  const changeDuration = async (value: CourseDuration) => {
    setSaving(true);
    setError('');
    try {
      await getOrCreateUserStats();
      await db.userStats.update(1, { courseDuration: value });
    } catch {
      setError('Your plan could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <section className="relative overflow-hidden rounded-[2rem] bg-feature text-feature-foreground p-6 sm:p-8 shadow-xl">
        <div className="relative">
          <div className="flex items-center justify-between gap-3 mb-6">
            <span className="rounded-full bg-feature-foreground/10 px-3 py-1.5 text-xs font-semibold tracking-wide">
              {allDone ? 'COURSE COMPLETE' : `DAY ${String(next.day)} OF ${String(duration)}`}
            </span>
            <span className="text-sm text-feature-muted">
              {mission.minutes} min · {next.kind === 'review' ? 'Review' : 'Lesson'}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-feature-muted mb-2">
                {allDone
                  ? 'Look how far you’ve come.'
                  : inProgress
                    ? 'Pick up where you left off.'
                    : 'Your next small win'}
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight">{mission.title}</h2>
            </div>
            <TempleArtifact />
          </div>
          <p className="mt-3 text-feature-muted leading-relaxed max-w-lg">{mission.outcome}</p>
          <Link
            id="nav-daily-session"
            to={courseDayUrl(next)}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-feature-action text-feature-action-foreground px-5 py-4 font-bold hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-feature-foreground"
          >
            <Play className="w-5 h-5" />
            {allDone ? 'Revisit your first lesson' : inProgress ? 'Continue Daily Session' : 'Start Daily Session'}
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Link>
          <div className="mt-6 flex justify-between text-xs text-feature-muted mb-2">
            <span>{completed.length} study days completed</span>
            <span>{Math.round((completed.length / duration) * 100)}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuenow={completed.length}
            aria-valuemax={duration}
            aria-valuemin={0}
            className="h-2 bg-feature-foreground/10 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-feature-foreground/60 rounded-full transition-all"
              style={{ width: `${String((completed.length / duration) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section
        id="nav-course-pace"
        aria-label="Choose your course pace"
        className="rounded-3xl bg-card border border-border p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Your Thai course</p>
            <h2 className="text-xl font-bold mt-1">A pace you can keep.</h2>
          </div>
          <ThaiTempleIcon className="w-9 h-9 text-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Course length">
          {([30, 45, 60] as const).map(value => (
            <button
              key={value}
              onClick={() => void changeDuration(value)}
              disabled={saving}
              aria-pressed={duration === value}
              className={`rounded-2xl px-2 py-3 border-2 transition-colors disabled:opacity-60 ${duration === value ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50 hover:border-primary/30'}`}
            >
              <span className="block font-bold text-lg">{value} days</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {value === 30 ? 'Focused' : value === 45 ? 'Balanced' : 'Gentle'}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-3">
          30 core lessons. Longer plans add review days. These are study days — take breaks whenever you need.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}
      </section>

      {latest && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Your latest step forward</p>
            <p className="text-sm text-muted-foreground mt-1">
              {latest.lastIndependent ?? latest.bestIndependent} answers on the first try without hints in your latest
              completed lesson.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          id="nav-reference"
          to="/reference"
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
        >
          <ThaiScriptIcon className="w-9 h-9 text-primary mb-3" />
          <h3 className="font-bold">Learn the script</h3>
          <p className="text-xs text-muted-foreground mt-1">All consonants, vowels & tones</p>
        </Link>
        <Link
          id="nav-flashcards"
          to="/decks"
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
        >
          <ThaiManuscriptIcon className="w-9 h-9 text-primary mb-3" />
          <h3 className="font-bold">Review your words</h3>
          <p className="text-xs text-muted-foreground mt-1">Your flashcards & saved decks</p>
        </Link>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" id="nav-course">
        <details>
          <summary className="cursor-pointer list-none flex justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Your learning path</h2>
              <p className="text-sm text-muted-foreground mt-1">Script, everyday Thai, and time to practise.</p>
            </div>
            <ChevronDown className="w-5 h-5 shrink-0" />
          </summary>
          <ol className="mt-6 space-y-2">
            {days.map(day => {
              const done = completed.includes(day);
              const active = day.id === next.id;
              const lesson = getDayMission(day);
              return (
                <li key={day.id}>
                  <Link
                    to={courseDayUrl(day)}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${active ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/50'}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {done ? <Check className="w-4 h-4" aria-label="Completed" /> : day.day}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-sm">{day.title}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {day.kind === 'review'
                          ? 'Recall & consolidate'
                          : lesson.track === 'script'
                            ? 'Read Thai'
                            : lesson.track === 'tones'
                              ? 'Sounds & tone rules'
                              : 'Use Thai'}{' '}
                        · {lesson.minutes} min
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </details>
      </section>
    </div>
  );
}
