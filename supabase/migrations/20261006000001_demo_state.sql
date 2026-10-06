-- DEMO ONLY (ADR-29): shared snapshot of the in-memory demo store so every serverless instance on
-- Vercel sees the same bookings, journeys and portal changes. Dropped when Phase 01+ moves each
-- surface onto the real tables. Service role only: RLS on, no policies.
create table if not exists public.demo_state (
  id text primary key,
  version bigint not null default 0,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.demo_state enable row level security;

comment on table public.demo_state is 'DEMO ONLY — snapshot of the in-memory demo store (ADR-29). No policies: service role only.';
