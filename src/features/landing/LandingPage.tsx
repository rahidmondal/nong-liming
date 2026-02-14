import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';
import { BookOpen, Layers, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto relative">
      <header className="w-full flex justify-between items-center py-6">
        <div className="text-2xl font-bold text-primary font-sarabun">น้องลีมิง</div>
        <ModeToggle />
      </header>

      <main className="flex-1 w-full flex flex-col items-center gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="w-32 h-32 mx-auto flex items-center justify-center filter drop-shadow-lg">
            <img
              src={`${import.meta.env.BASE_URL}pwa-icon.svg`}
              alt="Nong Li Ming Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Hi, I am <br />
            <span className="text-primary">Nong Li Ming</span>
          </h1>
          <p className="text-muted-foreground">Your personal Thai learning partner.</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-4">
          {/* Active Option: Flashcards */}
          <motion.div variants={item}>
            <Link
              to="/decks"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Flashcards</h3>
                <p className="text-sm text-muted-foreground">Review your Flashcards</p>
              </div>
            </Link>
          </motion.div>

          {/* Active Option: Full View */}
          <motion.div variants={item}>
            <Link
              to="/full-view"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Full View</h3>
                <p className="text-sm text-muted-foreground">Alphabet/Number/Tone Reference</p>
              </div>
            </Link>
          </motion.div>

          {/* Active Option: Builder */}
          <motion.div variants={item}>
            <Link
              to="/builder"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Builder</h3>
                <p className="text-sm text-muted-foreground">Word & Writing Pad</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
