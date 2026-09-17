-- English Learning App — Supabase schema
-- Run this once in your Supabase project's SQL editor (Dashboard > SQL Editor).
--
-- Mirrors src/types/domain.ts. Content (vocabulary/phrases/contexts/dialogues)
-- stays in the app bundle (src/content/) per spec 22.2 — only learner state
-- lives here.
--
-- ⚠️ Prototype-only security model: there is no login flow yet, so every
-- learner shares a single 'local-user' id and RLS below allows the anon key
-- full read/write access. Before shipping to real users, add Supabase Auth
-- and change these policies to scope by auth.uid().

create table if not exists learner_vocabulary (
  user_id text not null,
  vocabulary_item_id text not null,
  scores jsonb not null,
  mastery_state text not null,
  review_count integer not null default 0,
  failure_count integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, vocabulary_item_id)
);

create table if not exists vocabulary_context_performance (
  user_id text not null,
  vocabulary_item_id text not null,
  context_id text not null,
  score integer not null default 0,
  successful_uses integer not null default 0,
  failed_uses integer not null default 0,
  last_used_at timestamptz,
  primary key (user_id, vocabulary_item_id, context_id)
);

create table if not exists conversation_sessions (
  id text primary key,
  user_id text not null,
  context_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  transcript jsonb not null,
  overall_score integer
);

create table if not exists review_queue (
  user_id text not null,
  vocabulary_item_id text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, vocabulary_item_id)
);

-- Which curriculum level (spec 17, 1-10) the learner is currently placed at,
-- and whether they've completed the initial placement test.
create table if not exists level_progress (
  user_id text primary key,
  current_level integer not null default 1,
  placement_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table learner_vocabulary enable row level security;
alter table vocabulary_context_performance enable row level security;
alter table conversation_sessions enable row level security;
alter table review_queue enable row level security;
alter table level_progress enable row level security;

create policy "prototype: allow all on learner_vocabulary" on learner_vocabulary
  for all using (true) with check (true);
create policy "prototype: allow all on vocabulary_context_performance" on vocabulary_context_performance
  for all using (true) with check (true);
create policy "prototype: allow all on conversation_sessions" on conversation_sessions
  for all using (true) with check (true);
create policy "prototype: allow all on review_queue" on review_queue
  for all using (true) with check (true);
create policy "prototype: allow all on level_progress" on level_progress
  for all using (true) with check (true);
