import { create } from 'zustand';

import { deriveMasteryState, nudge } from '@/lib/masteryEngine';
import { WeaknessThreshold } from '@/lib/policy';
import { scheduleReview } from '@/lib/srs';
import { CURRENT_USER_ID, learnerRepository } from '@/lib/storage';
import { emptySkillScores, type ConversationSession, type LearnerVocabulary, type SkillScores } from '@/types/domain';

interface LearnerStoreState {
  loaded: boolean;
  entries: Record<string, LearnerVocabulary>;
  reviewQueue: string[];
  load: () => Promise<void>;
  getOrCreate: (vocabularyItemId: string) => LearnerVocabulary;
  applyScoreDelta: (vocabularyItemId: string, delta: Partial<SkillScores>) => Promise<LearnerVocabulary>;
  bumpTowards: (vocabularyItemId: string, targets: Partial<SkillScores>, weight?: number) => Promise<LearnerVocabulary>;
  recordConversationSession: (session: ConversationSession) => Promise<void>;
  // One call per full review/learning encounter with a word (not per
  // micro skill-score update) — advances or steps back its spaced-repetition
  // schedule. See src/lib/srs.ts.
  recordReviewOutcome: (vocabularyItemId: string, success: boolean) => Promise<LearnerVocabulary>;
}

function blankEntry(vocabularyItemId: string): LearnerVocabulary {
  return {
    userId: CURRENT_USER_ID,
    vocabularyItemId,
    scores: emptySkillScores(),
    masteryState: 'EXPOSURE',
    reviewCount: 0,
    failureCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    srsStage: 0,
  };
}

export const useLearnerStore = create<LearnerStoreState>((set, get) => ({
  loaded: false,
  entries: {},
  reviewQueue: [],

  load: async () => {
    try {
      const [list, queue] = await Promise.all([
        learnerRepository.listLearnerVocabulary(),
        learnerRepository.listReviewQueue(),
      ]);
      const entries: Record<string, LearnerVocabulary> = {};
      for (const e of list) entries[e.vocabularyItemId] = e;
      set({ entries, reviewQueue: queue, loaded: true });
    } catch (error) {
      // A misconfigured or unreachable backend must not hang the app on the
      // loading screen forever — start from empty state instead.
      console.error('Failed to load learner data, starting from empty state:', error);
      set({ entries: {}, reviewQueue: [], loaded: true });
    }
  },

  getOrCreate: (vocabularyItemId) => {
    return get().entries[vocabularyItemId] ?? blankEntry(vocabularyItemId);
  },

  applyScoreDelta: async (vocabularyItemId, delta) => {
    const current = get().getOrCreate(vocabularyItemId);
    const nextScores: SkillScores = { ...current.scores, ...delta };
    const updated: LearnerVocabulary = {
      ...current,
      scores: nextScores,
      masteryState: deriveMasteryState(nextScores),
      reviewCount: current.reviewCount + 1,
      lastReviewedAt: new Date().toISOString(),
    };
    await learnerRepository.saveLearnerVocabulary(updated);

    const isWeak = Object.values(nextScores).some((s) => s < WeaknessThreshold);
    if (isWeak) {
      await learnerRepository.addToReviewQueue(vocabularyItemId);
    } else {
      await learnerRepository.removeFromReviewQueue(vocabularyItemId);
    }
    const reviewQueue = await learnerRepository.listReviewQueue();

    set((state) => ({
      entries: { ...state.entries, [vocabularyItemId]: updated },
      reviewQueue,
    }));
    return updated;
  },

  bumpTowards: async (vocabularyItemId, targets, weight = 0.5) => {
    const current = get().getOrCreate(vocabularyItemId);
    const delta: Partial<SkillScores> = {};
    for (const key of Object.keys(targets) as (keyof SkillScores)[]) {
      const target = targets[key];
      if (target === undefined) continue;
      delta[key] = nudge(current.scores[key], target, weight);
    }
    return get().applyScoreDelta(vocabularyItemId, delta);
  },

  recordConversationSession: async (session) => {
    await learnerRepository.saveConversationSession(session);
  },

  recordReviewOutcome: async (vocabularyItemId, success) => {
    const current = get().getOrCreate(vocabularyItemId);
    const scheduled = scheduleReview(current, success);
    const updated: LearnerVocabulary = { ...current, ...scheduled };
    await learnerRepository.saveLearnerVocabulary(updated);
    set((state) => ({ entries: { ...state.entries, [vocabularyItemId]: updated } }));
    return updated;
  },
}));
