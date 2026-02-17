import { ThaiCard } from '@/features/reference/components/ThaiCard';
import type { ThaiVowel, VowelType } from '@/types/alphabet';

const TYPE_CONFIG: Record<VowelType, { label: string; color: string }> = {
  mono: { label: 'Monophthong', color: 'rgba(168,85,247,0.2)' },
  dip: { label: 'Diphthong', color: 'rgba(245,158,11,0.2)' },
  special: { label: 'Special', color: 'rgba(236,72,153,0.2)' },
};

interface VowelChartProps {
  vowels: ThaiVowel[];
}

export function VowelChart({ vowels }: VowelChartProps) {
  const groups = {
    mono: vowels.filter(v => v.type === 'mono'),
    dip: vowels.filter(v => v.type === 'dip'),
    special: vowels.filter(v => v.type === 'special'),
  };

  return (
    <div className="space-y-8">
      {(['mono', 'dip', 'special'] as const).map(type => (
        <section key={type}>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: TYPE_CONFIG[type].color.replace('0.2', '0.8') }}
            />
            {TYPE_CONFIG[type].label}
            <span className="text-sm font-normal text-muted-foreground">({groups[type].length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {groups[type].map(v => (
              <ThaiCard
                key={v.id}
                thaiChar={v.thaiChar}
                english={v.english}
                hindiEquiv={v.hindiEquiv}
                audioText={v.thaiName}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
