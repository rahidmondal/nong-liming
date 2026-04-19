export type ChallengeType = 'write' | 'build' | 'review';
export type FocusArea = 'consonants' | 'vowels' | 'tones' | 'vocabulary' | 'general';

export interface ChallengeItem {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  completedAt?: number;
  deckId?: number;
  focusArea: FocusArea;
}

export interface DailyChallenge {
  id?: number;
  date: string; // YYYY-MM-DD
  challenges: ChallengeItem[];
  allCompleted: boolean;
  completionStreakDays: number;
}

export interface WeaknessScore {
  focusArea: FocusArea;
  score: number; // 0-100, higher = weaker
  cardCount: number;
}
