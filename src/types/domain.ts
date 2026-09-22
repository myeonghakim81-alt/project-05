// Core domain types — mirrors spec section 20 (핵심 데이터 모델).
// Content data (VocabularyItem/Phrase/Context/DialogueScript) and learner state
// (LearnerVocabulary/ConversationSession/...) are kept as separate concerns so
// new words/contexts can be added without touching engine logic (spec 22.7-22.8).

export type MasteryState =
  | 'EXPOSURE'
  | 'RECOGNITION'
  | 'CONTEXTUAL'
  | 'LISTENING_READY'
  | 'RECALL_READY'
  | 'EXPRESSIVE'
  | 'CONVERSATIONAL'
  | 'TRANSFERABLE'
  | 'AUTOMATIC'
  | 'MASTERED';

export const MASTERY_STATE_ORDER: MasteryState[] = [
  'EXPOSURE',
  'RECOGNITION',
  'CONTEXTUAL',
  'LISTENING_READY',
  'RECALL_READY',
  'EXPRESSIVE',
  'CONVERSATIONAL',
  'TRANSFERABLE',
  'AUTOMATIC',
  'MASTERED',
];

// The 9 independently-tracked abilities (spec 2.2). Never collapse these into
// a single "known/unknown" boolean.
export interface SkillScores {
  recognition: number;
  listening: number;
  contextUnderstanding: number;
  recall: number;
  expression: number;
  conversationUsage: number;
  contextTransfer: number;
  automaticity: number;
  pronunciation: number;
}

export function emptySkillScores(): SkillScores {
  return {
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
}

export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  meaning: string; // short Korean gloss for the word itself, e.g. "가다" for "go" (verb) — NOT a sentence
  pronunciation: string; // IPA or simplified respelling
  difficulty: number; // 1-10
  level: number; // curriculum level (spec 17), 1-10
  topic: string; // display grouping label, e.g. "Restaurant" (spec 17 curriculum topics)
}

export interface ContextItem {
  id: string;
  category: string; // e.g. "restaurant", "travel"
  level: number;
  description: string;
}

// Sentence difficulty is independent of the word's own difficulty (spec 8:
// difficulty ramps up separately from vocabulary) — an easy word should still
// get harder example sentences sometimes, and a hard word needs at least one
// easy sentence so the learner isn't fighting new vocabulary and hard syntax
// at the same time.
export type PhraseDifficulty = 'easy' | 'medium' | 'hard';

export interface Phrase {
  id: string;
  vocabularyItemId: string;
  text: string;
  meaning: string;
  contextId: string;
  difficulty: PhraseDifficulty;
}

// A single line spoken by the AI in a scripted roleplay. Free-form LLM
// generation is not required for the MVP web build (spec 21 accepts scripted
// content); this keeps the conversation loop working with zero API cost.
export interface DialogueTurn {
  id: string;
  aiText: string;
  // Words that would fit naturally in response to this turn. Used only for
  // post-hoc feedback — never surfaced to the learner as an instruction
  // (spec 10: "AI가 이 단어를 반드시 사용하세요 강요해서는 안 된다").
  naturalWordIds: string[];
  placeholder: string; // hint shown in the response input
}

export interface DialogueScript {
  id: string;
  contextId: string;
  title: string;
  situation: string;
  targetVocabularyIds: string[];
  turns: DialogueTurn[];
  // Maps a common alternative phrase to a target word the learner already
  // knows, so feedback can say "you used X, you could also use Y" (spec 10).
  naturalAlternatives: { pattern: RegExp; suggestVocabularyId: string }[];
}

export interface LearnerVocabulary {
  userId: string;
  vocabularyItemId: string;
  scores: SkillScores;
  masteryState: MasteryState;
  reviewCount: number;
  failureCount: number;
  lastReviewedAt: string | null; // ISO timestamp
  nextReviewAt: string | null;
}

export interface VocabularyContextPerformance {
  userId: string;
  vocabularyItemId: string;
  contextId: string;
  score: number;
  successfulUses: number;
  failedUses: number;
  lastUsedAt: string | null;
}

export type ConversationUsageType = 'used_correctly' | 'used_incorrectly' | 'not_used' | 'reused_new_context';

export interface ConversationVocabularyUsage {
  conversationId: string;
  vocabularyItemId: string;
  usageType: ConversationUsageType;
  correctness: number; // 0-100
  naturalness: number; // 0-100
  confidence: number; // 0-100
}

export interface ConversationSession {
  id: string;
  userId: string;
  contextId: string;
  startedAt: string;
  endedAt: string | null;
  transcript: { speaker: 'ai' | 'learner'; text: string; atMs: number }[];
  overallScore: number | null;
}

export interface LevelProgress {
  userId: string;
  currentLevel: number;
  placementCompleted: boolean;
}

export type NextActivity =
  | 'vocabulary_exposure'
  | 'contextual_listening'
  | 'retrieval_practice'
  | 'sentence_generation'
  | 'roleplay'
  | 'new_context'
  | 'delayed_free_conversation'
  | 'increase_review_interval';
