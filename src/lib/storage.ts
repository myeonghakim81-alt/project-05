import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { ConversationSession, LearnerVocabulary, LevelProgress, VocabularyContextPerformance } from '@/types/domain';

// No login flow yet (spec's MVP doesn't require multi-user auth) — every
// learner on this device/browser shares this id.
export const CURRENT_USER_ID = 'local-user';

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
  getLevelProgress(): Promise<LevelProgress | null>;
  saveLevelProgress(progress: LevelProgress): Promise<void>;
}

const KEYS = {
  learnerVocabulary: 'learnerVocabulary/v1',
  contextPerformance: 'contextPerformance/v1',
  conversationSessions: 'conversationSessions/v1',
  reviewQueue: 'reviewQueue/v1',
  levelProgress: 'levelProgress/v1',
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

  async getLevelProgress(): Promise<LevelProgress | null> {
    return readJson<LevelProgress | null>(KEYS.levelProgress, null);
  }

  async saveLevelProgress(progress: LevelProgress): Promise<void> {
    await writeJson(KEYS.levelProgress, progress);
  }
}

// --- Supabase-backed implementation --------------------------------------
// Same interface, real backend. Only used when EXPO_PUBLIC_SUPABASE_URL /
// EXPO_PUBLIC_SUPABASE_ANON_KEY are set (see supabaseClient.ts); otherwise
// the app keeps working entirely offline against LocalLearnerRepository.

interface LearnerVocabularyRow {
  user_id: string;
  vocabulary_item_id: string;
  scores: LearnerVocabulary['scores'];
  mastery_state: LearnerVocabulary['masteryState'];
  review_count: number;
  failure_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
}

function rowToLearnerVocabulary(row: LearnerVocabularyRow): LearnerVocabulary {
  return {
    userId: row.user_id,
    vocabularyItemId: row.vocabulary_item_id,
    scores: row.scores,
    masteryState: row.mastery_state,
    reviewCount: row.review_count,
    failureCount: row.failure_count,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
  };
}

function learnerVocabularyToRow(entry: LearnerVocabulary): LearnerVocabularyRow {
  return {
    user_id: entry.userId,
    vocabulary_item_id: entry.vocabularyItemId,
    scores: entry.scores,
    mastery_state: entry.masteryState,
    review_count: entry.reviewCount,
    failure_count: entry.failureCount,
    last_reviewed_at: entry.lastReviewedAt,
    next_review_at: entry.nextReviewAt,
  };
}

interface ContextPerformanceRow {
  user_id: string;
  vocabulary_item_id: string;
  context_id: string;
  score: number;
  successful_uses: number;
  failed_uses: number;
  last_used_at: string | null;
}

function rowToContextPerformance(row: ContextPerformanceRow): VocabularyContextPerformance {
  return {
    userId: row.user_id,
    vocabularyItemId: row.vocabulary_item_id,
    contextId: row.context_id,
    score: row.score,
    successfulUses: row.successful_uses,
    failedUses: row.failed_uses,
    lastUsedAt: row.last_used_at,
  };
}

function contextPerformanceToRow(entry: VocabularyContextPerformance): ContextPerformanceRow {
  return {
    user_id: entry.userId,
    vocabulary_item_id: entry.vocabularyItemId,
    context_id: entry.contextId,
    score: entry.score,
    successful_uses: entry.successfulUses,
    failed_uses: entry.failedUses,
    last_used_at: entry.lastUsedAt,
  };
}

export class SupabaseLearnerRepository implements LearnerRepository {
  async listLearnerVocabulary(): Promise<LearnerVocabulary[]> {
    const { data, error } = await supabase!.from('learner_vocabulary').select('*').eq('user_id', CURRENT_USER_ID);
    if (error) throw error;
    return (data as LearnerVocabularyRow[]).map(rowToLearnerVocabulary);
  }

  async getLearnerVocabulary(vocabularyItemId: string): Promise<LearnerVocabulary | null> {
    const { data, error } = await supabase!
      .from('learner_vocabulary')
      .select('*')
      .eq('user_id', CURRENT_USER_ID)
      .eq('vocabulary_item_id', vocabularyItemId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToLearnerVocabulary(data as LearnerVocabularyRow) : null;
  }

  async saveLearnerVocabulary(entry: LearnerVocabulary): Promise<void> {
    const { error } = await supabase!.from('learner_vocabulary').upsert(learnerVocabularyToRow(entry));
    if (error) throw error;
  }

  async listContextPerformance(vocabularyItemId: string): Promise<VocabularyContextPerformance[]> {
    const { data, error } = await supabase!
      .from('vocabulary_context_performance')
      .select('*')
      .eq('user_id', CURRENT_USER_ID)
      .eq('vocabulary_item_id', vocabularyItemId);
    if (error) throw error;
    return (data as ContextPerformanceRow[]).map(rowToContextPerformance);
  }

  async saveContextPerformance(entry: VocabularyContextPerformance): Promise<void> {
    const { error } = await supabase!.from('vocabulary_context_performance').upsert(contextPerformanceToRow(entry));
    if (error) throw error;
  }

  async saveConversationSession(session: ConversationSession): Promise<void> {
    const { error } = await supabase!.from('conversation_sessions').insert({
      id: session.id,
      user_id: session.userId,
      context_id: session.contextId,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      transcript: session.transcript,
      overall_score: session.overallScore,
    });
    if (error) throw error;
  }

  async listReviewQueue(): Promise<string[]> {
    const { data, error } = await supabase!.from('review_queue').select('vocabulary_item_id').eq('user_id', CURRENT_USER_ID);
    if (error) throw error;
    return (data as { vocabulary_item_id: string }[]).map((r) => r.vocabulary_item_id);
  }

  async addToReviewQueue(vocabularyItemId: string): Promise<void> {
    const { error } = await supabase!
      .from('review_queue')
      .upsert({ user_id: CURRENT_USER_ID, vocabulary_item_id: vocabularyItemId });
    if (error) throw error;
  }

  async removeFromReviewQueue(vocabularyItemId: string): Promise<void> {
    const { error } = await supabase!
      .from('review_queue')
      .delete()
      .eq('user_id', CURRENT_USER_ID)
      .eq('vocabulary_item_id', vocabularyItemId);
    if (error) throw error;
  }

  async getLevelProgress(): Promise<LevelProgress | null> {
    const { data, error } = await supabase!.from('level_progress').select('*').eq('user_id', CURRENT_USER_ID).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { userId: data.user_id, currentLevel: data.current_level, placementCompleted: data.placement_completed };
  }

  async saveLevelProgress(progress: LevelProgress): Promise<void> {
    const { error } = await supabase!.from('level_progress').upsert({
      user_id: progress.userId,
      current_level: progress.currentLevel,
      placement_completed: progress.placementCompleted,
    });
    if (error) throw error;
  }
}

export const learnerRepository: LearnerRepository = isSupabaseConfigured
  ? new SupabaseLearnerRepository()
  : new LocalLearnerRepository();
