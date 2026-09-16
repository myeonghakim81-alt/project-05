import type { Phrase, VocabularyItem } from '@/types/domain';

// Every word carries 3+ phrases across different contexts (spec 7) — never a
// single sentence per word. Levels follow the 10-level curriculum in spec 17;
// levels increase context diversity and speaking freedom, not just word
// count (spec 17, "레벨이 올라갈수록 단어 수만 증가시키지 않는다").
export const vocabulary: VocabularyItem[] = [
  // --- Level 1 — English Foundations ---
  {
    id: 'word-hello',
    word: 'hello',
    partOfSpeech: 'interjection',
    definition: 'used as a greeting when meeting someone or answering the phone',
    pronunciation: '/həˈloʊ/',
    difficulty: 1,
    level: 1,
    topic: 'Greetings',
  },
  {
    id: 'word-goodbye',
    word: 'goodbye',
    partOfSpeech: 'interjection',
    definition: 'used when leaving someone or ending a conversation',
    pronunciation: '/ˌɡʊdˈbaɪ/',
    difficulty: 1,
    level: 1,
    topic: 'Greetings',
  },
  {
    id: 'word-name',
    word: 'name',
    partOfSpeech: 'noun',
    definition: "what a person or thing is called",
    pronunciation: '/neɪm/',
    difficulty: 1,
    level: 1,
    topic: 'Introductions',
  },
  {
    id: 'word-meet',
    word: 'meet',
    partOfSpeech: 'verb',
    definition: 'to see and talk to someone for the first time, or by arrangement',
    pronunciation: '/miːt/',
    difficulty: 1,
    level: 1,
    topic: 'Introductions',
  },
  {
    id: 'word-from',
    word: 'from',
    partOfSpeech: 'preposition',
    definition: 'indicating the place or origin someone or something comes from',
    pronunciation: '/frʌm/',
    difficulty: 1,
    level: 1,
    topic: 'Introductions',
  },
  {
    id: 'word-live',
    word: 'live',
    partOfSpeech: 'verb',
    definition: 'to have your home in a particular place',
    pronunciation: '/lɪv/',
    difficulty: 1,
    level: 1,
    topic: 'Introductions',
  },
  {
    id: 'word-old',
    word: 'old',
    partOfSpeech: 'adjective',
    definition: 'having lived or existed for a long time; used to ask someone\'s age',
    pronunciation: '/oʊld/',
    difficulty: 1,
    level: 1,
    topic: 'Introductions',
  },
  {
    id: 'word-please',
    word: 'please',
    partOfSpeech: 'adverb',
    definition: 'used to make a request more polite',
    pronunciation: '/pliːz/',
    difficulty: 1,
    level: 1,
    topic: 'Courtesy',
  },
  {
    id: 'word-thank-you',
    word: 'thank you',
    partOfSpeech: 'phrase',
    definition: 'used to express gratitude',
    pronunciation: '/ˈθæŋk juː/',
    difficulty: 1,
    level: 1,
    topic: 'Courtesy',
  },
  {
    id: 'word-sorry',
    word: 'sorry',
    partOfSpeech: 'interjection',
    definition: 'used to apologize for something',
    pronunciation: '/ˈsɑːri/',
    difficulty: 1,
    level: 1,
    topic: 'Courtesy',
  },
  {
    id: 'word-today',
    word: 'today',
    partOfSpeech: 'adverb',
    definition: 'on or during this present day',
    pronunciation: '/təˈdeɪ/',
    difficulty: 1,
    level: 1,
    topic: 'Time & Date',
  },
  {
    id: 'word-tomorrow',
    word: 'tomorrow',
    partOfSpeech: 'adverb',
    definition: 'on the day after today',
    pronunciation: '/təˈmɔːroʊ/',
    difficulty: 2,
    level: 1,
    topic: 'Time & Date',
  },
  {
    id: 'word-number',
    word: 'number',
    partOfSpeech: 'noun',
    definition: 'a word or symbol used for counting or identifying, e.g. a phone number',
    pronunciation: '/ˈnʌmbər/',
    difficulty: 2,
    level: 1,
    topic: 'Numbers',
  },

  // --- Level 2 — Survival English ---
  {
    id: 'word-recommend',
    word: 'recommend',
    partOfSpeech: 'verb',
    definition: 'to suggest that someone or something is good or suitable for a particular purpose',
    pronunciation: '/ˌrɛkəˈmɛnd/',
    difficulty: 3,
    level: 2,
    topic: 'Restaurant',
  },
  {
    id: 'word-reservation',
    word: 'reservation',
    partOfSpeech: 'noun',
    definition: 'an arrangement to have a table, room, seat, etc. kept for you',
    pronunciation: '/ˌrɛzərˈveɪʃən/',
    difficulty: 4,
    level: 2,
    topic: 'Restaurant',
  },
  {
    id: 'word-available',
    word: 'available',
    partOfSpeech: 'adjective',
    definition: 'able to be used or obtained; free to do something',
    pronunciation: '/əˈveɪləbəl/',
    difficulty: 3,
    level: 2,
    topic: 'Restaurant',
  },
  {
    id: 'word-crowded',
    word: 'crowded',
    partOfSpeech: 'adjective',
    definition: 'full of people',
    pronunciation: '/ˈkraʊdɪd/',
    difficulty: 2,
    level: 2,
    topic: 'Restaurant',
  },
  {
    id: 'word-convenient',
    word: 'convenient',
    partOfSpeech: 'adjective',
    definition: 'suitable for your needs and plans; not causing problems',
    pronunciation: '/kənˈviːniənt/',
    difficulty: 4,
    level: 2,
    topic: 'Restaurant',
  },
  {
    id: 'word-checkin',
    word: 'check in',
    partOfSpeech: 'phrasal verb',
    definition: 'to arrive and register at a hotel, airport, etc.',
    pronunciation: '/tʃɛk ɪn/',
    difficulty: 3,
    level: 2,
    topic: 'Hotel',
  },
  {
    id: 'word-key',
    word: 'key',
    partOfSpeech: 'noun',
    definition: 'a card or object used to open a lock, such as a hotel room door',
    pronunciation: '/kiː/',
    difficulty: 1,
    level: 2,
    topic: 'Hotel',
  },
  {
    id: 'word-order',
    word: 'order',
    partOfSpeech: 'verb',
    definition: 'to ask for food, drink, or a product to be brought or sent to you',
    pronunciation: '/ˈɔːrdər/',
    difficulty: 2,
    level: 2,
    topic: 'Cafe',
  },
  {
    id: 'word-turn',
    word: 'turn',
    partOfSpeech: 'verb',
    definition: 'to change direction while moving',
    pronunciation: '/tɜːrn/',
    difficulty: 2,
    level: 2,
    topic: 'Directions',
  },
  {
    id: 'word-straight',
    word: 'straight',
    partOfSpeech: 'adverb',
    definition: 'continuing in one direction without turning',
    pronunciation: '/streɪt/',
    difficulty: 2,
    level: 2,
    topic: 'Directions',
  },
  {
    id: 'word-nearby',
    word: 'nearby',
    partOfSpeech: 'adjective',
    definition: 'not far away; close',
    pronunciation: '/ˌnɪrˈbaɪ/',
    difficulty: 2,
    level: 2,
    topic: 'Directions',
  },
  {
    id: 'word-ticket',
    word: 'ticket',
    partOfSpeech: 'noun',
    definition: 'a piece of paper or digital pass that shows you have paid to travel or enter somewhere',
    pronunciation: '/ˈtɪkɪt/',
    difficulty: 2,
    level: 2,
    topic: 'Transportation',
  },
  {
    id: 'word-platform',
    word: 'platform',
    partOfSpeech: 'noun',
    definition: 'the area in a station where you get on or off a train',
    pronunciation: '/ˈplætfɔːrm/',
    difficulty: 3,
    level: 2,
    topic: 'Transportation',
  },

  // --- Level 3 — Basic Conversation ---
  {
    id: 'word-family',
    word: 'family',
    partOfSpeech: 'noun',
    definition: 'a group of people related to each other, such as parents and children',
    pronunciation: '/ˈfæməli/',
    difficulty: 2,
    level: 3,
    topic: 'Family',
  },
  {
    id: 'word-brother',
    word: 'brother',
    partOfSpeech: 'noun',
    definition: 'a male sibling',
    pronunciation: '/ˈbrʌðər/',
    difficulty: 2,
    level: 3,
    topic: 'Family',
  },
  {
    id: 'word-job',
    word: 'job',
    partOfSpeech: 'noun',
    definition: 'the work someone does regularly to earn money',
    pronunciation: '/dʒɑːb/',
    difficulty: 2,
    level: 3,
    topic: 'Job',
  },
  {
    id: 'word-work',
    word: 'work',
    partOfSpeech: 'verb',
    definition: 'to do a job, often for a company or organization',
    pronunciation: '/wɜːrk/',
    difficulty: 2,
    level: 3,
    topic: 'Job',
  },
  {
    id: 'word-hobby',
    word: 'hobby',
    partOfSpeech: 'noun',
    definition: 'an activity you do regularly for enjoyment in your free time',
    pronunciation: '/ˈhɑːbi/',
    difficulty: 2,
    level: 3,
    topic: 'Hobbies',
  },
  {
    id: 'word-favorite',
    word: 'favorite',
    partOfSpeech: 'adjective',
    definition: 'liked more than any other of the same kind',
    pronunciation: '/ˈfeɪvərɪt/',
    difficulty: 2,
    level: 3,
    topic: 'Preferences',
  },
  {
    id: 'word-prefer',
    word: 'prefer',
    partOfSpeech: 'verb',
    definition: 'to like one thing more than another',
    pronunciation: '/prɪˈfɜːr/',
    difficulty: 3,
    level: 3,
    topic: 'Preferences',
  },
  {
    id: 'word-usually',
    word: 'usually',
    partOfSpeech: 'adverb',
    definition: 'most of the time; more often than not',
    pronunciation: '/ˈjuːʒuəli/',
    difficulty: 3,
    level: 3,
    topic: 'Daily Routine',
  },
  {
    id: 'word-wake-up',
    word: 'wake up',
    partOfSpeech: 'phrasal verb',
    definition: 'to stop sleeping and become conscious',
    pronunciation: '/weɪk ʌp/',
    difficulty: 2,
    level: 3,
    topic: 'Daily Routine',
  },
  {
    id: 'word-weather',
    word: 'weather',
    partOfSpeech: 'noun',
    definition: 'the condition of the atmosphere, e.g. sunny, rainy, or cold',
    pronunciation: '/ˈweðər/',
    difficulty: 2,
    level: 3,
    topic: 'Weather',
  },
  {
    id: 'word-rain',
    word: 'rain',
    partOfSpeech: 'verb',
    definition: 'when water falls from the clouds',
    pronunciation: '/reɪn/',
    difficulty: 2,
    level: 3,
    topic: 'Weather',
  },
  {
    id: 'word-appointment',
    word: 'appointment',
    partOfSpeech: 'noun',
    definition: 'an arrangement to meet someone or be somewhere at a fixed time',
    pronunciation: '/əˈpɔɪntmənt/',
    difficulty: 3,
    level: 3,
    topic: 'Appointments',
  },
  {
    id: 'word-schedule',
    word: 'schedule',
    partOfSpeech: 'noun',
    definition: 'a plan of things to do and when to do them',
    pronunciation: '/ˈskedʒuːl/',
    difficulty: 3,
    level: 3,
    topic: 'Appointments',
  },
];

