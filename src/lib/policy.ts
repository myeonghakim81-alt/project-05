// Thresholds and score formulas kept as configurable policy (spec 22.10),
// not scattered magic numbers, so they can be tuned later from real data.

export const ScoreThresholds = {
  recognition: 70,
  listening: 70,
  recall: 65,
  expression: 65,
  conversationUsage: 60,
  contextTransfer: 60,
  automaticity: 55,
};

// Score below this counts as "weak" and gets queued for review (spec 14).
export const WeaknessThreshold = 60;

// A word only becomes MASTERED once every score clears this bar (spec 3, 15).
export const MasteryThreshold = 80;

export const VocabularyBucketThresholds = {
  passive: 40, // recognition+listening avg above this => counted as passive vocab
  active: 60, // + conversationUsage above this => counted as active vocab
  automatic: 80, // + automaticity above this => counted as automatic vocab
};

// spec 5: Vocabulary-to-Speech Gap = avg(recognition, listening) - avg(conversation, automaticity)
export function vocabularyToSpeechGap(scores: {
  recognition: number;
  listening: number;
  conversationUsage: number;
  automaticity: number;
}): number {
  const understanding = (scores.recognition + scores.listening) / 2;
  const production = (scores.conversationUsage + scores.automaticity) / 2;
  return Math.round(understanding - production);
}

export const SpacedReviewIntervalsDays = [1, 2, 4, 7, 14, 30];

// How many due words a single /review session pulls in at once — reviews
// are meant to be a quick daily pass, not another full level-study session.
export const DailyReviewCap = 15;

// spec 17: the curriculum runs Level 1-10. Content doesn't necessarily exist
// yet for every level (see vocabularyByLevel) — this is the ceiling the
// placement test and level-up logic aim at, not a claim that it's all built.
export const MaxCurriculumLevel = 10;

// How many words the placement test and each level-study attempt sample per
// level, instead of testing every word in levels that have hundreds.
export const PlacementSampleSize = 8;
export const LevelStudySampleSize = 10;

// A level score >= this advances to the next level; below LevelDropThreshold
// drops back a level; the band between is a repeat of the same level.
export const LevelPassThreshold = 90;
export const LevelDropThreshold = 60;
