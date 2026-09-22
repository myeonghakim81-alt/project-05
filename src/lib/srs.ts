import { SpacedReviewIntervalsDays } from '@/lib/policy';
import type { LearnerVocabulary } from '@/types/domain';

// Spaced-repetition scheduling (spec 14/16): each successful review pushes
// the next one further out along SpacedReviewIntervalsDays; a failed one
// steps back so the word comes around again sooner. srsStage is the index
// used for THIS scheduling — it only advances after a success, so a brand
// new word (srsStage 0) is first due back in SpacedReviewIntervalsDays[0]
// days, not immediately.
export function scheduleReview(
  entry: Pick<LearnerVocabulary, 'srsStage'>,
  success: boolean,
  now: Date = new Date(),
): { srsStage: number; nextReviewAt: string; lastReviewedAt: string } {
  const maxStage = SpacedReviewIntervalsDays.length - 1;
  const stageForInterval = success ? entry.srsStage : Math.max(0, entry.srsStage - 1);
  const days = SpacedReviewIntervalsDays[Math.min(stageForInterval, maxStage)];
  const nextReviewAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  const srsStage = success ? Math.min(entry.srsStage + 1, maxStage) : stageForInterval;
  return { srsStage, nextReviewAt, lastReviewedAt: now.toISOString() };
}

// Words whose scheduled review has come up, oldest-due first — the pool a
// /review session draws from. A word with no schedule yet (never finished a
// first learning pass) isn't "due", it's just not started.
export function dueForReview(entries: Record<string, LearnerVocabulary>, now: Date = new Date()): string[] {
  return Object.values(entries)
    .filter((e): e is LearnerVocabulary & { nextReviewAt: string } => e.nextReviewAt !== null && new Date(e.nextReviewAt) <= now)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
    .map((e) => e.vocabularyItemId);
}