export function vocabularyById(id: string): VocabularyItem | undefined {
  return vocabulary.find((v) => v.id === id);
}

export function vocabularyByLevel(level: number): VocabularyItem[] {
  return vocabulary.filter((v) => v.level === level);
}

// spec 7 — the same word is heard across many contexts, never just once.
export const phrases: Phrase[] = [
  // --- Level 1 ---
  // hello
  { id: 'phrase-hello-greetings', vocabularyItemId: 'word-hello', text: 'Hello! How are you?', meaning: '안녕하세요! 어떻게 지내세요?', contextId: 'ctx-greetings' },
  { id: 'phrase-hello-introductions', vocabularyItemId: 'word-hello', text: "Hello, I'm Claude.", meaning: '안녕하세요, 저는 클로드입니다.', contextId: 'ctx-introductions' },
  { id: 'phrase-hello-casual', vocabularyItemId: 'word-hello', text: 'Hello? Is anyone there?', meaning: '여보세요? 거기 누구 계세요?', contextId: 'ctx-casual' },

  // goodbye
  { id: 'phrase-goodbye-greetings', vocabularyItemId: 'word-goodbye', text: 'Goodbye, see you tomorrow!', meaning: '안녕히 가세요, 내일 봐요!', contextId: 'ctx-greetings' },
  { id: 'phrase-goodbye-introductions', vocabularyItemId: 'word-goodbye', text: 'It was nice meeting you, goodbye!', meaning: '만나서 반가웠어요, 안녕히 가세요!', contextId: 'ctx-introductions' },
  { id: 'phrase-goodbye-casual', vocabularyItemId: 'word-goodbye', text: 'I have to say goodbye now.', meaning: '이제 작별 인사를 해야겠어요.', contextId: 'ctx-casual' },

  // name
  { id: 'phrase-name-introductions', vocabularyItemId: 'word-name', text: "What's your name?", meaning: '이름이 뭐예요?', contextId: 'ctx-introductions' },
  { id: 'phrase-name-courtesy', vocabularyItemId: 'word-name', text: 'Could I have your name, please?', meaning: '성함을 알려주시겠어요?', contextId: 'ctx-courtesy' },
  { id: 'phrase-name-casual', vocabularyItemId: 'word-name', text: 'I forgot his name.', meaning: '그의 이름을 잊어버렸어요.', contextId: 'ctx-casual' },

  // meet
  { id: 'phrase-meet-introductions', vocabularyItemId: 'word-meet', text: 'Nice to meet you.', meaning: '만나서 반가워요.', contextId: 'ctx-introductions' },
  { id: 'phrase-meet-time', vocabularyItemId: 'word-meet', text: 'When can we meet?', meaning: '언제 만날 수 있을까요?', contextId: 'ctx-time' },
  { id: 'phrase-meet-casual', vocabularyItemId: 'word-meet', text: "Let's meet at 5pm.", meaning: '5시에 만나요.', contextId: 'ctx-casual' },

  // from
  { id: 'phrase-from-introductions', vocabularyItemId: 'word-from', text: 'Where are you from?', meaning: '어디서 오셨어요?', contextId: 'ctx-introductions' },
  { id: 'phrase-from-courtesy', vocabularyItemId: 'word-from', text: "I'm calling from the front desk.", meaning: '프런트 데스크에서 전화드립니다.', contextId: 'ctx-courtesy' },
  { id: 'phrase-from-casual', vocabularyItemId: 'word-from', text: 'This gift is from my friend.', meaning: '이 선물은 제 친구가 준 거예요.', contextId: 'ctx-casual' },

  // live
  { id: 'phrase-live-introductions', vocabularyItemId: 'word-live', text: 'Where do you live?', meaning: '어디 사세요?', contextId: 'ctx-introductions' },
  { id: 'phrase-live-courtesy', vocabularyItemId: 'word-live', text: 'Do you live alone?', meaning: '혼자 사세요?', contextId: 'ctx-courtesy' },
  { id: 'phrase-live-casual', vocabularyItemId: 'word-live', text: 'I live near here.', meaning: '저는 이 근처에 살아요.', contextId: 'ctx-casual' },

  // old
  { id: 'phrase-old-introductions', vocabularyItemId: 'word-old', text: 'How old are you?', meaning: '몇 살이에요?', contextId: 'ctx-introductions' },
  { id: 'phrase-old-numbers', vocabularyItemId: 'word-old', text: "I'm twenty years old.", meaning: '저는 스무 살이에요.', contextId: 'ctx-numbers' },
  { id: 'phrase-old-casual', vocabularyItemId: 'word-old', text: 'This building is very old.', meaning: '이 건물은 매우 오래됐어요.', contextId: 'ctx-casual' },

  // please
  { id: 'phrase-please-courtesy', vocabularyItemId: 'word-please', text: 'Please sit down.', meaning: '앉아 주세요.', contextId: 'ctx-courtesy' },
  { id: 'phrase-please-numbers', vocabularyItemId: 'word-please', text: 'Two coffees, please.', meaning: '커피 두 잔 주세요.', contextId: 'ctx-numbers' },
  { id: 'phrase-please-casual', vocabularyItemId: 'word-please', text: 'Can you help me, please?', meaning: '도와주시겠어요?', contextId: 'ctx-casual' },

  // thank you
  { id: 'phrase-thankyou-courtesy', vocabularyItemId: 'word-thank-you', text: 'Thank you very much.', meaning: '정말 감사합니다.', contextId: 'ctx-courtesy' },
  { id: 'phrase-thankyou-introductions', vocabularyItemId: 'word-thank-you', text: 'Thank you, nice to meet you too.', meaning: '감사합니다, 저도 만나서 반가워요.', contextId: 'ctx-introductions' },
  { id: 'phrase-thankyou-casual', vocabularyItemId: 'word-thank-you', text: 'Thank you for coming.', meaning: '와주셔서 감사합니다.', contextId: 'ctx-casual' },

  // sorry
  { id: 'phrase-sorry-courtesy', vocabularyItemId: 'word-sorry', text: "I'm sorry for being late.", meaning: '늦어서 죄송합니다.', contextId: 'ctx-courtesy' },
  { id: 'phrase-sorry-introductions', vocabularyItemId: 'word-sorry', text: "Sorry, I didn't catch your name.", meaning: '죄송한데 성함을 못 들었어요.', contextId: 'ctx-introductions' },
  { id: 'phrase-sorry-casual', vocabularyItemId: 'word-sorry', text: 'Sorry, can you repeat that?', meaning: '죄송한데 다시 말씀해 주시겠어요?', contextId: 'ctx-casual' },

  // today
  { id: 'phrase-today-time', vocabularyItemId: 'word-today', text: "What's the date today?", meaning: '오늘 며칠이에요?', contextId: 'ctx-time' },
  { id: 'phrase-today-courtesy', vocabularyItemId: 'word-today', text: 'Is the office open today?', meaning: '오늘 사무실 문 열어요?', contextId: 'ctx-courtesy' },
  { id: 'phrase-today-casual', vocabularyItemId: 'word-today', text: 'I feel great today.', meaning: '오늘 기분이 아주 좋아요.', contextId: 'ctx-casual' },

  // tomorrow
  { id: 'phrase-tomorrow-time', vocabularyItemId: 'word-tomorrow', text: 'See you tomorrow.', meaning: '내일 봐요.', contextId: 'ctx-time' },
  { id: 'phrase-tomorrow-courtesy', vocabularyItemId: 'word-tomorrow', text: 'Can we meet tomorrow instead?', meaning: '대신 내일 만날 수 있을까요?', contextId: 'ctx-courtesy' },
  { id: 'phrase-tomorrow-casual', vocabularyItemId: 'word-tomorrow', text: "I'm busy tomorrow.", meaning: '저는 내일 바빠요.', contextId: 'ctx-casual' },

  // number
  { id: 'phrase-number-numbers', vocabularyItemId: 'word-number', text: "What's your phone number?", meaning: '전화번호가 어떻게 되세요?', contextId: 'ctx-numbers' },
  { id: 'phrase-number-courtesy', vocabularyItemId: 'word-number', text: 'Could you give me your number?', meaning: '번호를 알려주시겠어요?', contextId: 'ctx-courtesy' },
  { id: 'phrase-number-casual', vocabularyItemId: 'word-number', text: 'I forgot the number.', meaning: '번호를 잊어버렸어요.', contextId: 'ctx-casual' },

  // --- Level 2 ---
  // recommend
  { id: 'phrase-recommend-restaurant', vocabularyItemId: 'word-recommend', text: 'What do you recommend?', meaning: '무엇을 추천하시나요?', contextId: 'ctx-restaurant' },
  { id: 'phrase-recommend-travel', vocabularyItemId: 'word-recommend', text: 'Can you recommend a good hotel?', meaning: '좋은 호텔 좀 추천해 주시겠어요?', contextId: 'ctx-travel' },
  { id: 'phrase-recommend-movie', vocabularyItemId: 'word-recommend', text: 'Would you recommend this movie?', meaning: '이 영화 추천하시나요?', contextId: 'ctx-movie' },
  { id: 'phrase-recommend-shopping', vocabularyItemId: 'word-recommend', text: 'Can you recommend something for a gift?', meaning: '선물할 만한 걸 추천해 주시겠어요?', contextId: 'ctx-shopping' },
  { id: 'phrase-recommend-casual', vocabularyItemId: 'word-recommend', text: 'What would you recommend?', meaning: '뭘 추천하시겠어요?', contextId: 'ctx-casual' },

  // reservation
  { id: 'phrase-reservation-restaurant', vocabularyItemId: 'word-reservation', text: "I'd like to make a reservation.", meaning: '예약을 하고 싶습니다.', contextId: 'ctx-restaurant' },
  { id: 'phrase-reservation-hotel', vocabularyItemId: 'word-reservation', text: 'I have a reservation under Kim.', meaning: 'Kim으로 예약했습니다.', contextId: 'ctx-hotel' },
  { id: 'phrase-reservation-travel', vocabularyItemId: 'word-reservation', text: 'Do I need a reservation to visit?', meaning: '방문하려면 예약이 필요한가요?', contextId: 'ctx-travel' },

  // available
  { id: 'phrase-available-restaurant', vocabularyItemId: 'word-available', text: 'Is a table available at 7pm?', meaning: '7시에 자리가 있나요?', contextId: 'ctx-restaurant' },
  { id: 'phrase-available-hotel', vocabularyItemId: 'word-available', text: 'Do you have any rooms available tonight?', meaning: '오늘 밤 이용 가능한 방이 있나요?', contextId: 'ctx-hotel' },
  { id: 'phrase-available-shopping', vocabularyItemId: 'word-available', text: 'Is this available in a different color?', meaning: '이거 다른 색상으로 있나요?', contextId: 'ctx-shopping' },

  // crowded
  { id: 'phrase-crowded-restaurant', vocabularyItemId: 'word-crowded', text: 'This place looks really crowded tonight.', meaning: '오늘 밤 여기 정말 붐비네요.', contextId: 'ctx-restaurant' },
  { id: 'phrase-crowded-transportation', vocabularyItemId: 'word-crowded', text: 'The train is really crowded during rush hour.', meaning: '출퇴근 시간에는 기차가 정말 붐벼요.', contextId: 'ctx-transportation' },
  { id: 'phrase-crowded-travel', vocabularyItemId: 'word-crowded', text: 'This area gets crowded in summer.', meaning: '여름엔 이 지역이 붐벼요.', contextId: 'ctx-travel' },

  // convenient
  { id: 'phrase-convenient-restaurant', vocabularyItemId: 'word-convenient', text: 'Is 7pm a convenient time for you?', meaning: '7시가 편하신가요?', contextId: 'ctx-restaurant' },
  { id: 'phrase-convenient-hotel', vocabularyItemId: 'word-convenient', text: 'The hotel location is very convenient.', meaning: '호텔 위치가 아주 편리해요.', contextId: 'ctx-hotel' },
  { id: 'phrase-convenient-casual', vocabularyItemId: 'word-convenient', text: 'Would tomorrow be more convenient?', meaning: '내일이 더 편하실까요?', contextId: 'ctx-casual' },

  // check in
  { id: 'phrase-checkin-hotel', vocabularyItemId: 'word-checkin', text: "I'd like to check in, please.", meaning: '체크인하고 싶습니다.', contextId: 'ctx-hotel' },
  { id: 'phrase-checkin-travel', vocabularyItemId: 'word-checkin', text: 'What time can I check in?', meaning: '몇 시에 체크인할 수 있나요?', contextId: 'ctx-travel' },
  { id: 'phrase-checkin-casual', vocabularyItemId: 'word-checkin', text: 'Have you checked in yet?', meaning: '너 체크인 했어?', contextId: 'ctx-casual' },

  // key
  { id: 'phrase-key-hotel', vocabularyItemId: 'word-key', text: 'Can I get an extra key?', meaning: '여분의 키를 받을 수 있을까요?', contextId: 'ctx-hotel' },
  { id: 'phrase-key-casual', vocabularyItemId: 'word-key', text: 'I think I left my key inside.', meaning: '안에 키를 두고 온 것 같아요.', contextId: 'ctx-casual' },
  { id: 'phrase-key-travel', vocabularyItemId: 'word-key', text: 'Where do I return the key?', meaning: '키는 어디에 반납하나요?', contextId: 'ctx-travel' },

  // order
  { id: 'phrase-order-cafe', vocabularyItemId: 'word-order', text: "I'd like to order a coffee.", meaning: '커피 주문하고 싶어요.', contextId: 'ctx-cafe' },
  { id: 'phrase-order-restaurant', vocabularyItemId: 'word-order', text: 'Are you ready to order?', meaning: '주문하시겠어요?', contextId: 'ctx-restaurant' },
  { id: 'phrase-order-shopping', vocabularyItemId: 'word-order', text: 'Can I order this online?', meaning: '이거 온라인으로 주문할 수 있나요?', contextId: 'ctx-shopping' },

  // turn
  { id: 'phrase-turn-directions', vocabularyItemId: 'word-turn', text: 'Turn left at the corner.', meaning: '모퉁이에서 좌회전하세요.', contextId: 'ctx-directions' },
  { id: 'phrase-turn-travel', vocabularyItemId: 'word-turn', text: 'Which way do I turn for the station?', meaning: '역으로 가려면 어느 쪽으로 도나요?', contextId: 'ctx-travel' },
  { id: 'phrase-turn-casual', vocabularyItemId: 'word-turn', text: "It's your turn to choose.", meaning: '네가 고를 차례야.', contextId: 'ctx-casual' },

  // straight
  { id: 'phrase-straight-directions', vocabularyItemId: 'word-straight', text: 'Go straight for two blocks.', meaning: '두 블록 직진하세요.', contextId: 'ctx-directions' },
  { id: 'phrase-straight-travel', vocabularyItemId: 'word-straight', text: 'Just walk straight from the exit.', meaning: '출구에서 그냥 직진해서 걸으세요.', contextId: 'ctx-travel' },
  { id: 'phrase-straight-casual', vocabularyItemId: 'word-straight', text: "Just go straight ahead, you can't miss it.", meaning: '그냥 쭉 직진하면 바로 보여요.', contextId: 'ctx-casual' },

  // nearby
  { id: 'phrase-nearby-directions', vocabularyItemId: 'word-nearby', text: 'Is there a pharmacy nearby?', meaning: '근처에 약국이 있나요?', contextId: 'ctx-directions' },
  { id: 'phrase-nearby-travel', vocabularyItemId: 'word-nearby', text: 'Is the hotel nearby the station?', meaning: '호텔이 역 근처에 있나요?', contextId: 'ctx-travel' },
  { id: 'phrase-nearby-shopping', vocabularyItemId: 'word-nearby', text: 'Is there a mall nearby?', meaning: '근처에 쇼핑몰이 있나요?', contextId: 'ctx-shopping' },

  // ticket
  { id: 'phrase-ticket-transportation', vocabularyItemId: 'word-ticket', text: 'Where can I buy a ticket?', meaning: '표는 어디서 살 수 있나요?', contextId: 'ctx-transportation' },
  { id: 'phrase-ticket-movie', vocabularyItemId: 'word-ticket', text: 'Two tickets, please.', meaning: '표 두 장 주세요.', contextId: 'ctx-movie' },
  { id: 'phrase-ticket-travel', vocabularyItemId: 'word-ticket', text: 'Do I need a ticket for the bus?', meaning: '버스 타려면 표가 필요한가요?', contextId: 'ctx-travel' },

  // platform
  { id: 'phrase-platform-transportation', vocabularyItemId: 'word-platform', text: 'Which platform does the train leave from?', meaning: '기차가 몇 번 플랫폼에서 출발하나요?', contextId: 'ctx-transportation' },
  { id: 'phrase-platform-travel', vocabularyItemId: 'word-platform', text: "I can't find the right platform.", meaning: '올바른 플랫폼을 못 찾겠어요.', contextId: 'ctx-travel' },
  { id: 'phrase-platform-casual', vocabularyItemId: 'word-platform', text: 'Wait for me on the platform.', meaning: '플랫폼에서 기다려줘.', contextId: 'ctx-casual' },

  // --- Level 3 ---
  // family
  { id: 'phrase-family-family', vocabularyItemId: 'word-family', text: 'Do you have a big family?', meaning: '가족이 많으세요?', contextId: 'ctx-family' },
  { id: 'phrase-family-introductions', vocabularyItemId: 'word-family', text: 'My family lives in Seoul.', meaning: '저희 가족은 서울에 살아요.', contextId: 'ctx-introductions' },
  { id: 'phrase-family-casual', vocabularyItemId: 'word-family', text: 'I miss my family.', meaning: '가족이 그리워요.', contextId: 'ctx-casual' },

  // brother
  { id: 'phrase-brother-family', vocabularyItemId: 'word-brother', text: 'I have an older brother.', meaning: '저는 형(오빠)이 있어요.', contextId: 'ctx-family' },
  { id: 'phrase-brother-introductions', vocabularyItemId: 'word-brother', text: 'This is my brother, Tom.', meaning: '이쪽은 제 형(오빠) Tom이에요.', contextId: 'ctx-introductions' },
  { id: 'phrase-brother-casual', vocabularyItemId: 'word-brother', text: 'My brother is coming to visit.', meaning: '제 형(오빠)이 방문할 예정이에요.', contextId: 'ctx-casual' },

  // job
  { id: 'phrase-job-job', vocabularyItemId: 'word-job', text: "What's your job?", meaning: '직업이 뭐예요?', contextId: 'ctx-job' },
  { id: 'phrase-job-introductions', vocabularyItemId: 'word-job', text: 'I have a new job.', meaning: '저 새 직장을 구했어요.', contextId: 'ctx-introductions' },
  { id: 'phrase-job-casual', vocabularyItemId: 'word-job', text: "How's the new job going?", meaning: '새 직장은 어때요?', contextId: 'ctx-casual' },

  // work
  { id: 'phrase-work-job', vocabularyItemId: 'word-work', text: 'I work in marketing.', meaning: '저는 마케팅에서 일해요.', contextId: 'ctx-job' },
  { id: 'phrase-work-dailyroutine', vocabularyItemId: 'word-work', text: 'I work from 9 to 6.', meaning: '저는 9시부터 6시까지 일해요.', contextId: 'ctx-daily-routine' },
  { id: 'phrase-work-casual', vocabularyItemId: 'word-work', text: 'Do you work on weekends?', meaning: '주말에도 일하세요?', contextId: 'ctx-casual' },

  // hobby
  { id: 'phrase-hobby-hobbies', vocabularyItemId: 'word-hobby', text: "What's your hobby?", meaning: '취미가 뭐예요?', contextId: 'ctx-hobbies' },
  { id: 'phrase-hobby-preferences', vocabularyItemId: 'word-hobby', text: "I don't really have a hobby.", meaning: '저는 딱히 취미가 없어요.', contextId: 'ctx-preferences' },
  { id: 'phrase-hobby-casual', vocabularyItemId: 'word-hobby', text: 'Reading is my hobby.', meaning: '독서가 제 취미예요.', contextId: 'ctx-casual' },

  // favorite
  { id: 'phrase-favorite-preferences', vocabularyItemId: 'word-favorite', text: "What's your favorite food?", meaning: '가장 좋아하는 음식이 뭐예요?', contextId: 'ctx-preferences' },
  { id: 'phrase-favorite-hobbies', vocabularyItemId: 'word-favorite', text: 'This is my favorite movie.', meaning: '이게 제가 제일 좋아하는 영화예요.', contextId: 'ctx-hobbies' },
  { id: 'phrase-favorite-casual', vocabularyItemId: 'word-favorite', text: "Who's your favorite singer?", meaning: '가장 좋아하는 가수가 누구예요?', contextId: 'ctx-casual' },

  // prefer
  { id: 'phrase-prefer-preferences', vocabularyItemId: 'word-prefer', text: 'I prefer tea to coffee.', meaning: '저는 커피보다 차를 선호해요.', contextId: 'ctx-preferences' },
  { id: 'phrase-prefer-weather', vocabularyItemId: 'word-prefer', text: 'I prefer sunny days.', meaning: '저는 맑은 날이 더 좋아요.', contextId: 'ctx-weather' },
  { id: 'phrase-prefer-casual', vocabularyItemId: 'word-prefer', text: 'Which one do you prefer?', meaning: '어느 게 더 좋으세요?', contextId: 'ctx-casual' },

  // usually
  { id: 'phrase-usually-dailyroutine', vocabularyItemId: 'word-usually', text: 'I usually wake up at 7.', meaning: '저는 보통 7시에 일어나요.', contextId: 'ctx-daily-routine' },
  { id: 'phrase-usually-weather', vocabularyItemId: 'word-usually', text: "It's usually sunny here.", meaning: '여기는 보통 날씨가 맑아요.', contextId: 'ctx-weather' },
  { id: 'phrase-usually-casual', vocabularyItemId: 'word-usually', text: 'I usually walk to work.', meaning: '저는 보통 걸어서 출근해요.', contextId: 'ctx-casual' },

  // wake up
  { id: 'phrase-wakeup-dailyroutine', vocabularyItemId: 'word-wake-up', text: 'What time do you wake up?', meaning: '몇 시에 일어나세요?', contextId: 'ctx-daily-routine' },
  { id: 'phrase-wakeup-appointments', vocabularyItemId: 'word-wake-up', text: 'Wake me up before the appointment.', meaning: '예약 전에 저 좀 깨워주세요.', contextId: 'ctx-appointments' },
  { id: 'phrase-wakeup-casual', vocabularyItemId: 'word-wake-up', text: 'I woke up late today.', meaning: '오늘 늦게 일어났어요.', contextId: 'ctx-casual' },

  // weather
  { id: 'phrase-weather-weather', vocabularyItemId: 'word-weather', text: "How's the weather today?", meaning: '오늘 날씨 어때요?', contextId: 'ctx-weather' },
  { id: 'phrase-weather-dailyroutine', vocabularyItemId: 'word-weather', text: 'I check the weather every morning.', meaning: '저는 매일 아침 날씨를 확인해요.', contextId: 'ctx-daily-routine' },
  { id: 'phrase-weather-casual', vocabularyItemId: 'word-weather', text: 'The weather is perfect for a walk.', meaning: '산책하기 딱 좋은 날씨예요.', contextId: 'ctx-casual' },

  // rain
  { id: 'phrase-rain-weather', vocabularyItemId: 'word-rain', text: "It's raining outside.", meaning: '밖에 비가 와요.', contextId: 'ctx-weather' },
  { id: 'phrase-rain-appointments', vocabularyItemId: 'word-rain', text: 'The event was cancelled because of the rain.', meaning: '비 때문에 행사가 취소됐어요.', contextId: 'ctx-appointments' },
  { id: 'phrase-rain-casual', vocabularyItemId: 'word-rain', text: "Don't forget your umbrella, it might rain.", meaning: '우산 챙기세요, 비 올 수도 있어요.', contextId: 'ctx-casual' },

  // appointment
  { id: 'phrase-appointment-appointments', vocabularyItemId: 'word-appointment', text: "I have a doctor's appointment.", meaning: '병원 예약이 있어요.', contextId: 'ctx-appointments' },
  { id: 'phrase-appointment-job', vocabularyItemId: 'word-appointment', text: 'I have an appointment with a client.', meaning: '고객과 미팅이 있어요.', contextId: 'ctx-job' },
  { id: 'phrase-appointment-casual', vocabularyItemId: 'word-appointment', text: 'Can I reschedule my appointment?', meaning: '예약을 변경할 수 있을까요?', contextId: 'ctx-casual' },

  // schedule
  { id: 'phrase-schedule-appointments', vocabularyItemId: 'word-schedule', text: 'Can we schedule a meeting?', meaning: '회의 일정을 잡을 수 있을까요?', contextId: 'ctx-appointments' },
  { id: 'phrase-schedule-job', vocabularyItemId: 'word-schedule', text: 'My schedule is really busy this week.', meaning: '이번 주 제 일정이 정말 바빠요.', contextId: 'ctx-job' },
  { id: 'phrase-schedule-dailyroutine', vocabularyItemId: 'word-schedule', text: "What's your schedule for tomorrow?", meaning: '내일 일정이 어떻게 되세요?', contextId: 'ctx-daily-routine' },
];

export function phrasesForWord(vocabularyItemId: string): Phrase[] {
  return phrases.filter((p) => p.vocabularyItemId === vocabularyItemId);
}
