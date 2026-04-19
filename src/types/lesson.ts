export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResponseQuality = 'good' | 'okay' | 'poor';

export interface ResponseOption {
  id: string;
  thai: string;
  romanized?: string;
  english: string;
  quality: ResponseQuality;
  feedback: string;
}

export interface DialogueExchange {
  speaker: string;
  line: string;
  lineRomanized?: string;
  lineEnglish: string;
  options: ResponseOption[];
}

export interface LessonSummaryData {
  keyPhrases: { thai: string; english: string }[];
  learningPoints: string[];
}

export interface Lesson {
  id: string;
  title: string;
  titleThai?: string;
  description: string;
  difficulty: LessonDifficulty;
  exchanges: DialogueExchange[];
  summary: LessonSummaryData;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: number;
  exchangesCompleted: number;
  selectedOptions: {
    exchangeIndex: number;
    selectedOptionId: string;
    quality: ResponseQuality;
  }[];
}
