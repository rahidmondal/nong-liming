import { ThaiCard } from '@/features/full-view/components/ThaiCard';
import type { ThaiConsonant } from '@/types/alphabet';

const CLASS_CONFIG: Record<string, { label: string; color: string }> = {
  mid: { label: 'Mid', color: '#3b82f6' },
  high: { label: 'High', color: '#ef4444' },
  low: { label: 'Low', color: '#22c55e' },
};

interface ConsonantChartProps {
  consonants: ThaiConsonant[];
}

export function ConsonantChart({ consonants }: ConsonantChartProps) {
  const groups = {
    mid: consonants.filter(c => c.class === 'mid'),
    high: consonants.filter(c => c.class === 'high'),
    low: consonants.filter(c => c.class === 'low'),
  };

  return (
    <div className="space-y-8">
      {(['mid', 'high', 'low'] as const).map(cls => (
        <section key={cls}>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: CLASS_CONFIG[cls].color }} />
            {CLASS_CONFIG[cls].label} Class
            <span className="text-sm font-normal text-muted-foreground">({groups[cls].length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {groups[cls].map(c => (
              <ThaiCard
                key={c.id}
                thaiChar={c.thaiChar}
                english={c.startSound}
                hindiEquiv={c.hindiEquiv}
                startSound={c.startSound}
                finalSound={c.finalSound}
                audioText={c.thaiName}
                accentColor={CLASS_CONFIG[c.class].color}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
