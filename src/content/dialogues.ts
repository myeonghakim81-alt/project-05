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
  {
    id: 'dialogue-taking-the-train',
    contextId: 'ctx-transportation',
    title: 'Taking the train',
    situation: "You're at a train station trying to catch your train.",
    targetVocabularyIds: ['word-ticket', 'word-platform'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hi, can I help you find something?',
        naturalWordIds: ['word-ticket'],
        placeholder: 'e.g. Where can I buy a ticket?',
      },
      {
        id: 'turn-2',
        aiText: 'Right over there at the machine. Where are you headed?',
        naturalWordIds: [],
        placeholder: "e.g. I'm heading to the airport.",
      },
      {
        id: 'turn-3',
        aiText: 'Got it — that train leaves from platform 4.',
        naturalWordIds: ['word-platform'],
        placeholder: 'e.g. Thanks, which way is platform 4?',
      },
      {
        id: 'turn-4',
        aiText: 'Just down the stairs to your right. You should make it in time!',
        naturalWordIds: [],
        placeholder: 'e.g. Thank you so much!',
      },
    ],
    naturalAlternatives: [{ pattern: /\bwhere can i buy\b/i, suggestVocabularyId: 'word-ticket' }],
  },

  // --- Level 1 ---
  {
    id: 'dialogue-first-meeting',
    contextId: 'ctx-introductions',
    title: 'Meeting someone new',
    situation: 'You are meeting a new coworker for the first time.',
    targetVocabularyIds: ['word-hello', 'word-name', 'word-meet', 'word-from', 'word-live', 'word-old'],
    turns: [
      {
        id: 'turn-1',
        aiText: "Hi there! I don't think we've met yet.",
        naturalWordIds: ['word-hello', 'word-name'],
        placeholder: 'e.g. Hello! My name is ...',
      },
      {
        id: 'turn-2',
        aiText: 'Nice to meet you! Where are you from?',
        naturalWordIds: ['word-meet', 'word-from'],
        placeholder: "e.g. Nice to meet you too. I'm from ...",
      },
      {
        id: 'turn-3',
        aiText: 'That\'s great. Do you live near the office?',
        naturalWordIds: ['word-live'],
        placeholder: 'e.g. Yes, I live nearby.',
      },
      {
        id: 'turn-4',
        aiText: "Nice! If you don't mind me asking, how old are you?",
        naturalWordIds: ['word-old'],
        placeholder: "e.g. I'm ... years old.",
      },
      {
        id: 'turn-5',
        aiText: 'Got it, thanks for sharing! Welcome to the team.',
        naturalWordIds: [],
        placeholder: 'e.g. Thank you, happy to be here.',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bI'?m from\b/i, suggestVocabularyId: 'word-from' },
      { pattern: /\bnice to meet\b/i, suggestVocabularyId: 'word-meet' },
    ],
  },
  {
    id: 'dialogue-everyday-manners',
    contextId: 'ctx-courtesy',
    title: 'Everyday manners',
    situation: "You bump into someone on the street and have a quick, polite exchange.",
    targetVocabularyIds: ['word-sorry', 'word-please', 'word-number', 'word-thank-you'],
    turns: [
      {
        id: 'turn-1',
        aiText: "Oh, sorry about that, I wasn't looking!",
        naturalWordIds: ['word-sorry'],
        placeholder: "e.g. No worries, I'm sorry too.",
      },
      {
        id: 'turn-2',
        aiText: 'Could you tell me the time, please?',
        naturalWordIds: ['word-please'],
        placeholder: "e.g. Sure, it's 3 o'clock.",
      },
      {
        id: 'turn-3',
        aiText: 'Thanks so much! Also, could I get your number in case I find your bag later?',
        naturalWordIds: ['word-number'],
        placeholder: "e.g. Sure, here's my number.",
      },
      {
        id: 'turn-4',
        aiText: 'Great, thank you!',
        naturalWordIds: ['word-thank-you'],
        placeholder: 'e.g. Thank you too, take care!',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bmy fault\b/i, suggestVocabularyId: 'word-sorry' },
      { pattern: /\bcheers\b/i, suggestVocabularyId: 'word-thank-you' },
    ],
  },
  {
    id: 'dialogue-making-plans',
    contextId: 'ctx-time',
    title: 'Making plans',
    situation: "You're texting a friend to make plans for the next few days.",
    targetVocabularyIds: ['word-today', 'word-tomorrow', 'word-meet', 'word-goodbye'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hey! Are you free today?',
        naturalWordIds: ['word-today'],
        placeholder: "e.g. Not today, I'm busy.",
      },
      {
        id: 'turn-2',
        aiText: 'No problem — how about tomorrow then?',
        naturalWordIds: ['word-tomorrow'],
        placeholder: 'e.g. Tomorrow works for me.',
      },
      {
        id: 'turn-3',
        aiText: 'Great, should we meet at the cafe?',
        naturalWordIds: ['word-meet'],
        placeholder: "e.g. Yes, let's meet at 3.",
      },
      {
        id: 'turn-4',
        aiText: 'Perfect, see you then!',
        naturalWordIds: ['word-goodbye'],
        placeholder: 'e.g. Great, goodbye for now!',
      },
    ],
    naturalAlternatives: [{ pattern: /\bsee you (then|tomorrow)\b/i, suggestVocabularyId: 'word-goodbye' }],
  },

  // --- Level 3 ---
  {
    id: 'dialogue-coworker-chat',
    contextId: 'ctx-job',
    title: 'Getting to know a coworker',
    situation: "You're chatting with a coworker during a coffee break.",
    targetVocabularyIds: ['word-job', 'word-work', 'word-family', 'word-appointment'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'So, what do you do? What\'s your job?',
        naturalWordIds: ['word-job'],
        placeholder: "e.g. I'm a designer, and you?",
      },
      {
        id: 'turn-2',
        aiText: 'Nice! Where do you work?',
        naturalWordIds: ['word-work'],
        placeholder: 'e.g. I work at a small startup.',
      },
      {
        id: 'turn-3',
        aiText: 'That sounds interesting. Do you have any family here in the city?',
        naturalWordIds: ['word-family'],
        placeholder: 'e.g. Yes, my family lives nearby.',
      },
      {
        id: 'turn-4',
        aiText: "That's nice to hear. Oh, I almost forgot — do you have an appointment at 3?",
        naturalWordIds: ['word-appointment'],
        placeholder: 'e.g. Yes, I have an appointment then.',
      },
      {
        id: 'turn-5',
        aiText: "Good, don't be late! See you around.",
        naturalWordIds: [],
        placeholder: 'e.g. Thanks, see you later!',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bI(?:'m| am) a\b/i, suggestVocabularyId: 'word-job' },
      { pattern: /\bI work at\b/i, suggestVocabularyId: 'word-work' },
    ],
  },
  {
    id: 'dialogue-weekend-smalltalk',
    contextId: 'ctx-hobbies',
    title: 'Weekend small talk',
    situation: "A friend asks about your weekend plans.",
    targetVocabularyIds: ['word-hobby', 'word-favorite', 'word-prefer', 'word-weather', 'word-rain'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hi! Any plans for the weekend? Do you have a hobby you enjoy?',
        naturalWordIds: ['word-hobby'],
        placeholder: 'e.g. Yes, my hobby is hiking.',
      },
      {
        id: 'turn-2',
        aiText: "That's great! What's your favorite place to go?",
        naturalWordIds: ['word-favorite'],
        placeholder: 'e.g. My favorite place is the mountain trail.',
      },
      {
        id: 'turn-3',
        aiText: 'Nice choice. Do you prefer hiking in the morning or afternoon?',
        naturalWordIds: ['word-prefer'],
        placeholder: 'e.g. I prefer the morning.',
      },
      {
        id: 'turn-4',
        aiText: "Good call — have you checked the weather?",
        naturalWordIds: ['word-weather'],
        placeholder: 'e.g. The weather looks nice.',
      },
      {
        id: 'turn-5',
        aiText: 'Great, though it might rain later, so bring a jacket.',
        naturalWordIds: ['word-rain'],
        placeholder: "e.g. Thanks, I'll bring one in case it rains.",
      },
    ],
    naturalAlternatives: [
      { pattern: /\bI like\b/i, suggestVocabularyId: 'word-favorite' },
      { pattern: /\bI'?d rather\b/i, suggestVocabularyId: 'word-prefer' },
    ],
  },
  {
    id: 'dialogue-planning-the-week',
    contextId: 'ctx-daily-routine',
    title: 'Planning the week',
    situation: "You're catching up with a friend about your week.",
    targetVocabularyIds: ['word-usually', 'word-wake-up', 'word-schedule', 'word-brother'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'What time do you usually wake up on weekdays?',
        naturalWordIds: ['word-usually', 'word-wake-up'],
        placeholder: 'e.g. I usually wake up at 7.',
      },
      {
        id: 'turn-2',
        aiText: 'Wow, early! What does your schedule look like today?',
        naturalWordIds: ['word-schedule'],
        placeholder: 'e.g. My schedule is pretty full today.',
      },
      {
        id: 'turn-3',
        aiText: 'Busy day! By the way, is your brother still visiting?',
        naturalWordIds: ['word-brother'],
        placeholder: 'e.g. Yes, my brother is staying until Friday.',
      },
      {
        id: 'turn-4',
        aiText: 'That\'s nice, enjoy the time together!',
        naturalWordIds: [],
        placeholder: 'e.g. Thanks, I will!',
      },
    ],
    naturalAlternatives: [{ pattern: /\bget up\b/i, suggestVocabularyId: 'word-wake-up' }],
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
