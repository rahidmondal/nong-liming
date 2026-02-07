import type { ThaiConsonant } from '../../types/alphabet';

interface ConsonantCardProps {
  consonant: ThaiConsonant;
}

const classBorderColors: Record<ThaiConsonant['class'], string> = {
  mid: 'border-emerald-500/50',
  high: 'border-amber-500/50',
  low: 'border-sky-500/50',
};

export function ConsonantCard({ consonant }: ConsonantCardProps) {
  return (
    <div
      className={`rounded-2xl border-2 bg-(--card) p-4 text-center backdrop-blur ${classBorderColors[consonant.class]}`}
    >
      <p className="text-4xl font-medium">{consonant.thaiChar}</p>
      <p className="mt-2 text-lg text-(--muted)">{consonant.hindiEquiv}</p>
      <p className="mt-1 text-xs text-(--muted)">{consonant.thaiName}</p>
    </div>
  );
}
