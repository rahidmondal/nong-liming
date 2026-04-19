import { motion } from 'framer-motion';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

function formatSpeed(speed: number): string {
  return speed === 1 ? '1x' : `${String(speed)}x`;
}

interface PlaybackSpeedSelectorProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  size?: 'small' | 'medium';
}

export function PlaybackSpeedSelector({ currentSpeed, onSpeedChange, size = 'small' }: PlaybackSpeedSelectorProps) {
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Playback speed">
      {SPEED_OPTIONS.map(speed => {
        const isActive = Math.abs(currentSpeed - speed) < 0.01;
        return (
          <motion.button
            key={speed}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              onSpeedChange(speed);
            }}
            role="radio"
            aria-checked={isActive}
            aria-label={`${formatSpeed(speed)} speed`}
            className={`
              rounded-md font-medium transition-all
              ${isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1.5 text-xs'}
              ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }
            `}
          >
            {formatSpeed(speed)}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Compact inline speed indicator + dropdown for use next to audio buttons.
 * Shows current speed as a small pill; clicking cycles through speeds.
 */
interface SpeedPillProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedPill({ currentSpeed, onSpeedChange }: SpeedPillProps) {
  const handleCycle = () => {
    const currentIndex = SPEED_OPTIONS.findIndex(s => Math.abs(s - currentSpeed) < 0.01);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    onSpeedChange(SPEED_OPTIONS[nextIndex]);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleCycle}
      title={`Playback speed: ${formatSpeed(currentSpeed)}. Click to change.`}
      className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      {formatSpeed(currentSpeed)}
    </motion.button>
  );
}
