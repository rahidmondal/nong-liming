import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ThaiManuscriptIcon as BookOpen } from '@/components/ThaiIcons';
import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Volume2, X } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { MISSIONS } from './missionData';
import { buildCoursePlan, getDayMission } from './coursePlan';
import { summarizeRun } from './missionEngine';
import { saveMissionAction, type MissionAction } from './missionRepository';
import type { Mission, MissionProgress } from './missionTypes';
import { LessonArtwork } from './LessonArtwork';

function ListenButton({ text }: { text: string }) {
  const { speak, isSpeaking, isAvailable } = useTTS('th-TH', 0.8);
  return (
    <button
      type="button"
      onClick={() => {
        speak(text);
      }}
      disabled={!isAvailable || isSpeaking}
      className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm disabled:opacity-60"
      aria-label={`Listen to ${text}`}
      title={isAvailable ? 'Listen in Thai' : 'A Thai speech voice is not available on this device'}
    >
      <Volume2 className="w-4 h-4" />
      {!isAvailable ? 'Thai audio unavailable' : isSpeaking ? 'Playing…' : 'Listen'}
    </button>
  );
}

function LessonNotes({ mission }: { mission: Mission }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground leading-relaxed">{mission.introduction}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {mission.notes.map((note, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <p lang="th" className="text-3xl font-sarabun leading-relaxed mb-2">
              {note.thai}
            </p>
            <p className="font-semibold">{note.meaning}</p>
            {note.detail && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{note.detail}</p>}
            <div className="mt-3">
              <ListenButton text={note.thai} />
            </div>
          </div>
        ))}
      </div>
      <Link className="inline-flex items-center gap-2 text-sm text-primary font-semibold" to={mission.referencePath}>
        <BookOpen className="w-4 h-4" />
        Explore the full reference
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function GuidedLesson({
  mission,
  progressId,
  dayLabel,
  isReview = false,
}: {
  mission: Mission;
  progressId: string;
  dayLabel?: string;
  isReview?: boolean;
}) {
  const [progress, setProgress] = useState<MissionProgress | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    void saveMissionAction(progressId, mission, { type: 'open' })
      .then(value => {
        if (active) setProgress(value);
      })
      .catch(() => {
        if (active) setError('Your lesson could not be loaded. Please try again.');
      });
    return () => {
      active = false;
    };
  }, [progressId, mission]);

  const act = async (action: MissionAction) => {
    if (saving.current) return false;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      const value = await saveMissionAction(progressId, mission, action);
      setProgress(value);
      if (action.type === 'continue' || action.type === 'restart') {
        setSelected([]);
        setShowNotes(false);
      }
      if (action.type === 'start' || action.type === 'continue') heading.current?.focus();
      return true;
    } catch {
      setError('Your progress could not be saved. Please try the action again.');
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  if (!progress)
    return (
      <div className="max-w-xl mx-auto p-6">
        <Link to="/" className="text-primary">
          Back to your course
        </Link>
        <p role={error ? 'alert' : 'status'} className="mt-6">
          {error || 'Getting your lesson ready…'}
        </p>
        {error && (
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl"
            onClick={() => void act({ type: 'open' })}
            disabled={busy}
          >
            Try again
          </button>
        )}
      </div>
    );

  const run = progress.run;
  const exercise = mission.exercises[run.index];
  const summary = summarizeRun(run);
  const answerLabels = exercise.answer
    .map(id => exercise.options.find(option => option.id === id)?.label ?? '')
    .join(exercise.kind === 'order' ? ' ' : ', ');
  const count = mission.exercises.length;
  const completedCount = run.completed ? count : run.index;
  const visibleSelection = run.feedback?.selected ?? selected;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-8">
      <header className="flex items-center justify-between gap-4 py-5">
        <Link
          to="/"
          aria-label="Save and return to course"
          className="inline-flex gap-2 items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Your course
        </Link>
        <span className="text-xs text-muted-foreground">
          {dayLabel ?? 'Free practice'} · {mission.minutes} min
        </span>
      </header>
      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
        <span>
          {!run.started
            ? 'Learn → Try → Reflect'
            : run.completed
              ? 'Practice complete'
              : `Exercise ${String(run.index + 1)} of ${String(count)}`}
        </span>
        <span>
          {completedCount}/{count}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={completedCount}
        className="h-2 rounded-full bg-muted mb-7 overflow-hidden"
      >
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${String((completedCount / count) * 100)}%` }}
        />
      </div>
      {error && (
        <p role="alert" className="p-3 rounded-xl border border-destructive/30 text-destructive mb-4">
          {error}
        </p>
      )}

      {run.completed ? (
        <section className="space-y-6">
          <div className="text-center rounded-[2rem] bg-feature text-feature-foreground p-8">
            <div className="w-16 h-16 rounded-full bg-feature-action text-feature-action-foreground mx-auto flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>
            <p className="text-feature-muted text-sm mb-2">One more step you can build on</p>
            <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
              Lesson complete: {mission.title}
            </h1>
            <p className="text-feature-muted mt-3">{mission.outcome}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl font-bold text-primary">
                {summary.independent}
                <span className="text-base text-muted-foreground">/{count}</span>
              </p>
              <p className="text-sm mt-2">First try, without hints</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl font-bold">{summary.supported}</p>
              <p className="text-sm mt-2">Solved with support</p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-5">
            <h2 className="font-bold">
              {summary.practiceSkills.length ? 'Your next practice focus' : 'Make it stick'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {summary.practiceSkills.length
                ? `Give ${summary.practiceSkills.map(skill => skill.replaceAll('-', ' ')).join(', ')} another try next time. Corrections are part of learning.`
                : 'Try these ideas again on another day. Today’s result shows how you did in these exercises.'}
            </p>
          </div>
          <Link
            to="/"
            className="flex justify-center items-center gap-3 bg-primary text-primary-foreground rounded-2xl px-5 py-4 font-bold"
          >
            Back to my course
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-3"
            disabled={busy}
            onClick={() => void act({ type: 'restart' })}
          >
            <RotateCcw className="w-4 h-4" />
            Practise again
          </button>
        </section>
      ) : !run.started ? (
        <section className="space-y-6">
          <div>
            <LessonArtwork track={mission.track} className="w-44 sm:w-52 mx-auto mb-3" />
            <p className="text-xs text-primary font-bold uppercase tracking-widest mt-5">{mission.subtitle}</p>
            <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold mt-2 outline-none">
              {mission.title}
            </h1>
            <p className="text-muted-foreground mt-3">{mission.outcome}</p>
          </div>
          {isReview ? (
            <p className="text-muted-foreground leading-relaxed">
              See what you remember. Try the questions first, then open the lesson notes or a hint whenever you need
              help.
            </p>
          ) : (
            <LessonNotes mission={mission} />
          )}
          <button
            onClick={() => void act({ type: 'start' })}
            disabled={busy}
            className="w-full flex justify-center items-center gap-3 rounded-2xl bg-primary text-primary-foreground font-bold p-4 disabled:opacity-60"
          >
            Let’s try it
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-center text-muted-foreground">
            No timer. Hints whenever you need them. Your place is saved.
          </p>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex justify-between items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-primary">
              {exercise.kind === 'order' ? 'Build your reply' : 'Give it a try'}
            </span>
            <button
              disabled={busy}
              onClick={async () => {
                if (showNotes) setShowNotes(false);
                else if (await act({ type: 'hint' })) setShowNotes(true);
              }}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              {showNotes ? 'Close lesson' : 'Review lesson'}
            </button>
          </div>
          {showNotes && (
            <div className="p-4 rounded-2xl bg-muted/40">
              <LessonNotes mission={mission} />
            </div>
          )}
          <h1 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-bold leading-snug outline-none">
            {exercise.prompt}
          </h1>
          {exercise.cue && (
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
              <p lang="th" className="text-4xl font-sarabun leading-relaxed">
                {exercise.cue}
              </p>
              {exercise.audio && (
                <div className="mt-4">
                  <ListenButton text={exercise.audio} />
                </div>
              )}
            </div>
          )}
          {!exercise.cue && exercise.audio && <ListenButton text={exercise.audio} />}

          {exercise.kind === 'order' && (
            <div
              className="min-h-24 rounded-2xl border-2 border-dashed border-primary/30 p-4 flex flex-wrap gap-2 items-center"
              aria-label="Your sentence"
            >
              {visibleSelection.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tap the words below in order.</p>
              ) : (
                visibleSelection.map((id, i) => (
                  <button
                    key={id}
                    disabled={busy || Boolean(run.feedback)}
                    aria-label={`Remove ${exercise.options.find(o => o.id === id)?.label ?? ''}`}
                    onClick={() => {
                      setSelected(selected.filter((_, j) => j !== i));
                    }}
                    className="inline-flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 text-xl font-sarabun"
                  >
                    {exercise.options.find(o => o.id === id)?.label}
                    <X className="w-3 h-3" />
                  </button>
                ))
              )}
            </div>
          )}
          <div
            className={exercise.kind === 'order' ? 'flex flex-wrap gap-3' : 'grid gap-3'}
            role="group"
            aria-label="Answer choices"
          >
            {exercise.options.map((option, i) => {
              const chosen = (run.feedback?.selected ?? selected).includes(option.id);
              return (
                <button
                  key={option.id}
                  disabled={busy || Boolean(run.feedback) || (exercise.kind === 'order' && chosen)}
                  aria-pressed={chosen}
                  onClick={() => {
                    setSelected(exercise.kind === 'order' ? [...selected, option.id] : [option.id]);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-colors disabled:cursor-default ${chosen ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'} ${exercise.kind === 'order' && chosen ? 'opacity-40' : ''}`}
                >
                  {exercise.kind === 'choice' && (
                    <span className="w-7 h-7 border border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                  )}
                  <span className="font-sarabun text-lg leading-relaxed">{option.label}</span>
                  {chosen && exercise.kind === 'choice' && <Check className="w-5 h-5 text-primary ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
          {run.hintUsed && !run.feedback && (
            <div
              role="note"
              className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm leading-relaxed"
            >
              <span className="font-bold">A little help: </span>
              {exercise.hint}
            </div>
          )}
          {run.feedback ? (
            <div
              role="status"
              className={`rounded-2xl border p-5 ${run.feedback.correct ? 'border-primary/30 bg-primary/10' : 'border-amber-500/30 bg-amber-500/10'}`}
            >
              <h2 className="font-bold text-lg">
                {run.feedback.correct ? 'You’ve got it.' : 'Let’s work this one out.'}
              </h2>
              {!run.feedback.correct && <p className="font-sarabun text-xl mt-2">{answerLabels}</p>}
              <p className="text-sm leading-relaxed mt-2">{exercise.explanation}</p>
              <button
                onClick={() => void act({ type: 'continue' })}
                disabled={busy}
                className="mt-4 w-full rounded-xl bg-primary text-primary-foreground font-bold p-3 disabled:opacity-60"
              >
                {run.feedback.correct ? (run.index + 1 === count ? 'See my progress' : 'Continue') : 'Try that again'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => void act({ type: 'answer', selected })}
                disabled={busy || selected.length === 0}
                className="w-full rounded-2xl bg-primary text-primary-foreground p-4 font-bold disabled:opacity-40"
              >
                {busy ? 'Saving…' : 'Check my answer'}
              </button>
              <button
                onClick={() => void act({ type: 'hint' })}
                disabled={busy || run.hintUsed}
                className="w-full inline-flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground disabled:opacity-50"
              >
                <Lightbulb className="w-4 h-4" />
                Give me a hint
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function GuidedStudyPage() {
  const { missionId } = useParams();
  const [params] = useSearchParams();
  const dayId = params.get('day');
  const day = dayId
    ? ([30, 45, 60] as const).flatMap(buildCoursePlan).find(item => item.id === dayId && item.missionId === missionId)
    : undefined;
  const mission = day ? getDayMission(day) : MISSIONS.find(item => item.id === missionId);
  if (!mission || (dayId && !day))
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold">Lesson not found</h1>
        <Link to="/" className="inline-block mt-4 text-primary">
          Return to your course
        </Link>
      </div>
    );
  return (
    <GuidedLesson
      key={day?.id ?? mission.id}
      mission={mission}
      progressId={day?.id ?? `practice-${mission.id}`}
      dayLabel={day ? `${day.kind === 'review' ? 'Review' : 'Lesson'} day` : undefined}
      isReview={day?.kind === 'review'}
    />
  );
}
