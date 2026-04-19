import { motion } from 'framer-motion';

interface CharacterFeedbackProps {
  characters: string[];
  confidenceScore: number;
}

export function CharacterFeedback({ characters, confidenceScore }: CharacterFeedbackProps) {
  if (characters.length === 0) return null;

  return (
    <div className="flex justify-center gap-2 mt-4 px-2">
      {characters.map((char, index) => {
        // Distribute the global confidence score visually across characters
        // Tesseract doesn't easily expose reliable per-character bounding boxes
        // with high confidence in SINGLE_LINE mode for complex scripts,
        // so we use the global confidence for the whole string.
        const isGood = confidenceScore > 80;
        const isOkay = confidenceScore > 50 && confidenceScore <= 80;

        let colorClass =
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        if (isGood)
          colorClass =
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        else if (isOkay)
          colorClass =
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';

        return (
          <motion.div
            key={`${char}-${String(index)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex flex-col items-center justify-center min-w-[3rem] px-3 py-2 
              rounded-lg border ${colorClass}
            `}
          >
            <span className="text-2xl font-bold">{char}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
