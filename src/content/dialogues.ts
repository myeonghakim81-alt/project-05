import type { DialogueScript } from '@/types/domain';

// Scripted roleplay (spec 10, 21). No live LLM call needed: the AI side is
// pre-written, and the learner's free-text/spoken reply is only ever scanned
// for natural word usage — never graded against one "correct" answer.
export const dialogues: DialogueScript[] = [
  {
    id: 'dialogue-book-a-table',
    contextId: 'ctx-restaurant',
    title: 'Booking a table',
    situation: 'You are calling a restaurant to book a table for tonight.',
    targetVocabularyIds: ['word-reservation', 'word-available', 'word-recommend', 'word-crowded', 'word-convenient'],
    turns: [
      {
        id: 'turn-1',
        aiText: "Good evening, thanks for calling Luna Restaurant. How can I help you?",
        naturalWordIds: ['word-reservation'],
        placeholder: "e.g. I'd like to make a reservation for tonight.",
      },
      {
        id: 'turn-2',
        aiText: 'Sure! What time would you like to come in?',
        naturalWordIds: ['word-available', 'word-convenient'],
        placeholder: 'e.g. Is 7pm available? / Is 7pm convenient?',
      },
      {
        id: 'turn-3',
        aiText: "Let me check... yes, we have a table at 7. It might be a bit busy around then, just so you know.",
        naturalWordIds: ['word-crowded'],
        placeholder: 'e.g. Is it usually crowded at that time?',
      },
      {
        id: 'turn-4',
        aiText: "It can get crowded on weekends, yes. Anything else before I confirm your booking?",
        naturalWordIds: ['word-recommend'],
        placeholder: 'e.g. What do you recommend?',
      },
      {
        id: 'turn-5',
        aiText: "Great choice. You're all set for tonight — see you then!",
        naturalWordIds: [],
        placeholder: 'e.g. Thank you, see you tonight.',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bbook(?:ing)? a table\b/i, suggestVocabularyId: 'word-reservation' },
      { pattern: /\bfree\b/i, suggestVocabularyId: 'word-available' },
      { pattern: /\bbusy\b/i, suggestVocabularyId: 'word-crowded' },
      { pattern: /\bsuggest\b/i, suggestVocabularyId: 'word-recommend' },
    ],
  },
];

export function dialogueById(id: string): DialogueScript | undefined {
  return dialogues.find((d) => d.id === id);
}
