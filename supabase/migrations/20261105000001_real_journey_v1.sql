-- =============================================================================
-- Real journey v1 (ADR-36, 2026-11-05): free scalp scan → result (eligible / not eligible) → the
-- sales team calls back. No doctor consultation, fee or payment for now (hidden, not removed).
--
-- * scans + scan_photos: the customer's scan. Photos live in the private 'clinical' bucket and are
--   only ever read through short-lived signed URLs made by the server. Clinical data: the customer
--   (and admins) only — sales never reads these tables.
-- * leads.outcome / leads.latest_scan_id: the one scan fact sales may see (client decision 2026-11-05:
--   sales calls eligible and not-eligible leads differently). No answers, scores or photos.
-- * leads.owner_name: the sales team shares one login (care@…); each person marks the leads they take.
-- * Sales may close a lead as 'product_purchased' (orders are taken on the phone for now).
-- =============================================================================

create type public.scan_outcome as enum ('eligible', 'not_eligible', 'unclear');

create table public.scans (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customers (id) on delete cascade,
  status            text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  answers           jsonb not null default '{}',   -- age band, gender, pattern, duration (health data)
  zones             jsonb not null default '{}',   -- per-zone analysis summary (quality, hair cover band)
  outcome           public.scan_outcome,
  outcome_reasons   text[] not null default '{}',
  analysis_version  text,
  created_at        timestamptz not null default now(),
  submitted_at      timestamptz,
  updated_at        timestamptz not null default now(),
  check (status <> 'submitted' or (outcome is not null and submitted_at is not null))
);
create index scans_customer_idx on public.scans (customer_id, created_at desc);
create trigger scans_updated_at before update on public.scans
  for each row execute function public.set_updated_at();

create table public.scan_photos (
  id            uuid primary key default gen_random_uuid(),
  scan_id       uuid not null references public.scans (id) on delete cascade,
  customer_id   uuid not null references public.customers (id) on delete cascade,
  zone          text not null check (zone in (
                  'forehead_left', 'forehead_centre', 'forehead_right', 'top', 'crown', 'parting', 'back')),
  storage_path  text not null unique,
  content_type  text not null default 'image/jpeg',
  quality       jsonb not null default '{}',     -- blur / light / glare checks
  metrics       jsonb not null default '{}',     -- hair cover, scalp shine, method agreement
  created_at    timestamptz not null default now(),
  unique (scan_id, zone)
);
create index scan_photos_scan_idx on public.scan_photos (scan_id);

alter table public.leads
  add column outcome           public.scan_outcome,
  add column latest_scan_id    uuid references public.scans (id) on delete set null,
  add column owner_name        text check (owner_name is null or length(owner_name) between 1 and 60),
  add column owner_claimed_at  timestamptz;
create index leads_created_idx on public.leads (created_at desc);
create index leads_owner_idx on public.leads (owner_name, stage);

-- Sales may close a sale taken on the phone; other manual rules unchanged.
create or replace function public.lead_manual_stage_allowed(p_from public.lead_stage, p_to public.lead_stage)
returns boolean language sql immutable as $$
  select case
    when p_to = 'lost' then p_from not in ('product_purchased', 'product_delivered', 'followup_active', 'reorder_due', 'reordered')
    when p_to in ('contacted', 'interested', 'consult_suggested')
      then p_from in ('new', 'contacted', 'interested', 'consult_suggested', 'consult_link_sent', 'lost')
    when p_to = 'product_purchased'
      then p_from in ('new', 'contacted', 'interested', 'consult_suggested', 'lost')
    else false
  end
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.scans enable row level security;
alter table public.scan_photos enable row level security;

create policy scans_admin_all on public.scans for all to authenticated
  using (public.has_role(array['admin']::public.app_role[])) with check (public.has_role(array['admin']::public.app_role[]));
create policy scan_photos_admin_all on public.scan_photos for all to authenticated
  using (public.has_role(array['admin']::public.app_role[])) with check (public.has_role(array['admin']::public.app_role[]));

-- Customers read their own scans; all writes go through server code (service role) after a session check.
create policy scans_customer_select on public.scans for select to authenticated
  using (customer_id = public.current_customer_id());
create policy scan_photos_customer_select on public.scan_photos for select to authenticated
  using (customer_id = public.current_customer_id());
-- No sales / doctor policies: sales see leads.outcome only; the doctor flow is off (ADR-36).

-- -----------------------------------------------------------------------------
-- Settings (tunable without a deploy)
-- -----------------------------------------------------------------------------
insert into public.settings (key, value, description, is_public) values
  ('features.doctor_consult', 'false', 'Doctor consultation, booking and the ₹ fee (off until Dr. Tyagi is available — ADR-36)', true),
  ('features.shop',           'false', 'Cart and checkout on the website (off: orders are taken by the sales team on the phone)', true),
  ('scan.rules',
   '{"older_age": 55, "bald_cover_max": 0.12, "shine_min": 0.18, "min_zones": 4, "pattern_zones": ["forehead_left", "forehead_centre", "forehead_right", "top", "crown"]}',
   'Eligibility: NOT eligible when the pattern zones show almost no hair (cover ≤ bald_cover_max) with a shiny scalp and age ≥ older_age; otherwise eligible. TODO(client): confirm the age with the team.',
   false),
  ('sales.team', '[]', 'Names of the sales team sharing the care@ login (set in the sales portal)', false)
on conflict (key) do nothing;
