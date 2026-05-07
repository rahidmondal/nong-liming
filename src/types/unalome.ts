export interface UnalomeProgress {
  nodeId: string;
  status: 'locked' | 'unlocked' | 'completed';
  unlockedAt?: Date;
  completedAt?: Date;
}
