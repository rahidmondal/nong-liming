export interface DailySession {
  sessionId: string;
  tasks: SessionTask[];
}

export interface SessionTask {
  id: string;
  type: 'flashcard' | 'lesson' | 'quiz' | 'story';
  completed: boolean;
}

export function generateDailySession(): DailySession {
  // In the future, this will generate a curated list of tasks based on user progress.
  return {
    sessionId: `session_${String(Date.now())}`,
    tasks: [
      { id: 'task_1', type: 'lesson', completed: false },
      { id: 'task_2', type: 'flashcard', completed: false },
    ],
  };
}
