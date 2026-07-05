/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-non-null-assertion */
import { db } from '@/lib/db';
import type { ChallengeItem, DailyChallenge, FocusArea, WeaknessScore } from '@/types/dailyChallenge';

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

function generateId(): string {
  return `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Analyze the user's weak spots by examining review logs and card ease factors
 * from the last 30 days. Returns a ranked list of weakness scores by focus area.
 */
export async function analyzeWeaknesses(): Promise<WeaknessScore[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogs = await db.reviewLogs.where('reviewedAt').above(thirtyDaysAgo).toArray();

  if (recentLogs.length === 0) {
    return getDefaultWeaknesses();
  }

  // Group logs by cardId
  const cardLogMap = new Map<number, { total: number; again: number }>();
  for (const log of recentLogs) {
    const entry = cardLogMap.get(log.cardId) ?? { total: 0, again: 0 };
    entry.total++;
    if (log.rating === 1) entry.again++;
    cardLogMap.set(log.cardId, entry);
  }

  // Get cards with weak performance
  const allCards = await db.cards.toArray();
  const allNotes = await db.notes.toArray();
  const noteMap = new Map(allNotes.map(n => [n.id, n]));

  const focusAreaScores = new Map<FocusArea, { totalScore: number; count: number }>();

  for (const card of allCards) {
    if (card.id === undefined) continue;
    const logEntry = cardLogMap.get(card.id);
    const failureRate = logEntry ? logEntry.again / logEntry.total : 0;
    const isWeak = card.easeFactor < 180 || failureRate > 0.3;

    if (!isWeak && logEntry) continue;

    // Determine focus area from card content
    const note = noteMap.get(card.noteId);
    const focusArea = categorizeFocusArea(note);

    const weaknessScore = logEntry ? failureRate * 0.6 + ((300 - card.easeFactor) / 200) * 0.4 : 0.3; // Default moderate weakness for un-reviewed cards

    const entry = focusAreaScores.get(focusArea) ?? { totalScore: 0, count: 0 };
    entry.totalScore += weaknessScore * 100;
    entry.count++;
    focusAreaScores.set(focusArea, entry);
  }

  const scores: WeaknessScore[] = [];
  for (const [area, data] of focusAreaScores) {
    scores.push({
      focusArea: area,
      score: data.count > 0 ? Math.min(100, Math.round(data.totalScore / data.count)) : 0,
      cardCount: data.count,
    });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.length > 0 ? scores : getDefaultWeaknesses();
}

/**
 * Categorize a card's focus area based on its note content.
 * Inspects the front/back fields for Thai character patterns.
 */
function categorizeFocusArea(note: { fields: Record<string, string> } | undefined): FocusArea {
  if (!note) return 'general';

  const content = Object.values(note.fields).join(' ').toLowerCase();

  // Check for Thai consonants (single consonant cards)
  if (/^[\u0E01-\u0E2E]$/.test(content.trim())) return 'consonants';

  // Check for vowel references
  if (content.includes('vowel') || /^[\u0E30-\u0E3A\u0E40-\u0E44]$/.test(content.trim())) return 'vowels';

  // Check for tone marks
  if (content.includes('tone') || /[\u0E48-\u0E4B]/.test(content.trim())) return 'tones';

  // Default to vocabulary for multi-char Thai content
  if (/[\u0E00-\u0E7F]/.test(content)) return 'vocabulary';

  return 'general';
}

function getDefaultWeaknesses(): WeaknessScore[] {
  return [
    { focusArea: 'consonants', score: 50, cardCount: 0 },
    { focusArea: 'vocabulary', score: 40, cardCount: 0 },
    { focusArea: 'vowels', score: 30, cardCount: 0 },
  ];
}

/**
 * Determine challenge targets based on the user's completion streak.
 * More consecutive completions → harder targets; missed days → easier.
 */
function getAdaptedTargets(streakDays: number): { write: number; build: number; review: number } {
  const base = { write: 5, build: 8, review: 15 };
  const min = { write: 3, build: 5, review: 10 };
  const max = { write: 10, build: 15, review: 30 };

  let multiplier = 1;
  if (streakDays >= 3) {
    multiplier = 1 + Math.min(streakDays - 2, 5) * 0.2; // Up to 2x at 7-day streak
  }

  return {
    write: Math.max(min.write, Math.min(max.write, Math.round(base.write * multiplier))),
    build: Math.max(min.build, Math.min(max.build, Math.round(base.build * multiplier))),
    review: Math.max(min.review, Math.min(max.review, Math.round(base.review * multiplier))),
  };
}

/**
 * Generate 3 daily challenges targeting the user's weakest areas.
 */
export async function generateChallenges(streakDays: number): Promise<ChallengeItem[]> {
  const weaknesses = await analyzeWeaknesses();
  const targets = getAdaptedTargets(streakDays);

  // Find a deck with due cards for the review challenge
  const decks = await db.decks.toArray();
  const now = new Date();
  let reviewDeckId: number | undefined;
  let maxDueCards = 0;

  for (const deck of decks) {
    if (deck.id === undefined) continue;
    const dueCards = await db.cards
      .where('[deckId+status]')
      .between([deck.id, 'learning'], [deck.id, 'review\uffff'])
      .filter(c => c.nextReview <= now)
      .count();
    if (dueCards > maxDueCards) {
      maxDueCards = dueCards;
      reviewDeckId = deck.id;
    }
  }

  // If no cards are due, pick the first deck
  if (reviewDeckId === undefined && decks.length > 0) {
    reviewDeckId = decks[0].id;
  }

  const primaryFocus = weaknesses[0]?.focusArea ?? 'consonants';
  const secondaryFocus = weaknesses[1]?.focusArea ?? 'vocabulary';

  const challenges: ChallengeItem[] = [
    {
      id: generateId(),
      type: 'write',
      title: `Write ${String(targets.write)} ${primaryFocus}`,
      description: `Practice writing ${String(targets.write)} Thai ${primaryFocus} in the Writing Pad`,
      target: targets.write,
      progress: 0,
      completed: false,
      focusArea: primaryFocus,
    },
    {
      id: generateId(),
      type: 'build',
      title: `Build ${String(targets.build)} syllables`,
      description: `Construct ${String(targets.build)} valid Thai syllables in Word Builder`,
      target: targets.build,
      progress: 0,
      completed: false,
      focusArea: secondaryFocus,
    },
    {
      id: generateId(),
      type: 'review',
      title: `Review ${String(targets.review)} cards`,
      description: `Review flashcards with 80%+ accuracy`,
      target: targets.review,
      progress: 0,
      completed: false,
      deckId: reviewDeckId,
      focusArea: 'vocabulary',
    },
  ];

  return challenges;
}

/**
 * Get today's challenges. If stale or missing, generate fresh ones.
 */
export async function getTodaysChallenges(): Promise<DailyChallenge> {
  const today = toLocalDateKey(new Date());

  const existing = await db.dailyChallenges.where('date').equals(today).first();

  if (existing) return existing;

  // Find the most recent challenge record for streak info
  const allChallenges = await db.dailyChallenges.orderBy('date').reverse().limit(1).toArray();

  const lastRecord = allChallenges[0];
  let streakDays = 0;

  if (lastRecord) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toLocalDateKey(yesterday);

    if (lastRecord.date === yesterdayKey && lastRecord.allCompleted) {
      streakDays = lastRecord.completionStreakDays + 1;
    }
  }

  const challenges = await generateChallenges(streakDays);

  const newRecord: DailyChallenge = {
    date: today,
    challenges,
    allCompleted: false,
    completionStreakDays: streakDays,
  };

  const id = await db.dailyChallenges.add(newRecord);
  return { ...newRecord, id: id! };
}

/**
 * Update the progress of a specific challenge.
 * Returns the updated DailyChallenge record.
 */
export async function updateChallengeProgress(
  challengeId: string,
  progressDelta: number,
): Promise<DailyChallenge | null> {
  const today = toLocalDateKey(new Date());
  const record = await db.dailyChallenges.where('date').equals(today).first();

  if (record?.id === undefined) return null;

  const updatedChallenges = record.challenges.map(ch => {
    if (ch.id !== challengeId) return ch;
    const newProgress = Math.min(ch.target, ch.progress + progressDelta);
    const completed = newProgress >= ch.target;
    return {
      ...ch,
      progress: newProgress,
      completed,
      completedAt: completed && !ch.completed ? Date.now() : ch.completedAt,
    };
  });

  const allCompleted = updatedChallenges.every(ch => ch.completed);

  await db.dailyChallenges.update(record.id, {
    challenges: updatedChallenges,
    allCompleted,
  });

  return {
    ...record,
    challenges: updatedChallenges,
    allCompleted,
  };
}

/**
 * Reset today's challenges (useful for testing).
 */
export async function resetTodaysChallenges(): Promise<DailyChallenge> {
  const today = toLocalDateKey(new Date());
  const existing = await db.dailyChallenges.where('date').equals(today).first();

  if (existing?.id !== undefined) {
    await db.dailyChallenges.delete(existing.id);
  }

  return getTodaysChallenges();
}

/**
 * Increment progress for a specific challenge type if there is an active incomplete challenge today.
 */
export async function incrementChallengeProgress(type: 'write' | 'build' | 'review', delta = 1): Promise<void> {
  const today = toLocalDateKey(new Date());
  const record = await db.dailyChallenges.where('date').equals(today).first();
  if (!record) return;

  const challenge = record.challenges.find(c => c.type === type && !c.completed);
  if (!challenge) return;

  await updateChallengeProgress(challenge.id, delta);
}

