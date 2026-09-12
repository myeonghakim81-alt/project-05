import {
  MasteryThreshold,
  ScoreThresholds,
  VocabularyBucketThresholds,
  WeaknessThreshold,
  vocabularyToSpeechGap,
} from '@/lib/policy';
import type { LearnerVocabulary, MasteryState, NextActivity, SkillScores, VocabularyItem } from '@/types/domain';

// spec 13: adaptive "what to practice next" — bottleneck-driven, in order.
export function nextActivityFor(scores: SkillScores): NextActivity {
  if (scores.recognition < ScoreThresholds.recognition) return 'vocabulary_exposure';
  if (scores.listening < ScoreThresholds.listening) return 'contextual_listening';
  if (scores.recall < ScoreThresholds.recall) return 'retrieval_practice';
  if (scores.expression < ScoreThresholds.expression) return 'sentence_generation';
  if (scores.conversationUsage < ScoreThresholds.conversationUsage) return 'roleplay';
  if (scores.contextTransfer < ScoreThresholds.contextTransfer) return 'new_context';
  if (scores.automaticity < ScoreThresholds.automaticity) return 'delayed_free_conversation';
  return 'increase_review_interval';
}

// spec 3: derives the coarse mastery ladder from the underlying scores.
// MASTERED requires every score to clear the bar — never granted from a
// single vocabulary quiz (spec 3, 15).
export function deriveMasteryState(scores: SkillScores): MasteryState {
  const all = Object.values(scores);
  if (all.every((s) => s >= MasteryThreshold)) return 'MASTERED';
  if (scores.automaticity >= ScoreThresholds.automaticity) return 'AUTOMATIC';
  if (scores.contextTransfer >= ScoreThresholds.contextTransfer) return 'TRANSFERABLE';
  if (scores.conversationUsage >= ScoreThresholds.conversationUsage) return 'CONVERSATIONAL';
  if (scores.expression >= ScoreThresholds.expression) return 'EXPRESSIVE';
  if (scores.recall >= ScoreThresholds.recall) return 'RECALL_READY';
  if (scores.listening >= ScoreThresholds.listening) return 'LISTENING_READY';
  if (scores.contextUnderstanding >= ScoreThresholds.recognition) return 'CONTEXTUAL';
  if (scores.recognition >= ScoreThresholds.recognition) return 'RECOGNITION';
  return 'EXPOSURE';
}

export function isWeak(scores: SkillScores): boolean {
  return Object.values(scores).some((s) => s < WeaknessThreshold);
}

export function weakestSkill(scores: SkillScores): keyof SkillScores {
  const entries = Object.entries(scores) as [keyof SkillScores, number][];
  return entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
}

// Nudge a score toward a target, clamped 0-100. Used by every scoring step
// instead of hard-setting values, so repeated practice moves gradually.
export function nudge(current: number, target: number, weight = 0.4): number {
  const next = current + (target - current) * weight;
  return Math.max(0, Math.min(100, Math.round(next)));
}

function averageScore(scores: SkillScores): number {
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Picks which word to work on next: continue the weakest word already in
// progress, otherwise start the next word that hasn't been touched yet
// (spec 17 curriculum order via `level`), otherwise loop back to the first.
export function pickRecommendedWord(
  vocabularyList: VocabularyItem[],
  entries: Record<string, LearnerVocabulary>,
): VocabularyItem {
  const ordered = [...vocabularyList].sort((a, b) => a.level - b.level);

  const inProgress = ordered
    .map((item) => ({ item, entry: entries[item.id] }))
    .filter((c): c is { item: VocabularyItem; entry: LearnerVocabulary } => Boolean(c.entry) && averageScore(c.entry.scores) > 0);

  const weakestInProgress = inProgress
    .filter((c) => averageScore(c.entry.scores) < MasteryThreshold)
    .sort((a, b) => averageScore(a.entry.scores) - averageScore(b.entry.scores))[0];
  if (weakestInProgress) return weakestInProgress.item;

  const notStarted = ordered.find((item) => !entries[item.id]);
  return notStarted ?? ordered[0];
}

export interface DashboardSummary {
  overall: number;
  scores: SkillScores;
  passiveVocabularyCount: number;
  activeVocabularyCount: number;
  automaticVocabularyCount: number;
  vocabularyToSpeechGap: number;
}

export function summarizeDashboard(entries: LearnerVocabulary[]): DashboardSummary {
  if (entries.length === 0) {
    const zero: SkillScores = {
      recognition: 0,
      listening: 0,
      contextUnderstanding: 0,
      recall: 0,
      expression: 0,
      conversationUsage: 0,
      contextTransfer: 0,
      automaticity: 0,
      pronunciation: 0,
    };
    return {
      overall: 0,
      scores: zero,
      passiveVocabularyCount: 0,
      activeVocabularyCount: 0,
      automaticVocabularyCount: 0,
      vocabularyToSpeechGap: 0,
    };
  }

  const keys = Object.keys(entries[0].scores) as (keyof SkillScores)[];
  const scores = keys.reduce((acc, key) => {
    acc[key] = Math.round(entries.reduce((sum, e) => sum + e.scores[key], 0) / entries.length);
    return acc;
  }, {} as SkillScores);

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / keys.length);

  let passive = 0;
  let active = 0;
  let automatic = 0;
  for (const e of entries) {
    const understanding = (e.scores.recognition + e.scores.listening) / 2;
    if (understanding >= VocabularyBucketThresholds.passive) passive += 1;
    if (understanding >= VocabularyBucketThresholds.passive && e.scores.conversationUsage >= VocabularyBucketThresholds.active)
      active += 1;
    if (e.scores.automaticity >= VocabularyBucketThresholds.automatic) automatic += 1;
  }

  return {
    overall,
    scores,
    passiveVocabularyCount: passive,
    activeVocabularyCount: active,
    automaticVocabularyCount: automatic,
    vocabularyToSpeechGap: vocabularyToSpeechGap(scores),
  };
}
