export interface WritingPadStat {
  id?: number;
  character: string;
  attempts: number;
  successes: number;
  avgConfidence: number;
  lastAttempt: number; // timestamp
}
