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
