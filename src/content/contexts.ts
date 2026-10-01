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
  { id: 'ctx-airport', category: 'airport', level: 2, description: 'Checking in, security, and boarding at the airport' },

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

  // Level 6 — Real-World Situations (spec 17)
  { id: 'ctx-complaints', category: 'complaints', level: 6, description: 'Complaining about a product, service, or situation' },
  { id: 'ctx-cancellations', category: 'cancellations', level: 6, description: 'Cancelling a reservation, order, or plan' },
  { id: 'ctx-refunds', category: 'refunds', level: 6, description: 'Asking for or processing a refund or exchange' },
  { id: 'ctx-lost-items', category: 'lost items', level: 6, description: 'Reporting or recovering something you lost' },
  { id: 'ctx-delays', category: 'delays', level: 6, description: 'Dealing with delayed flights, trains, or deliveries' },
  { id: 'ctx-customer-service', category: 'customer service', level: 6, description: 'Getting help from a store or company representative' },
  { id: 'ctx-hospital', category: 'hospital', level: 6, description: 'Describing symptoms and getting medical care' },
  { id: 'ctx-bank', category: 'bank', level: 6, description: 'Opening accounts, transfers, and other banking tasks' },
  { id: 'ctx-public-services', category: 'public services', level: 6, description: 'Dealing with government offices and public services' },

  // Level 7 — Professional English (spec 17)
  { id: 'ctx-meetings', category: 'meetings', level: 7, description: 'Participating in and running work meetings' },
  { id: 'ctx-presentations', category: 'presentations', level: 7, description: 'Giving a presentation at work' },
  { id: 'ctx-phone-calls', category: 'phone calls', level: 7, description: 'Making and taking professional phone calls' },
  { id: 'ctx-email', category: 'email', level: 7, description: 'Writing and replying to work emails' },
  { id: 'ctx-reporting', category: 'reporting', level: 7, description: 'Reporting progress and results to a team or manager' },
  { id: 'ctx-scheduling', category: 'scheduling', level: 7, description: 'Arranging and adjusting work schedules and deadlines' },
  { id: 'ctx-negotiation', category: 'negotiation', level: 7, description: 'Negotiating terms, prices, or agreements' },
  { id: 'ctx-customer-communication', category: 'customer communication', level: 7, description: 'Communicating with clients and customers professionally' },

  // Level 8 — Advanced Discussion (spec 17)
  { id: 'ctx-technology', category: 'technology', level: 8, description: 'Discussing technology and its effects on daily life' },
  { id: 'ctx-education', category: 'education', level: 8, description: 'Discussing schools, learning, and education systems' },
  { id: 'ctx-economy', category: 'economy', level: 8, description: 'Discussing the economy, jobs, and money at a societal level' },
  { id: 'ctx-environment', category: 'environment', level: 8, description: 'Discussing the environment and climate issues' },
  { id: 'ctx-society', category: 'society', level: 8, description: 'Discussing social issues and how society works' },
  { id: 'ctx-ai', category: 'artificial intelligence', level: 8, description: 'Discussing artificial intelligence and automation' },
  { id: 'ctx-culture-debate', category: 'culture', level: 8, description: 'Discussing cultural trends and differences in depth' },
  { id: 'ctx-future', category: 'future', level: 8, description: 'Discussing predictions and plans for the future' },

  // Level 9 — Natural English (spec 17)
  { id: 'ctx-phrasal-verbs', category: 'phrasal verbs', level: 9, description: 'Using natural phrasal verbs in everyday speech' },
  { id: 'ctx-collocations', category: 'collocations', level: 9, description: 'Using words that naturally pair together' },
  { id: 'ctx-idioms', category: 'idioms', level: 9, description: 'Using common English idioms naturally' },
  { id: 'ctx-nuance', category: 'nuance', level: 9, description: 'Expressing subtle shades of meaning' },
  { id: 'ctx-politeness', category: 'politeness', level: 9, description: 'Softening or adjusting tone for politeness' },
  { id: 'ctx-indirect-language', category: 'indirect language', level: 9, description: 'Saying things indirectly rather than bluntly' },
  { id: 'ctx-humor', category: 'humor', level: 9, description: 'Using humor naturally in conversation' },
  { id: 'ctx-cultural-context', category: 'cultural context', level: 9, description: 'Understanding language that depends on cultural context' },

  // Level 10 — Real-World Fluency (spec 17) — abstract, nuanced adult
  // conversation rather than literal "accents/fast speech" vocabulary
  { id: 'ctx-abstract-discussion', category: 'abstract discussion', level: 10, description: 'Discussing abstract ideas and concepts' },
  { id: 'ctx-nuanced-opinion', category: 'nuanced opinion', level: 10, description: 'Giving a nuanced, hedged, or qualified opinion' },
  { id: 'ctx-spontaneous-conversation', category: 'spontaneous conversation', level: 10, description: 'Reacting naturally in unplanned conversation' },
  { id: 'ctx-debate', category: 'debate', level: 10, description: 'Debating or discussing a topic from multiple angles' },
];

export function contextById(id: string): ContextItem | undefined {
  return contexts.find((c) => c.id === id);
}
