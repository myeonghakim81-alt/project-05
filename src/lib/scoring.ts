import type { Phrase, PhraseDifficulty, VocabularyItem } from '@/types/domain';

// Shared scoring/selection helpers used by both the per-word lesson screen
// (lesson.tsx) and the level-test/level-study screens, so the two places
// that ask "did they get this right" never drift apart.

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const DIFFICULTY_RANK: Record<PhraseDifficulty, number> = { easy: 0, medium: 1, hard: 2 };

export function sortByDifficulty<T extends { difficulty: PhraseDifficulty }>(items: T[]): T[] {
  return [...items].sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);
}

export function uniqueByMeaning<T extends { meaning: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.meaning)) return false;
    seen.add(item.meaning);
    return true;
  });
}

export interface MeaningChoice {
  id: string;
  meaning: string;
  correct: boolean;
}

// A fixed 3-way "which meaning did you hear/read?" choice — the correct
// translation plus two distractors from unrelated words. See lesson.tsx's
// listen-step comment for why this replaced a "guess the category" quiz.
export function buildMeaningChoices(currentPhrase: Phrase, allPhrases: Phrase[]): MeaningChoice[] {
  const distractors = uniqueByMeaning(
    allPhrases.filter((p) => p.vocabularyItemId !== currentPhrase.vocabularyItemId && p.meaning !== currentPhrase.meaning),
  ).slice(0, 2);
  return shuffle([
    { id: 'correct', meaning: currentPhrase.meaning, correct: true },
    ...distractors.map((d, i) => ({ id: `distractor-${i}`, meaning: d.meaning, correct: false })),
  ]);
}

// Same idea as buildMeaningChoices but for testing word-level meaning (not
// sentence meaning) — used by the placement test and level-study word-test
// phase. See lesson.tsx's Listen step for why sentence-meaning quizzes stay
// on buildMeaningChoices instead.
export function buildWordMeaningChoices(currentWord: VocabularyItem, allWords: VocabularyItem[]): MeaningChoice[] {
  const sameLevelPool = allWords.filter((w) => w.id !== currentWord.id && w.level === currentWord.level && w.meaning !== currentWord.meaning);
  const pool = sameLevelPool.length >= 2 ? sameLevelPool : allWords.filter((w) => w.id !== currentWord.id && w.meaning !== currentWord.meaning);
  const distractors = uniqueByMeaning(pool.map((w) => ({ meaning: w.meaning }))).slice(0, 2);
  return shuffle([
    { id: 'correct', meaning: currentWord.meaning, correct: true },
    ...distractors.map((d, i) => ({ id: `distractor-${i}`, meaning: d.meaning, correct: false })),
  ]);
}

export function wordOverlap(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  const aWords = new Set(normalize(a));
  const bWords = normalize(b);
  if (bWords.length === 0) return 0;
  const matched = bWords.filter((w) => aWords.has(w)).length;
  return Math.round((matched / bWords.length) * 100);
}

// Combines how many target words the recognizer actually heard (a proxy for
// pronunciation accuracy — mispronounced words are usually misheard as
// different words) with the recognizer's own confidence in what it heard.
// Manual text edits have no meaningful confidence, so they fall back to word
// match alone.
export function estimatePronunciationScore(recallScore: number, confidence: number, usedVoice: boolean): number {
  if (!usedVoice) return recallScore;
  return Math.round(recallScore * 0.6 + confidence * 100 * 0.4);
}

// Same heuristic the Express step in lesson.tsx uses: did they actually use
// the target word, and did they write a real sentence rather than the word
// alone.
export function scoreExpressSentence(word: string, text: string): number {
  const usesWord = new RegExp(`\\b${word}(s|ed|ing)?\\b`, 'i').test(text);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return usesWord && wordCount >= 3 ? 85 : usesWord ? 60 : 25;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
