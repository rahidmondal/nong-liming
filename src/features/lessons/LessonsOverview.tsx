/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { lessons } from '@/data/lessons';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Lock, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function LessonsOverview() {
  const navigate = useNavigate();
  const progressList = useLiveQuery(() => db.lessonProgress.toArray(), []) ?? [];
  const progressMap = new Map(progressList.map(p => [p.lessonId, p]));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLessonId = lessons[index - 1].id;
    return progressMap.get(prevLessonId)?.isCompleted ?? false;
  };

  return (
    <div className="min-h-full flex flex-col items-center p-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="w-full flex items-center gap-3 py-6">
        <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-card transition-colors" aria-label="Go home">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex flex-col leading-tight">
          Dialogues
          <span className="text-sm font-normal text-muted-foreground">Practice real conversations</span>
        </h1>
      </header>

      <main className="w-full mt-4 pb-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {lessons.map((lesson, idx) => {
            const unlocked = isLessonUnlocked(idx);
            const progress = progressMap.get(lesson.id);
            const isCompleted = progress?.isCompleted ?? false;

            return (
              <motion.div variants={item} key={lesson.id}>
                <div
                  onClick={() => {
                    if (unlocked) void navigate(`/lessons/${lesson.id}`);
                  }}
                  className={`
                    relative p-5 rounded-2xl border transition-all text-left flex flex-col gap-3
                    ${unlocked ? 'bg-card border-border shadow-sm hover:shadow-md cursor-pointer group' : 'bg-muted/30 border-transparent cursor-not-allowed'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : unlocked
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : unlocked ? (
                          <MessageCircle className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h2 className={`font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {lesson.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">{lesson.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Difficulty
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(level => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= lesson.difficulty
                              ? unlocked
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {unlocked && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
