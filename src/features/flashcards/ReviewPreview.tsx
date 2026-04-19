import { calculateNextReview, type SchedulingConfig } from '@/lib/sm2';
import type { Card } from '@/types/flashcard';
import { HelpCircle } from 'lucide-react';

interface ReviewPreviewProps {
  card: Card;
  config: SchedulingConfig;
}

const RATING_INFO = [
  { val: 1, label: 'Again', desc: 'Forgot it. Reset interval, decrease ease multiplier.' },
  { val: 2, label: 'Hard', desc: 'Remembered, but with effort. Small interval increase, decrease ease.' },
  { val: 3, label: 'Good', desc: 'Remembered easily. Normal interval increase based on ease.' },
  { val: 4, label: 'Easy', desc: 'Too easy. Large interval jump, increase ease multiplier.' },
] as const;

export function ReviewPreview({ card, config }: ReviewPreviewProps) {
  return (
    <div className="w-full bg-secondary/30 border border-border rounded-xl p-4 mb-4 text-sm mt-6">
      <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
        <HelpCircle className="w-4 h-4 text-primary" />
        How will your rating affect this card?
      </h4>
      <div className="space-y-3">
        {RATING_INFO.map(info => {
          const result = calculateNextReview({ ...card }, info.val, config);

          let easeChange = '';
          if (result.easeFactor > card.easeFactor) easeChange = '📈 Ease ↑';
          else if (result.easeFactor < card.easeFactor) easeChange = '📉 Ease ↓';
          else easeChange = '⏤ Ease unchanged';

          return (
            <div
              key={info.val}
              className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr_120px] gap-2 items-start py-1 border-b border-border/50 last:border-0"
            >
              <span className="font-bold text-foreground text-xs uppercase tracking-wide mt-0.5">{info.label}</span>
              <span className="text-muted-foreground text-xs leading-relaxed hidden md:block">{info.desc}</span>
              <div className="text-xs font-medium text-right flex flex-col items-end gap-0.5">
                <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {card.interval}d → {result.interval}d
                </span>
                <span className="text-muted-foreground text-[10px]">{easeChange}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
