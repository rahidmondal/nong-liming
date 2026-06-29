import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const messages = [
  "Sawasdee krub! Ready to learn?",
  "Let's continue your journey! 🌟",
  "A little practice every day goes a long way!",
  "Keep up the great work! 💪"
];

export function Mascot() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000); // Rotate message every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full relative">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white dark:bg-zinc-800 text-foreground px-6 py-3 rounded-2xl shadow-md border border-border max-w-[280px] text-center"
        >
          <p className="text-sm font-medium">{messages[messageIndex]}</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-800 border-b border-r border-border rotate-45"></div>
        </motion.div>
      </AnimatePresence>

      {/* Mascot Image */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center filter drop-shadow-xl mt-4"
      >
        <img
          src={`${import.meta.env.BASE_URL}pwa-icon.svg`}
          alt="Nong Li Ming Logo"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
}
