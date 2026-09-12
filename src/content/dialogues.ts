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
        aiText: 'Good evening, thanks for calling Luna Restaurant. How can I help you?',
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
        aiText: 'It can get crowded on weekends, yes. Anything else before I confirm your booking?',
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
  {
    id: 'dialogue-hotel-checkin',
    contextId: 'ctx-hotel',
    title: 'Checking in at a hotel',
    situation: "You've just arrived at your hotel after a long trip and are checking in at the front desk.",
    targetVocabularyIds: ['word-checkin', 'word-reservation', 'word-available', 'word-key'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Welcome to Cedar Hotel! How can I help you today?',
        naturalWordIds: ['word-checkin', 'word-reservation'],
        placeholder: "e.g. I'd like to check in. I have a reservation.",
      },
      {
        id: 'turn-2',
        aiText: 'Great, may I have your name please? ... Thank you. Unfortunately your room won\'t be ready for another hour.',
        naturalWordIds: ['word-available'],
        placeholder: 'e.g. Is any other room available now?',
      },
      {
        id: 'turn-3',
        aiText: "I do have one available on a higher floor, if that works for you.",
        naturalWordIds: ['word-key'],
        placeholder: "e.g. That's fine, can I get the key now?",
      },
      {
        id: 'turn-4',
        aiText: 'Here you go — room 512. Anything else you need?',
        naturalWordIds: [],
        placeholder: 'e.g. No thank you, that\'s all.',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bcheck(?:ing)? in\b/i, suggestVocabularyId: 'word-checkin' },
      { pattern: /\bbooked\b/i, suggestVocabularyId: 'word-reservation' },
      { pattern: /\bfree\b/i, suggestVocabularyId: 'word-available' },
    ],
  },
  {
    id: 'dialogue-cafe-order',
    contextId: 'ctx-cafe',
    title: 'Ordering at a cafe',
    situation: "You're at a busy cafe counter about to order a drink.",
    targetVocabularyIds: ['word-order', 'word-recommend', 'word-available'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hi there, what can I get for you?',
        naturalWordIds: ['word-order'],
        placeholder: "e.g. I'd like to order a latte.",
      },
      {
        id: 'turn-2',
        aiText: "Sure. We're out of oat milk today, sorry about that.",
        naturalWordIds: ['word-available'],
        placeholder: 'e.g. What milk is available then?',
      },
      {
        id: 'turn-3',
        aiText: 'We have regular and almond milk. Anything else?',
        naturalWordIds: ['word-recommend'],
        placeholder: 'e.g. What do you recommend to go with it?',
      },
      {
        id: 'turn-4',
        aiText: "Good pick. That'll be ready in a few minutes!",
        naturalWordIds: [],
        placeholder: 'e.g. Thanks a lot.',
      },
    ],
    naturalAlternatives: [{ pattern: /\bI'?ll (have|get|take)\b/i, suggestVocabularyId: 'word-order' }],
  },
  {
    id: 'dialogue-asking-directions',
    contextId: 'ctx-directions',
    title: 'Asking for directions',
    situation: "You're a bit lost and stop a stranger on the street to ask for directions.",
    targetVocabularyIds: ['word-nearby', 'word-straight', 'word-turn'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Sure, how can I help?',
        naturalWordIds: ['word-nearby'],
        placeholder: 'e.g. Is there a subway station nearby?',
      },
      {
        id: 'turn-2',
        aiText: "Yes, it's not far. Head down this street first.",
        naturalWordIds: ['word-straight'],
        placeholder: 'e.g. Should I just go straight?',
      },
      {
        id: 'turn-3',
        aiText: "Straight for two blocks, then there's a turn you'll need to make.",
        naturalWordIds: ['word-turn'],
        placeholder: 'e.g. Which way do I turn?',
      },
      {
        id: 'turn-4',
        aiText: "Turn right, and you'll see it right away. Good luck!",
        naturalWordIds: [],
        placeholder: 'e.g. Thank you so much!',
      },
    ],
    naturalAlternatives: [{ pattern: /\bclose by\b/i, suggestVocabularyId: 'word-nearby' }],
  },
];

export function dialogueById(id: string): DialogueScript | undefined {
  return dialogues.find((d) => d.id === id);
}

// Picks the roleplay that best fits a word: prefer a dialogue that targets it
// directly, otherwise one set in the same context as the word's first phrase,
// otherwise the first dialogue available.
export function dialogueForWord(vocabularyItemId: string, phraseContextId?: string): DialogueScript {
  const directMatch = dialogues.find((d) => d.targetVocabularyIds.includes(vocabularyItemId));
  if (directMatch) return directMatch;
  const contextMatch = phraseContextId ? dialogues.find((d) => d.contextId === phraseContextId) : undefined;
  return contextMatch ?? dialogues[0];
}
