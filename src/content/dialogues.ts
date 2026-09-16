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

  // --- Level 4 ---
  {
    id: 'dialogue-planning-a-party',
    contextId: 'ctx-invitations',
    title: 'Planning a party',
    situation: "A friend is planning a party and talking to you about it.",
    targetVocabularyIds: ['word-party', 'word-invite', 'word-friend', 'word-excited'],
    turns: [
      {
        id: 'turn-1',
        aiText: "Hey, I'm planning a party next Saturday.",
        naturalWordIds: ['word-party'],
        placeholder: "e.g. That sounds fun, who's coming to the party?",
      },
      {
        id: 'turn-2',
        aiText: 'Just a few people. Do you want to invite anyone?',
        naturalWordIds: ['word-invite'],
        placeholder: 'e.g. Sure, can I invite a friend?',
      },
      {
        id: 'turn-3',
        aiText: 'Of course! The more the merrier.',
        naturalWordIds: ['word-friend'],
        placeholder: 'e.g. Great, my friend would love it.',
      },
      {
        id: 'turn-4',
        aiText: "Awesome, it's going to be a great night!",
        naturalWordIds: ['word-excited'],
        placeholder: "e.g. I'm so excited already!",
      },
    ],
    naturalAlternatives: [{ pattern: /\bcome to my\b/i, suggestVocabularyId: 'word-invite' }],
  },
  {
    id: 'dialogue-asking-for-a-favor',
    contextId: 'ctx-requests',
    title: 'Asking for a favor',
    situation: "You need to ask a coworker for help after making a mistake.",
    targetVocabularyIds: ['word-ask', 'word-favor', 'word-mistake', 'word-apologize'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hey, is now a good time to talk?',
        naturalWordIds: ['word-ask'],
        placeholder: 'e.g. Sure, can I ask you something?',
      },
      {
        id: 'turn-2',
        aiText: "Of course, what's up?",
        naturalWordIds: ['word-favor'],
        placeholder: 'e.g. Could you do me a favor?',
      },
      {
        id: 'turn-3',
        aiText: 'Sure thing. What do you need?',
        naturalWordIds: ['word-mistake'],
        placeholder: 'e.g. I made a mistake on the report.',
      },
      {
        id: 'turn-4',
        aiText: "No worries, mistakes happen. I'll help you fix it.",
        naturalWordIds: ['word-apologize'],
        placeholder: 'e.g. Thanks, I really apologize for the trouble.',
      },
    ],
    naturalAlternatives: [
      { pattern: /\bsorry\b/i, suggestVocabularyId: 'word-apologize' },
      { pattern: /\berror\b/i, suggestVocabularyId: 'word-mistake' },
    ],
  },
  {
    id: 'dialogue-catching-up-weekend',
    contextId: 'ctx-weekends',
    title: 'Catching up about the weekend',
    situation: "A friend asks how your weekend went.",
    targetVocabularyIds: ['word-weekend', 'word-relax', 'word-happen', 'word-feel', 'word-experience'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Hey! How was your weekend?',
        naturalWordIds: ['word-weekend'],
        placeholder: 'e.g. My weekend was great, thanks!',
      },
      {
        id: 'turn-2',
        aiText: 'Nice, did you get to relax at all?',
        naturalWordIds: ['word-relax'],
        placeholder: 'e.g. Yes, I relaxed at home most of the time.',
      },
      {
        id: 'turn-3',
        aiText: 'Sounds peaceful. Anything interesting happen?',
        naturalWordIds: ['word-happen'],
        placeholder: 'e.g. Actually, something funny happened.',
      },
      {
        id: 'turn-4',
        aiText: 'Oh really? Tell me more, how did it feel?',
        naturalWordIds: ['word-feel', 'word-experience'],
        placeholder: 'e.g. It was a strange experience, but I feel good about it now.',
      },
    ],
    naturalAlternatives: [{ pattern: /\bchill(ed)?\b/i, suggestVocabularyId: 'word-relax' }],
  },

  // --- Level 5 ---
  {
    id: 'dialogue-party-small-talk',
    contextId: 'ctx-small-talk',
    title: 'Small talk at a party',
    situation: "You're chatting with someone you just met at a party.",
    targetVocabularyIds: ['word-interesting', 'word-curious', 'word-agree', 'word-by-the-way'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'So, what do you do for fun?',
        naturalWordIds: ['word-interesting'],
        placeholder: 'e.g. I do something pretty interesting actually.',
      },
      {
        id: 'turn-2',
        aiText: "Oh really? Tell me more, I'm curious.",
        naturalWordIds: ['word-curious'],
        placeholder: "e.g. Sure! I'm curious about your hobbies too.",
      },
      {
        id: 'turn-3',
        aiText: "That sounds like a lot of fun — I'd agree it's a great hobby.",
        naturalWordIds: ['word-agree'],
        placeholder: 'e.g. Yeah, I totally agree.',
      },
      {
        id: 'turn-4',
        aiText: 'By the way, are you going to the concert this weekend?',
        naturalWordIds: ['word-by-the-way'],
        placeholder: "e.g. By the way, I heard it's sold out.",
      },
    ],
    naturalAlternatives: [{ pattern: /\bI'?d love to know\b/i, suggestVocabularyId: 'word-curious' }],
  },
  {
    id: 'dialogue-movies-and-food',
    contextId: 'ctx-movies-music',
    title: 'Talking about movies and food',
    situation: "You and a friend are chatting about movies before deciding where to eat.",
    targetVocabularyIds: ['word-genre', 'word-actor', 'word-song', 'word-delicious'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Do you watch a lot of movies? What genre do you like?',
        naturalWordIds: ['word-genre'],
        placeholder: 'e.g. I really like the comedy genre.',
      },
      {
        id: 'turn-2',
        aiText: "Nice, who's your favorite actor?",
        naturalWordIds: ['word-actor'],
        placeholder: 'e.g. My favorite actor is ...',
      },
      {
        id: 'turn-3',
        aiText: 'Great choice! Have you heard the new song from that movie?',
        naturalWordIds: ['word-song'],
        placeholder: 'e.g. Yes, that song is amazing.',
      },
      {
        id: 'turn-4',
        aiText: 'I know, right? Anyway, want to grab something delicious to eat after?',
        naturalWordIds: ['word-delicious'],
        placeholder: 'e.g. Sure, I know a place with delicious food.',
      },
    ],
    naturalAlternatives: [{ pattern: /\btasty\b/i, suggestVocabularyId: 'word-delicious' }],
  },
  {
    id: 'dialogue-travel-stories',
    contextId: 'ctx-travel-experiences',
    title: 'Sharing travel stories',
    situation: "A friend is asking about a trip you took abroad.",
    targetVocabularyIds: ['word-abroad', 'word-memorable', 'word-tradition', 'word-custom', 'word-spicy'],
    turns: [
      {
        id: 'turn-1',
        aiText: 'Have you ever traveled abroad?',
        naturalWordIds: ['word-abroad'],
        placeholder: 'e.g. Yes, I traveled abroad last year.',
      },
      {
        id: 'turn-2',
        aiText: 'Nice, what was the most memorable part?',
        naturalWordIds: ['word-memorable'],
        placeholder: 'e.g. The most memorable part was the festival.',
      },
      {
        id: 'turn-3',
        aiText: 'That sounds amazing — did you learn about any local traditions or customs?',
        naturalWordIds: ['word-tradition', 'word-custom'],
        placeholder: 'e.g. Yes, there was an interesting tradition.',
      },
      {
        id: 'turn-4',
        aiText: 'Cool! How was the food, was it spicy?',
        naturalWordIds: ['word-spicy'],
        placeholder: 'e.g. It was really spicy but delicious.',
      },
    ],
    naturalAlternatives: [
      { pattern: /\boverseas\b/i, suggestVocabularyId: 'word-abroad' },
      { pattern: /\bhot\b/i, suggestVocabularyId: 'word-spicy' },
    ],
  },
];

export function dialogueById(id: string): DialogueScript | undefined {
  return dialogues.find((d) => d.id === id);
}

// Picks the roleplay that best fits a word: prefer a dialogue that targets it
// directly, otherwise one set in the same context as the word's first
// phrase, otherwise none. Returning an unrelated dialogue used to be the
// fallback here, which meant an unmatched word silently got a nonsensical
// roleplay (e.g. a restaurant conversation for a train-station word) — no
// dialogue is the honest answer, and the lesson screen skips the roleplay
// step when this happens rather than force one that doesn't fit.
export function dialogueForWord(vocabularyItemId: string, phraseContextId?: string): DialogueScript | undefined {
  const directMatch = dialogues.find((d) => d.targetVocabularyIds.includes(vocabularyItemId));
  if (directMatch) return directMatch;
  return phraseContextId ? dialogues.find((d) => d.contextId === phraseContextId) : undefined;
}
