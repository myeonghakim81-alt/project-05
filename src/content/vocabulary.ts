import type { Phrase, VocabularyItem } from '@/types/domain';

// Level 2 — Survival English (spec 17). Every word carries 3+ phrases across
// different contexts (spec 7) — never a single sentence per word.
export const vocabulary: VocabularyItem[] = [
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
];

export function vocabularyById(id: string): VocabularyItem | undefined {
  return vocabulary.find((v) => v.id === id);
}

export function vocabularyByLevel(level: number): VocabularyItem[] {
  return vocabulary.filter((v) => v.level === level);
}

// spec 7 — the same word is heard across many contexts, never just once.
export const phrases: Phrase[] = [
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
];

export function phrasesForWord(vocabularyItemId: string): Phrase[] {
  return phrases.filter((p) => p.vocabularyItemId === vocabularyItemId);
}
