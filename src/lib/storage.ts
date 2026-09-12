import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ConversationSession, LearnerVocabulary, VocabularyContextPerformance } from '@/types/domain';

// Repository interface — everything above this line is the only thing the
// rest of the app talks to. Swapping AsyncStorage for Supabase later means
// writing one new class here, nothing else changes (spec 22.2).
export interface LearnerRepository {
  listLearnerVocabulary(): Promise<LearnerVocabulary[]>;
  getLearnerVocabulary(vocabularyItemId: string): Promise<LearnerVocabulary | null>;
  saveLearnerVocabulary(entry: LearnerVocabulary): Promise<void>;
  listContextPerformance(vocabularyItemId: string): Promise<VocabularyContextPerformance[]>;
  saveContextPerformance(entry: VocabularyContextPerformance): Promise<void>;
  saveConversationSession(session: ConversationSession): Promise<void>;
  listReviewQueue(): Promise<string[]>; // vocabularyItemIds due for review
  addToReviewQueue(vocabularyItemId: string): Promise<void>;
  removeFromReviewQueue(vocabularyItemId: string): Promise<void>;
}

const KEYS = {
  learnerVocabulary: 'learnerVocabulary/v1',
  contextPerformance: 'contextPerformance/v1',
  conversationSessions: 'conversationSessions/v1',
  reviewQueue: 'reviewQueue/v1',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Local-first implementation for the web prototype. Learner history is kept
// so past performance can be recomputed later (spec 22.9), not overwritten.
export class LocalLearnerRepository implements LearnerRepository {
  async listLearnerVocabulary(): Promise<LearnerVocabulary[]> {
    return readJson(KEYS.learnerVocabulary, [] as LearnerVocabulary[]);
  }

  async getLearnerVocabulary(vocabularyItemId: string): Promise<LearnerVocabulary | null> {
    const all = await this.listLearnerVocabulary();
    return all.find((e) => e.vocabularyItemId === vocabularyItemId) ?? null;
  }

  async saveLearnerVocabulary(entry: LearnerVocabulary): Promise<void> {
    const all = await this.listLearnerVocabulary();
    const idx = all.findIndex((e) => e.vocabularyItemId === entry.vocabularyItemId);
    if (idx >= 0) all[idx] = entry;
    else all.push(entry);
    await writeJson(KEYS.learnerVocabulary, all);
  }

  async listContextPerformance(vocabularyItemId: string): Promise<VocabularyContextPerformance[]> {
    const all = await readJson(KEYS.contextPerformance, [] as VocabularyContextPerformance[]);
    return all.filter((e) => e.vocabularyItemId === vocabularyItemId);
  }

  async saveContextPerformance(entry: VocabularyContextPerformance): Promise<void> {
    const all = await readJson(KEYS.contextPerformance, [] as VocabularyContextPerformance[]);
    const idx = all.findIndex((e) => e.vocabularyItemId === entry.vocabularyItemId && e.contextId === entry.contextId);
    if (idx >= 0) all[idx] = entry;
    else all.push(entry);
    await writeJson(KEYS.contextPerformance, all);
  }

  async saveConversationSession(session: ConversationSession): Promise<void> {
    const all = await readJson(KEYS.conversationSessions, [] as ConversationSession[]);
    all.push(session);
    await writeJson(KEYS.conversationSessions, all);
  }

  async listReviewQueue(): Promise<string[]> {
    return readJson(KEYS.reviewQueue, [] as string[]);
  }

  async addToReviewQueue(vocabularyItemId: string): Promise<void> {
    const queue = await this.listReviewQueue();
    if (!queue.includes(vocabularyItemId)) {
      queue.push(vocabularyItemId);
      await writeJson(KEYS.reviewQueue, queue);
    }
  }

  async removeFromReviewQueue(vocabularyItemId: string): Promise<void> {
    const queue = await this.listReviewQueue();
    await writeJson(
      KEYS.reviewQueue,
      queue.filter((id) => id !== vocabularyItemId),
    );
  }
}

export const learnerRepository: LearnerRepository = new LocalLearnerRepository();
