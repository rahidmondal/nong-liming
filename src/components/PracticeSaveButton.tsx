import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { db } from '@/lib/db';
import { recordPractice } from '@/lib/practice-activity';
import { localPracticeDate, type PracticeKind } from '@/types/practice';

export function PracticeSaveButton({
  kind,
  contentKey,
  label,
  disabled = false,
}: {
  kind: Exclude<PracticeKind, 'tone'>;
  contentKey: string;
  label: string;
  disabled?: boolean;
}) {
  const id = `${kind}:${localPracticeDate()}:${contentKey}`;
  const saved = useLiveQuery(async () => {
    try {
      return { record: await db.practiceActivities.get(id), error: false };
    } catch {
      return { record: undefined, error: true };
    }
  }, [id]);
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ id: string; error: boolean } | null>(null);
  const isSaved = Boolean(saved?.record) || (result?.id === id && !result.error);
  const save = async () => {
    if (lock.current || disabled || isSaved) return;
    lock.current = true;
    setSaving(true);
    const actionId = `${kind}:${localPracticeDate()}:${contentKey}`;
    try {
      await recordPractice({ id: actionId, kind, label, occurredAt: Date.now() });
      setResult({ id: actionId, error: false });
    } catch {
      setResult({ id: actionId, error: true });
    } finally {
      lock.current = false;
      setSaving(false);
    }
  };
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void save()}
        disabled={disabled || saving || isSaved || !saved}
        className="rounded-xl px-4 py-2.5 border border-primary/30 bg-primary/10 text-primary font-semibold text-sm disabled:opacity-50 hover:bg-primary/15"
      >
        {isSaved ? 'Saved to your progress today' : saving ? 'Saving practice…' : 'I practised this'}
      </button>
      {(saved?.error === true || (result?.id === id && result.error)) && !isSaved && (
        <p role="alert" className="text-sm text-destructive">
          Practice could not be saved. Please try again.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        One entry per item per day. This records practice, not a correctness score.
      </p>
    </div>
  );
}
