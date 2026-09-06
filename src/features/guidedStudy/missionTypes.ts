export interface Exercise {
  id: string;
  kind: 'choice' | 'order';
  prompt: string;
  cue?: string;
  audio?: string;
  options: { id: string; label: string }[];
  answer: string[];
  hint: string;
  explanation: string;
  skill: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  track: 'script' | 'conversation' | 'tones';
  emoji: string;
  minutes: number;
  outcome: string;
  introduction: string;
  notes: { thai: string; meaning: string; detail?: string }[];
  exercises: Exercise[];
  referencePath: string;
}

export interface MissionAttempt {
  exerciseId: string;
  selected: string[];
  correct: boolean;
  usedHint: boolean;
  skill: string;
}

export interface MissionRun {
  index: number;
  started: boolean;
  completed: boolean;
  hintUsed: boolean;
  feedback: MissionAttempt | null;
  attempts: MissionAttempt[];
}

export interface MissionProgress {
  id: string;
  missionId: string;
  run: MissionRun;
  updatedAt: number;
  completedRuns: number;
  bestIndependent: number;
  lastCompletedAt?: number;
  lastIndependent?: number;
}
