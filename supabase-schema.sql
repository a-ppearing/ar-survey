-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null,
  details jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

-- Row Level Security: allow anyone with the anon key to insert and read.
-- This matches the original artifact's trust model (no auth) — see README
-- for how to lock this down further if you want real access control.
alter table survey_responses enable row level security;

create policy "Allow anonymous insert"
  on survey_responses for insert
  to anon
  with check (true);

create policy "Allow anonymous select"
  on survey_responses for select
  to anon
  using (true);

-- Enables the realtime subscription used by the results view
alter publication supabase_realtime add table survey_responses;
