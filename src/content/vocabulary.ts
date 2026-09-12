import type { Phrase, VocabularyItem } from '@/types/domain';

export const vocabulary: VocabularyItem[] = [
  {
    id: 'word-recommend',
    word: 'recommend',
    partOfSpeech: 'verb',
    definition: 'to suggest that someone or something is good or suitable for a particular purpose',
    pronunciation: '/ˌrɛkəˈmɛnd/',
    difficulty: 3,
    level: 2,
  },
  {
    id: 'word-reservation',
    word: 'reservation',
    partOfSpeech: 'noun',
    definition: 'an arrangement to have a table, room, seat, etc. kept for you',
    pronunciation: '/ˌrɛzərˈveɪʃən/',
    difficulty: 4,
    level: 2,
  },
  {
    id: 'word-available',
    word: 'available',
    partOfSpeech: 'adjective',
    definition: 'able to be used or obtained; free to do something',
    pronunciation: '/əˈveɪləbəl/',
    difficulty: 3,
    level: 2,
  },
  {
    id: 'word-crowded',
    word: 'crowded',
    partOfSpeech: 'adjective',
    definition: 'full of people',
    pronunciation: '/ˈkraʊdɪd/',
    difficulty: 2,
    level: 2,
  },
  {
    id: 'word-convenient',
    word: 'convenient',
    partOfSpeech: 'adjective',
    definition: 'suitable for your needs and plans; not causing problems',
    pronunciation: '/kənˈviːniənt/',
    difficulty: 4,
    level: 2,
  },
];

export function vocabularyById(id: string): VocabularyItem | undefined {
  return vocabulary.find((v) => v.id === id);
}

// spec 7 — the same word is heard across many contexts, never just once.
export const phrases: Phrase[] = [
  {
    id: 'phrase-recommend-restaurant',
    vocabularyItemId: 'word-recommend',
    text: 'What do you recommend?',
    meaning: '무엇을 추천하시나요?',
    contextId: 'ctx-restaurant',
  },
  {
    id: 'phrase-recommend-travel',
    vocabularyItemId: 'word-recommend',
    text: 'Can you recommend a good hotel?',
    meaning: '좋은 호텔 좀 추천해 주시겠어요?',
    contextId: 'ctx-travel',
  },
  {
    id: 'phrase-recommend-movie',
    vocabularyItemId: 'word-recommend',
    text: 'Would you recommend this movie?',
    meaning: '이 영화 추천하시나요?',
    contextId: 'ctx-movie',
  },
  {
    id: 'phrase-recommend-shopping',
    vocabularyItemId: 'word-recommend',
    text: 'Can you recommend something for a gift?',
    meaning: '선물할 만한 걸 추천해 주시겠어요?',
    contextId: 'ctx-shopping',
  },
  {
    id: 'phrase-recommend-casual',
    vocabularyItemId: 'word-recommend',
    text: 'What would you recommend?',
    meaning: '뭘 추천하시겠어요?',
    contextId: 'ctx-casual',
  },
  {
    id: 'phrase-reservation-restaurant',
    vocabularyItemId: 'word-reservation',
    text: "I'd like to make a reservation.",
    meaning: '예약을 하고 싶습니다.',
    contextId: 'ctx-restaurant',
  },
  {
    id: 'phrase-available-restaurant',
    vocabularyItemId: 'word-available',
    text: 'Is a table available at 7pm?',
    meaning: '7시에 자리가 있나요?',
    contextId: 'ctx-restaurant',
  },
  {
    id: 'phrase-crowded-restaurant',
    vocabularyItemId: 'word-crowded',
    text: 'This place looks really crowded tonight.',
    meaning: '오늘 밤 여기 정말 붐비네요.',
    contextId: 'ctx-restaurant',
  },
  {
    id: 'phrase-convenient-restaurant',
    vocabularyItemId: 'word-convenient',
    text: 'Is 7pm a convenient time for you?',
    meaning: '7시가 편하신가요?',
    contextId: 'ctx-restaurant',
  },
];

export function phrasesForWord(vocabularyItemId: string): Phrase[] {
  return phrases.filter((p) => p.vocabularyItemId === vocabularyItemId);
}
