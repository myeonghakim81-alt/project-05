import type { DialogueScript, VocabularyItem } from '@/types/domain';

export interface WordUsageResult {
  vocabularyItemId: string;
  used: boolean;
}

export interface AlternativeSuggestion {
  matchedPhrase: string;
  suggestVocabularyId: string;
}

export interface ConversationAnalysis {
  wordUsage: WordUsageResult[];
  alternativeSuggestions: AlternativeSuggestion[];
  learnerWordCount: number;
  learnerTurnCount: number;
}

function containsWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // matches the base form and simple inflections (recommend/recommends/recommended/recommending)
  const pattern = new RegExp(`\\b${escaped}(s|ed|ing)?\\b`, 'i');
  return pattern.test(text);
}

// Scans the learner's own turns only — never the AI's — for natural use of
// each target word, plus near-synonyms the learner already knows (spec 10,
// 11). This is a plain keyword/regex analysis, not a claim of deep NLU.
export function analyzeConversation(
  learnerTurns: string[],
  dialogue: DialogueScript,
  vocabularyItems: VocabularyItem[],
): ConversationAnalysis {
  const fullText = learnerTurns.join(' ');

  const wordUsage: WordUsageResult[] = dialogue.targetVocabularyIds.map((id) => {
    const item = vocabularyItems.find((v) => v.id === id);
    return { vocabularyItemId: id, used: item ? containsWord(fullText, item.word) : false };
  });

  const alternativeSuggestions: AlternativeSuggestion[] = [];
  for (const alt of dialogue.naturalAlternatives) {
    const alreadyUsedTarget = wordUsage.find((w) => w.vocabularyItemId === alt.suggestVocabularyId)?.used;
    const match = fullText.match(alt.pattern);
    if (match && !alreadyUsedTarget) {
      alternativeSuggestions.push({ matchedPhrase: match[0], suggestVocabularyId: alt.suggestVocabularyId });
    }
  }

  return {
    wordUsage,
    alternativeSuggestions,
    learnerWordCount: fullText.trim().length > 0 ? fullText.trim().split(/\s+/).length : 0,
    learnerTurnCount: learnerTurns.filter((t) => t.trim().length > 0).length,
  };
}
