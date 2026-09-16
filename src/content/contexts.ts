import type { ContextItem } from '@/types/domain';

// Content data only — no learner state here (spec 22.2). Add new contexts
// freely; nothing in the engine needs to change.
export const contexts: ContextItem[] = [
  // Level 1 — English Foundations (spec 17)
  { id: 'ctx-greetings', category: 'greetings', level: 1, description: 'Saying hello and goodbye' },
  { id: 'ctx-introductions', category: 'introductions', level: 1, description: 'Introducing yourself to someone new' },
  { id: 'ctx-courtesy', category: 'courtesy', level: 1, description: 'Everyday polite expressions' },
  { id: 'ctx-time', category: 'time', level: 1, description: 'Talking about days and time' },
  { id: 'ctx-numbers', category: 'numbers', level: 1, description: 'Asking for and giving numbers' },

  // Level 2 — Survival English (spec 17)
  { id: 'ctx-restaurant', category: 'restaurant', level: 2, description: 'Ordering food, booking a table' },
  { id: 'ctx-travel', category: 'travel', level: 2, description: 'Asking for recommendations while traveling' },
  { id: 'ctx-movie', category: 'movie', level: 3, description: 'Talking about films' },
  { id: 'ctx-shopping', category: 'shopping', level: 2, description: 'Buying gifts, asking for suggestions' },
  { id: 'ctx-casual', category: 'casual', level: 3, description: 'General casual conversation' },
  { id: 'ctx-hotel', category: 'hotel', level: 2, description: 'Checking in and out of a hotel' },
  { id: 'ctx-cafe', category: 'cafe', level: 2, description: 'Ordering at a cafe' },
  { id: 'ctx-directions', category: 'directions', level: 2, description: 'Asking for and giving directions' },
  { id: 'ctx-transportation', category: 'transportation', level: 2, description: 'Buses, trains, tickets' },

  // Level 3 — Basic Conversation (spec 17)
  { id: 'ctx-family', category: 'family', level: 3, description: 'Talking about family members' },
  { id: 'ctx-job', category: 'job', level: 3, description: 'Talking about work and occupation' },
  { id: 'ctx-hobbies', category: 'hobbies', level: 3, description: 'Talking about hobbies and interests' },
  { id: 'ctx-preferences', category: 'preferences', level: 3, description: 'Expressing likes and preferences' },
  { id: 'ctx-daily-routine', category: 'daily routine', level: 3, description: 'Describing everyday habits' },
  { id: 'ctx-weather', category: 'weather', level: 3, description: 'Talking about the weather' },
  { id: 'ctx-appointments', category: 'appointments', level: 3, description: 'Scheduling and keeping appointments' },

  // Level 4 — Everyday Life (spec 17)
  { id: 'ctx-friends', category: 'friends', level: 4, description: 'Talking about and with friends' },
  { id: 'ctx-invitations', category: 'invitations', level: 4, description: 'Inviting someone and responding to invitations' },
  { id: 'ctx-requests', category: 'requests', level: 4, description: 'Asking someone for help or a favor' },
  { id: 'ctx-apologies', category: 'apologies', level: 4, description: 'Apologizing and responding to an apology' },
  { id: 'ctx-feelings', category: 'feelings', level: 4, description: 'Describing emotions and feelings' },
  { id: 'ctx-weekends', category: 'weekends', level: 4, description: 'Talking about weekend plans and activities' },
  { id: 'ctx-experiences', category: 'personal experiences', level: 4, description: 'Sharing personal experiences and stories' },

  // Level 5 — Social Conversation (spec 17)
  { id: 'ctx-small-talk', category: 'small talk', level: 5, description: 'Light, everyday conversation with acquaintances' },
  { id: 'ctx-interests', category: 'interests', level: 5, description: 'Talking about what interests you' },
  { id: 'ctx-culture', category: 'culture', level: 5, description: 'Talking about culture and customs' },
  { id: 'ctx-movies-music', category: 'movies & music', level: 5, description: 'Talking about films and music' },
  { id: 'ctx-food', category: 'food', level: 5, description: 'Talking about food and eating habits' },
  { id: 'ctx-travel-experiences', category: 'travel experiences', level: 5, description: 'Sharing stories from past trips' },
  { id: 'ctx-conversation', category: 'maintaining conversation', level: 5, description: 'Keeping a conversation going naturally' },
];

export function contextById(id: string): ContextItem | undefined {
  return contexts.find((c) => c.id === id);
}
