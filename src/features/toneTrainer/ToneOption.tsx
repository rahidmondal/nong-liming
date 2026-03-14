import { ToneDiagram } from '../reference/components/ToneDiagram';

interface ToneOptionProps {
  type: 'mid' | 'low' | 'falling' | 'high' | 'rising';
  label: string;
  selected: boolean;
  correct: boolean | null; // null if not yet answered
  disabled: boolean;
  onClick: () => void;
}

export function ToneOption({ type, label, selected, correct, disabled, onClick }: ToneOptionProps) {
  let bgColorClass = 'bg-card hover:bg-muted';
  let borderColorClass = 'border-border';

  if (selected) {
    if (correct === true) {
      bgColorClass = 'bg-emerald-100 dark:bg-emerald-900/30';
      borderColorClass = 'border-emerald-500';
    } else if (correct === false) {
      bgColorClass = 'bg-red-100 dark:bg-red-900/30';
      borderColorClass = 'border-red-500';
    } else {
      bgColorClass = 'bg-primary/10';
      borderColorClass = 'border-primary';
    }
  } else if (correct === true && disabled) {
    // Show correct option if they guessed wrong
    bgColorClass = 'bg-emerald-100 dark:bg-emerald-900/30 opacity-70';
    borderColorClass = 'border-emerald-500';
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${bgColorClass} ${borderColorClass} ${disabled && !selected && correct !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-16 h-8">
        <ToneDiagram type={type} />
      </div>
      <span className="font-medium text-foreground capitalize">{label}</span>
    </button>
  );
}
