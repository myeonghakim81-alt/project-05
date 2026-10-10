import {
  MasteryThreshold,
  ScoreThresholds,
  VocabularyBucketThresholds,
  WeaknessThreshold,
  vocabularyToSpeechGap,
} from '@/lib/policy';
import { shuffle } from '@/lib/scoring';
import { dueForReview } from '@/lib/srs';
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

// Korean label for the dashboard's "현재 영어 실력" indicator, bucketed off
// the curriculum level (1-MaxCurriculumLevel) rather than a raw skill score,
// since that's the number learners already recognize from the level cards.
const LevelLabelBands: [maxLevel: number, label: string][] = [
  [2, '입문'],
  [4, '초급'],
  [6, '중급'],
  [8, '중고급'],
  [10, '고급'],
];

export function levelLabel(level: number): string {
  for (const [maxLevel, label] of LevelLabelBands) {
    if (level <= maxLevel) return label;
  }
  return '고급';
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

// Picks a level-study day's batch of words. Never-seen words come first (so
// "10 words a day" actually walks through the whole level exactly once,
// instead of the old pure-random sample which could take hundreds of days to
// cover a level via the coupon-collector effect and never guaranteed full
// coverage at all). Once a level has been fully seen, words previously
// gotten wrong (LearnerVocabulary.failureCount > 0, see recordWordTestResult
// in learnerStore.ts) are prioritized before untroubled ones, so mistakes
// resurface in the next day's session rather than only in the separate
// weak-score/spaced-review queues.
export function pickLevelStudySample(
  words: VocabularyItem[],
  entries: Record<string, LearnerVocabulary>,
  sampleSize: number,
): VocabularyItem[] {
  const unseen = shuffle(words.filter((w) => !entries[w.id]));
  const seen = words.filter((w) => entries[w.id]);
  const mistaken = seen
    .filter((w) => entries[w.id].failureCount > 0)
    .sort((a, b) => entries[b.id].failureCount - entries[a.id].failureCount);
  const clean = shuffle(seen.filter((w) => entries[w.id].failureCount === 0));

  const sample: VocabularyItem[] = [];
  for (const pool of [unseen, mistaken, clean]) {
    for (const w of pool) {
      if (sample.length >= sampleSize) return sample;
      sample.push(w);
    }
  }
  return sample;
}

export interface DailySessionItem {
  item: VocabularyItem;
  isNew: boolean;
  isCarryOver: boolean;
}

// /daily ("오늘의 학습"): a single session that mixes spaced-repetition
// review (any level, so difficulty is naturally mixed) with a trickle of
// new words from the learner's current level, instead of /level-study's
// single-level scope. Composition, in priority order:
//   1. words due for review today (dueForReview), capped at `reviewCap`
//   2. up to `carryOverCount` words whose LAST review fell on the previous
//      calendar day and aren't already covered by (1) — forces 1-2 very
//      recent words to resurface a day later even before their formal SRS
//      gap is up
//   3. new words from the current level (pickLevelStudySample) filling the
//      rest up to `sessionSize`
export function buildDailySession(
  allWords: VocabularyItem[],
  currentLevelWords: VocabularyItem[],
  entries: Record<string, LearnerVocabulary>,
  sessionSize: number,
  reviewCap: number,
  carryOverCount: number,
  now: Date = new Date(),
): DailySessionItem[] {
  const dueIds = dueForReview(entries, now).slice(0, reviewCap);
  const dueSet = new Set(dueIds);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const carryCandidates = Object.values(entries)
    .filter((e) => !dueSet.has(e.vocabularyItemId) && e.lastReviewedAt)
    .filter((e) => {
      const t = new Date(e.lastReviewedAt as string).getTime();
      return t >= yesterdayStart.getTime() && t < todayStart.getTime();
    })
    .map((e) => e.vocabularyItemId);
  const carryIds = shuffle(carryCandidates).slice(0, carryOverCount);

  const reviewIds = [...dueIds, ...carryIds];
  const carrySet = new Set(carryIds);
  const reviewItems: DailySessionItem[] = reviewIds
    .map((id) => allWords.find((w) => w.id === id))
    .filter((w): w is VocabularyItem => Boolean(w))
    .map((item) => ({ item, isNew: false, isCarryOver: carrySet.has(item.id) }));

  const usedIds = new Set(reviewItems.map((r) => r.item.id));
  const remaining = Math.max(0, sessionSize - reviewItems.length);
  const newItems: DailySessionItem[] = pickLevelStudySample(
    currentLevelWords.filter((w) => !usedIds.has(w.id)),
    entries,
    remaining,
  ).map((item) => ({ item, isNew: !entries[item.id], isCarryOver: false }));

  return [...reviewItems, ...newItems];
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
