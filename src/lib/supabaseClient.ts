import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// EXPO_PUBLIC_* vars are inlined at build time (Expo's built-in .env support)
// and work on web + native alike. Leave them unset to keep using local
// storage — see LocalLearnerRepository in storage.ts.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // No login flow yet (spec's MVP doesn't require multi-user auth) —
        // every learner shares the 'local-user' id used across the app.
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
