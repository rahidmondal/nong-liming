export type DifficultyLevel = 1 | 2 | 3 | 4;

interface DifficultySelectorProps {
  level: DifficultyLevel;
  setLevel: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

const LEVELS = [
  { level: 1, label: 'Single Character', columns: 1 },
  { level: 2, label: 'Word (2 Chars)', columns: 2 },
  { level: 3, label: 'Word (3 Chars)', columns: 3 },
  { level: 4, label: 'Word (4+ Chars)', columns: 4 },
];

export function DifficultySelector({ level, setLevel, disabled = false }: DifficultySelectorProps) {
  return (
    <div className="w-full flex justify-center mb-4">
      <div
        className="flex bg-muted/60 p-1 rounded-xl w-full max-w-sm"
        role="radiogroup"
        aria-label="Writing difficulty"
      >
        {LEVELS.map(item => {
          const isActive = level === item.level;
          return (
            <button
              key={item.level}
              onClick={() => {
                setLevel(item.level as DifficultyLevel);
              }}
              disabled={disabled}
              role="radio"
              aria-checked={isActive}
              className={`
                flex-1 flex items-center justify-center py-2 text-xs font-semibold rounded-lg transition-all relative z-10
                ${isActive ? 'text-foreground shadow-sm bg-card' : 'text-muted-foreground hover:text-foreground'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Lvl {item.level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
