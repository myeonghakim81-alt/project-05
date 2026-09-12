import type { ContextItem } from '@/types/domain';

// Content data only — no learner state here (spec 22.2). Add new contexts
// freely; nothing in the engine needs to change.
export const contexts: ContextItem[] = [
  { id: 'ctx-restaurant', category: 'restaurant', level: 2, description: 'Ordering food, booking a table' },
  { id: 'ctx-travel', category: 'travel', level: 2, description: 'Asking for recommendations while traveling' },
  { id: 'ctx-movie', category: 'movie', level: 3, description: 'Talking about films' },
  { id: 'ctx-shopping', category: 'shopping', level: 2, description: 'Buying gifts, asking for suggestions' },
  { id: 'ctx-casual', category: 'casual', level: 3, description: 'General casual conversation' },
  { id: 'ctx-hotel', category: 'hotel', level: 2, description: 'Checking in and out of a hotel' },
  { id: 'ctx-cafe', category: 'cafe', level: 2, description: 'Ordering at a cafe' },
  { id: 'ctx-directions', category: 'directions', level: 2, description: 'Asking for and giving directions' },
  { id: 'ctx-transportation', category: 'transportation', level: 2, description: 'Buses, trains, tickets' },
];

export function contextById(id: string): ContextItem | undefined {
  return contexts.find((c) => c.id === id);
}
