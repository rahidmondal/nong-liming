import { BookA, BookOpen, BookOpenText, MessageSquareText, Music, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ToolsHub() {
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
    <div className="min-h-full flex flex-col items-center p-6 max-w-md mx-auto relative pb-24">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="text-2xl font-bold text-foreground">Tools Hub</h1>
      </header>

      <main className="flex-1 w-full flex flex-col items-center gap-8">
        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-4">
          
          <motion.div variants={item}>
            <Link
              to="/dictionary"
              id="nav-dictionary"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookA className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Dictionary</h3>
                <p className="text-sm text-muted-foreground">Search and Quick Add</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/builder"
              id="nav-builder"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Writing Builder</h3>
                <p className="text-sm text-muted-foreground">Word & Writing Pad</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/reference"
              id="nav-reference"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Reference</h3>
                <p className="text-sm text-muted-foreground">Alphabet/Number/Tone Reference</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/tone-trainer"
              id="nav-tone-trainer"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Tone Trainer</h3>
                <p className="text-sm text-muted-foreground">Practice Thai Tones</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/lessons"
              id="nav-lessons"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Conversations</h3>
                <p className="text-sm text-muted-foreground">Interactive Dialogues</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/reading"
              id="nav-reading"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <BookOpenText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Smart Reading</h3>
                <p className="text-sm text-muted-foreground">Tap words to translate & learn</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link
              to="/sentence-practice"
              id="nav-sentence-practice"
              className="group relative flex items-center p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Sentence Practice</h3>
                <p className="text-sm text-muted-foreground">Combine Words Intelligently</p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
