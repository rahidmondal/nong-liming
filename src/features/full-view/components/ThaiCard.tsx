import { useTTS } from '@/features/full-view/hooks/useTTS';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

export interface ThaiCardProps {
  thaiChar: string;
  english: string;
  hindiEquiv?: string;
  startSound?: string;
  finalSound?: string;
  audioText?: string;
  accentColor?: string;
}

export function ThaiCard({
  thaiChar,
  english,
  hindiEquiv,
  startSound,
  finalSound,
  audioText,
  accentColor,
}: ThaiCardProps) {
  const { speak, isSpeaking } = useTTS();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(audioText ?? thaiChar);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col items-center justify-between p-4 rounded-xl border shadow-sm hover:shadow-lg transition-all cursor-default select-none min-h-[160px] overflow-hidden"
      style={{
        borderColor: accentColor ?? 'var(--border)',
        backgroundColor: accentColor ? `color-mix(in srgb, ${accentColor} 8%, var(--card))` : 'var(--card)',
      }}
    >
      {/* Color accent strip on the left */}
      {accentColor && (
        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accentColor }} />
      )}

      {/* Top row */}
      <div className="w-full flex justify-between items-start text-xs text-muted-foreground">
        <span className="font-medium">{english}</span>
        {hindiEquiv && <span className="font-medium text-right">{hindiEquiv}</span>}
      </div>

      {/* Center — the main character */}
      <div className="flex-1 flex items-center justify-center py-2">
        <span className="text-5xl font-bold text-foreground leading-none">{thaiChar}</span>
      </div>

      {/* Bottom row */}
      <div className="w-full flex justify-between items-end">
        {/* Start sound */}
        <div className="text-xs text-muted-foreground">
          {startSound && (
            <span>
              <span className="opacity-60">ini:</span> {startSound}
            </span>
          )}
        </div>

        {/* Audio button */}
        <button
          onClick={handleSpeak}
          aria-label={`Speak ${thaiChar}`}
          className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/25 text-primary transition-colors"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Final sound */}
        <div className="text-xs text-muted-foreground text-right">
          {finalSound && (
            <span>
              <span className="opacity-60">fin:</span> {finalSound}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
