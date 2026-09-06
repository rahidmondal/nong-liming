import { lessons, type LessonNode } from '@/data/lessons';
import { useTTS } from '@/hooks/useTTS';
import { db } from '@/lib/db';
import type { LessonProgress } from '@/types/lesson';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface ChatBubble {
  id: string;
  sender: 'system' | 'user';
  thai: string;
  english: string;
  transliteration?: string;
  isCorrect?: boolean;
}

export function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = lessons.find(l => l.id === id);

  const [history, setHistory] = useState<ChatBubble[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completion, setCompletion] = useState<LessonProgress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const session = useRef(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionBusy = useRef(true);
  const saving = useRef(false);
  const bubbleSequence = useRef(0);
  const selectedOptions = useRef<LessonProgress['selectedOptions']>([]);
  const userStats = useLiveQuery(() => db.userStats.get(1));
  const { speak } = useTTS('th-TH', userStats?.playbackSpeed ?? 0.8);
  const speakRef = useRef(speak);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const triggerSystemLines = useCallback((node: LessonNode, activeSession: number) => {
    interactionBusy.current = true;
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      if (session.current !== activeSession) return;
      typingTimer.current = null;
      const newBubbles: ChatBubble[] = node.lines.map(line => ({
        id: `${line.id}-${String(++bubbleSequence.current)}`,
        sender: 'system',
        thai: line.thai,
        english: line.english,
        transliteration: line.transliteration,
      }));
      setHistory(prev => [...prev, ...newBubbles]);
      setIsTyping(false);
      interactionBusy.current = false;
      if (newBubbles.length > 0) speakRef.current(newBubbles[0].thai);
    }, 800);
  }, []);

  const initLesson = useCallback(() => {
    if (!lesson) return;
    const activeSession = ++session.current;
    if (typingTimer.current !== null) clearTimeout(typingTimer.current);
    selectedOptions.current = [];
    saving.current = false;
    const startNode = lesson.nodes[lesson.startNodeId];
    setHistory([]);
    setCurrentNodeId(lesson.startNodeId);
    setIsCompleted(false);
    setCompletion(null);
    setIsSaving(false);
    setSaveError('');
    triggerSystemLines(startNode, activeSession);
  }, [lesson, triggerSystemLines]);

  useEffect(() => {
    initLesson();
    return () => {
      session.current++;
      if (typingTimer.current !== null) clearTimeout(typingTimer.current);
    };
  }, [initLesson]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  if (!lesson) return <div className="p-6 text-center">Lesson not found.</div>;

  const saveCompletion = async (record: LessonProgress) => {
    if (saving.current) return;
    const activeSession = session.current;
    saving.current = true;
    setIsSaving(true);
    setSaveError('');
    try {
      await db.lessonProgress.put(record);
      if (session.current === activeSession) setIsCompleted(true);
    } catch {
      if (session.current === activeSession) {
        setSaveError('Your dialogue could not be saved. Retry to keep your completed progress.');
      }
    } finally {
      if (session.current === activeSession) {
        saving.current = false;
        setIsSaving(false);
      }
    }
  };

  const handleChoice = (choiceId: string) => {
    if (interactionBusy.current) return;
    const node = lesson.nodes[currentNodeId];
    const choice = node.choices.find(c => c.id === choiceId);
    if (!choice) return;
    interactionBusy.current = true;
    selectedOptions.current = [
      ...selectedOptions.current,
      {
        exchangeIndex: selectedOptions.current.length,
        selectedOptionId: choice.id,
        quality: choice.isCorrect === false ? 'poor' : 'good',
      },
    ];

    // 1. Add user choice to chat
    const bubbleId = `${choice.id}-${String(++bubbleSequence.current)}`;
    setHistory(prev => [
      ...prev,
      {
        id: bubbleId,
        sender: 'user',
        thai: choice.thai,
        english: choice.english,
        transliteration: choice.transliteration,
        isCorrect: choice.isCorrect,
      },
    ]);
    speak(choice.thai);

    // 2. Process Next Step
    if (choice.nextLineId === 'COMPLETE') {
      const record: LessonProgress = {
        lessonId: lesson.id,
        completed: true,
        completedAt: Date.now(),
        exchangesCompleted: selectedOptions.current.length,
        selectedOptions: [...selectedOptions.current],
      };
      setCompletion(record);
      void saveCompletion(record);
    } else {
      const nextNode = lesson.nodes[choice.nextLineId];
      setCurrentNodeId(nextNode.id);
      triggerSystemLines(nextNode, session.current);
    }
  };

  const currentNode = lesson.nodes[currentNodeId];

  return (
    <div className="flex flex-col h-dvh bg-background max-w-lg mx-auto border-x border-border">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-md z-10 shrink-0">
        <Link to="/lessons" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground truncate">{lesson.title}</h1>
          <p className="text-[10px] text-muted-foreground">Interactive Dialogue</p>
        </div>
        <button
          onClick={initLesson}
          disabled={isSaving}
          className="p-2 -mr-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title="Restart lesson"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-center pb-4">
          <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-medium">
            Conversation Started
          </span>
        </div>

        <AnimatePresence initial={false}>
          {history.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full ${bubble.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex flex-col gap-1 max-w-[85%] ${bubble.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative p-3.5 rounded-2xl ${
                    bubble.sender === 'user'
                      ? bubble.isCorrect === false
                        ? 'bg-red-500 text-white rounded-br-sm' // Wrong answer
                        : 'bg-primary text-primary-foreground rounded-br-sm' // User generic or right
                      : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm' // System
                  }`}
                  onClick={() => {
                    speak(bubble.thai);
                  }}
                >
                  <p className="text-lg font-sarabun leading-relaxed mb-0.5 pr-4 relative">{bubble.thai}</p>
                  <p className={`text-xs ${bubble.sender === 'user' ? 'opacity-90' : 'text-muted-foreground'}`}>
                    {bubble.english}
                  </p>
                  {bubble.transliteration && (
                    <p
                      className={`text-[10px] uppercase tracking-wider mt-1.5 ${bubble.sender === 'user' ? 'opacity-70' : 'text-muted-foreground/60'}`}
                    >
                      {bubble.transliteration}
                    </p>
                  )}

                  {/* Play audio indicator icon */}
                  <div
                    className={`absolute top-3 right-3 ${bubble.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground/30'}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center shadow-sm h-[46px]">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full py-8 flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-500 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Lesson Complete!</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-[250px]">
              You've successfully finished this dialogue.
            </p>
            <button
              onClick={() => navigate('/lessons')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        <div ref={bottomRef} className="h-2" />
      </main>

      {/* Choice Area (Input) */}
      {completion && !isCompleted && (
        <div className="p-4 bg-card border-t border-border">
          {isSaving && (
            <p role="status" className="text-sm text-muted-foreground">
              Saving your dialogue…
            </p>
          )}
          {saveError && (
            <>
              <p role="alert" className="text-sm text-destructive">
                {saveError}
              </p>
              <button
                onClick={() => void saveCompletion(completion)}
                disabled={isSaving}
                className="mt-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground font-semibold"
              >
                Retry saving
              </button>
            </>
          )}
        </div>
      )}
      {!isTyping && !isCompleted && !completion && (
        <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Choose your reply
          </p>
          <div className="space-y-2">
            {currentNode.choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  handleChoice(choice.id);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
              >
                <div className="flex-1 pr-4">
                  <p className="text-lg font-sarabun font-bold mb-0.5">{choice.thai}</p>
                  <p className="text-xs opacity-80">{choice.english}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 ml-0.5 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
