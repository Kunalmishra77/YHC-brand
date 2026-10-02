-- =============================================================================
-- Your Hair Company (YHC) — initial schema
-- Target: Supabase Postgres 15+ (tested on Postgres 16 with a stub auth schema)
-- Conventions:
--   * money is integer paise (₹1 = 100 paise), columns end in _paise
--   * timestamps are timestamptz (UTC); display in Asia/Kolkata in the app
--   * every table has RLS enabled; the service role bypasses RLS (server only)
--   * concurrency-critical logic lives in SQL functions (slot holds, job claims,
--     lead stage moves); all other business logic lives in TypeScript
-- See docs/04_Database_Schema.md for the entity guide.
-- =============================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('customer', 'doctor', 'sales', 'ops', 'admin');

create type public.lead_stage as enum (
  'new', 'contacted', 'interested', 'consult_suggested', 'consult_link_sent',
  'consult_booked', 'payment_successful', 'consult_completed',
  'product_recommended', 'product_purchased', 'product_delivered',
  'followup_active', 'reorder_due', 'reordered', 'lost'
);

create type public.appointment_status as enum (
  'held', 'booked', 'completed', 'no_show', 'cancelled', 'rescheduled', 'expired'
);
create type public.appointment_kind as enum ('first', 'follow_up');
create type public.consultation_status as enum ('draft', 'completed');
create type public.recommendation_status as enum ('draft', 'sent', 'paid', 'expired', 'declined', 'cancelled');
create type public.order_status as enum (
  'pending_payment', 'paid', 'processing', 'shipped', 'delivered',
  'cancelled', 'refunded', 'partially_refunded', 'rto'
);
create type public.order_source as enum ('shop', 'recommendation', 'reorder', 'subscription', 'manual');
create type public.payment_purpose as enum ('consultation', 'order');
create type public.payment_status as enum ('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');
create type public.refund_status as enum ('pending', 'processed', 'failed');
create type public.shipment_status as enum (
  'created', 'pickup_scheduled', 'in_transit', 'out_for_delivery', 'delivered',
  'ndr', 'rto_initiated', 'rto_delivered', 'cancelled', 'failed'
);
create type public.message_channel as enum ('whatsapp', 'sms', 'email');
create type public.message_direction as enum ('outbound', 'inbound');
create type public.message_category as enum ('marketing', 'utility', 'authentication', 'service');
create type public.message_status as enum ('queued', 'sent', 'delivered', 'read', 'failed', 'received');
create type public.job_status as enum ('pending', 'running', 'done', 'failed', 'cancelled');
create type public.task_status as enum ('open', 'done', 'cancelled');
create type public.regulatory_category as enum ('cosmetic', 'ayurvedic', 'drug', 'supplement', 'other');
create type public.media_kind as enum ('intake', 'progress', 'prescription', 'signature', 'other');
create type public.guarantee_claim_status as enum (
  'submitted', 'under_review', 'approved', 'rejected', 'refunded', 'withdrawn'
);
create type public.consent_kind as enum (
  'privacy_policy', 'terms', 'telemedicine', 'whatsapp_utility', 'whatsapp_marketing',
  'photo_clinical_use', 'photo_marketing_use', 'guarantee_terms', 'review_publication', 'refund_policy'
);

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Identity: profiles (1:1 with auth.users), customers, addresses, staff
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.app_role not null default 'customer',
  full_name   text,
  phone       text,
  email       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

-- Authentication assurance level of the current JWT ('aal1' password/OTP, 'aal2' with MFA)
create or replace function public.jwt_aal()
returns text language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1')
$$;

-- Doctor and admin roles only count when the session passed MFA (aal2); enforced in RLS, not just middleware
create or replace function public.has_role(roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select r = any (roles) and (r not in ('doctor', 'admin') or public.jwt_aal() = 'aal2')
       from (select public.current_app_role() as r) x),
    false)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['doctor', 'sales', 'ops', 'admin']::public.app_role[])
$$;

-- New auth user -> profile row (role always 'customer'; staff roles are granted by an admin)
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (new.id, new.phone, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Block role escalation: only admins (or the service role, where auth.uid() is null) may change role
-- Only admins (or the service role, where auth.uid() is null) may change role, active flag, email or phone
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.has_role(array['admin']::public.app_role[]) then
    if new.role is distinct from old.role then
      raise exception 'ROLE_CHANGE_NOT_ALLOWED';
    end if;
    if new.is_active is distinct from old.is_active
       or new.email is distinct from old.email
       or new.phone is distinct from old.phone then
      raise exception 'PROFILE_FIELD_LOCKED';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

create table public.customers (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid unique references public.profiles (id) on delete set null,
  phone              text not null unique check (phone ~ '^\+[1-9][0-9]{7,14}$'),  -- E.164
  full_name          text,
  email              text,
  age_years          int check (age_years between 1 and 120),
  gender             text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  city               text,
  state              text,
  preferred_language text not null default 'en',
  whatsapp_opt_in    boolean not null default false,
  marketing_opt_in   boolean not null default false,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index customers_email_idx on public.customers (lower(email));
create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

create or replace function public.current_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select c.id
    from public.customers c
    join public.profiles p on p.id = c.profile_id
   where c.profile_id = auth.uid() and c.deleted_at is null and p.role = 'customer' and p.is_active
$$;

-- Identity and consent columns are server-managed: browsers (customers, sales) cannot change them.
-- The service role (auth.uid() is null) and admins can.
create or replace function public.guard_customer_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.has_role(array['admin']::public.app_role[]) then
    if new.profile_id is distinct from old.profile_id
       or new.phone is distinct from old.phone
       or new.deleted_at is distinct from old.deleted_at
       or new.whatsapp_opt_in is distinct from old.whatsapp_opt_in
       or new.marketing_opt_in is distinct from old.marketing_opt_in then
      raise exception 'CUSTOMER_FIELD_LOCKED';
    end if;
  end if;
  return new;
end $$;
create trigger customers_guard_columns before update on public.customers
  for each row execute function public.guard_customer_columns();

create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  label       text,
  name        text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  landmark    text,
  city        text not null,
  state       text not null,
  pincode     text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index addresses_customer_idx on public.addresses (customer_id);
create trigger addresses_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Doctors & availability
-- -----------------------------------------------------------------------------
create table public.doctors (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid not null unique references public.profiles (id),
  slug                   text not null unique,
  display_name           text not null,
  qualifications         text,
  registration_no        text not null,
  registration_council   text not null,
  bio_md                 text,
  photo_path             text,
  signature_path         text,
  timezone               text not null default 'Asia/Kolkata',
  slot_minutes           int not null default 30 check (slot_minutes between 10 and 120),
  buffer_minutes         int not null default 10 check (buffer_minutes between 0 and 60),
  max_per_day            int not null default 12 check (max_per_day between 1 and 50),
  booking_window_days    int not null default 14 check (booking_window_days between 1 and 90),
  min_notice_minutes     int not null default 120 check (min_notice_minutes >= 0),
  consultation_fee_paise int not null default 50000 check (consultation_fee_paise >= 0),
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger doctors_updated_at before update on public.doctors
  for each row execute function public.set_updated_at();

create or replace function public.current_doctor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select d.id
    from public.doctors d
    join public.profiles p on p.id = d.profile_id
   where d.profile_id = auth.uid() and p.is_active and public.jwt_aal() = 'aal2'
$$;

-- Secrets kept out of the public doctors row; service role only (no RLS policies)
create table public.doctor_integrations (
  doctor_id                 uuid primary key references public.doctors (id) on delete cascade,
  google_calendar_id        text,
  google_refresh_token_enc  text,           -- AES-256-GCM, key in ENCRYPTION_KEY env
  google_connected_at       timestamptz,
  updated_at                timestamptz not null default now()
);

create table public.availability_rules (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctors (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time  time not null,
  end_time    time not null,
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);
create index availability_rules_doctor_idx on public.availability_rules (doctor_id, weekday);

create table public.availability_exceptions (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctors (id) on delete cascade,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  kind        text not null check (kind in ('unavailable', 'extra')),
  reason      text,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index availability_exceptions_doctor_idx on public.availability_exceptions (doctor_id, starts_at);

-- Busy time pulled from the doctor's Google Calendar (free/busy sync)
create table public.calendar_busy_blocks (
  id                 uuid primary key default gen_random_uuid(),
  doctor_id          uuid not null references public.doctors (id) on delete cascade,
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  external_event_id  text,
  synced_at          timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index calendar_busy_blocks_doctor_idx on public.calendar_busy_blocks (doctor_id, starts_at);

-- -----------------------------------------------------------------------------
-- Domain events (outbox) — every important state change writes one row
-- -----------------------------------------------------------------------------
create table public.domain_events (
  id            bigserial primary key,
  type          text not null,                 -- e.g. 'appointment.booked'
  entity        text not null,
  entity_id     uuid,
  payload       jsonb not null default '{}',
  actor_id      uuid,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz,
  error         text
);
create index domain_events_unprocessed_idx on public.domain_events (id) where processed_at is null;
create index domain_events_entity_idx on public.domain_events (entity, entity_id);

create or replace function public.emit_event(p_type text, p_entity text, p_entity_id uuid, p_payload jsonb default '{}')
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  insert into public.domain_events (type, entity, entity_id, payload, actor_id)
  values (p_type, p_entity, p_entity_id, coalesce(p_payload, '{}'), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

-- -----------------------------------------------------------------------------
-- Appointments, intake, media
-- -----------------------------------------------------------------------------
create sequence public.appointment_code_seq start 1001;

create table public.appointments (
  id                          uuid primary key default gen_random_uuid(),
  code                        text not null unique default ('YHC-A-' || nextval('public.appointment_code_seq')),
  doctor_id                   uuid not null references public.doctors (id),
  customer_id                 uuid not null references public.customers (id),
  kind                        public.appointment_kind not null default 'first',
  status                      public.appointment_status not null default 'held',
  starts_at                   timestamptz not null,
  ends_at                     timestamptz not null,
  hold_expires_at             timestamptz,
  fee_paise                   int not null default 0 check (fee_paise >= 0),
  source                      text not null default 'website',   -- website | sales | whatsapp | doctor
  booked_by                   uuid references public.profiles (id),
  video_provider              text,                               -- livekit | meet
  video_room                  text,
  join_url                    text,
  external_calendar_event_id  text,
  intake_completed_at         timestamptz,
  completed_at                timestamptz,
  cancelled_at                timestamptz,
  cancel_reason               text,
  rescheduled_from_id         uuid references public.appointments (id),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  check (ends_at > starts_at),
  -- No two live (held or booked) appointments may overlap for one doctor
  constraint appointments_no_overlap exclude using gist (
    doctor_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('held', 'booked'))
);
create index appointments_doctor_time_idx on public.appointments (doctor_id, starts_at);
create index appointments_customer_idx on public.appointments (customer_id, starts_at desc);
create index appointments_hold_idx on public.appointments (hold_expires_at) where status = 'held';
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- Hold a slot for p_hold_minutes. Raises SLOT_TAKEN when another live appointment overlaps.
-- Call from the server only (service role) AFTER the availability engine has validated the slot.
create or replace function public.hold_slot(
  p_doctor_id     uuid,
  p_customer_id   uuid,
  p_starts_at     timestamptz,
  p_kind          public.appointment_kind default 'first',
  p_source        text default 'website',
  p_hold_minutes  int default 10,
  p_fee_paise     int default null
) returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  d      public.doctors;
  a      public.appointments;
  v_ends timestamptz;
begin
  select * into d from public.doctors where id = p_doctor_id and is_active;
  if not found then
    raise exception 'DOCTOR_NOT_FOUND';
  end if;

  v_ends := p_starts_at + make_interval(mins => d.slot_minutes);

  -- Expire stale holds that overlap this slot so they stop blocking it
  update public.appointments
     set status = 'expired'
   where doctor_id = p_doctor_id
     and status = 'held'
     and hold_expires_at < now()
     and tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, v_ends, '[)');

  -- One live hold per customer: release any other hold they still have
  update public.appointments
     set status = 'expired'
   where customer_id = p_customer_id
     and status = 'held';

  begin
    insert into public.appointments (
      doctor_id, customer_id, kind, status, starts_at, ends_at, hold_expires_at, fee_paise, source
    ) values (
      p_doctor_id, p_customer_id, p_kind, 'held', p_starts_at, v_ends,
      now() + make_interval(mins => p_hold_minutes),
      coalesce(p_fee_paise, case when p_kind = 'first' then d.consultation_fee_paise else 0 end),
      p_source
    )
    returning * into a;
  exception when exclusion_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;

  perform public.emit_event('appointment.held', 'appointment', a.id,
    jsonb_build_object('customer_id', a.customer_id, 'starts_at', a.starts_at, 'source', a.source));
  return a;
end $$;

-- Called by the Razorpay webhook handler after a verified payment.captured.
-- Returns: 'booked' | 'already_booked' | 'rebooked_after_expiry' | 'slot_lost' | 'invalid_state:<status>'
create or replace function public.confirm_appointment_payment(p_appointment_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare a public.appointments;
begin
  select * into a from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND';
  end if;

  if a.status = 'booked' then
    return 'already_booked';
  end if;

  if a.status = 'held' then
    update public.appointments set status = 'booked', hold_expires_at = null where id = a.id;
    perform public.emit_event('appointment.booked', 'appointment', a.id, jsonb_build_object('customer_id', a.customer_id));
    return 'booked';
  end if;

  if a.status = 'expired' then
    begin
      update public.appointments set status = 'booked', hold_expires_at = null where id = a.id;
    exception when exclusion_violation then
      perform public.emit_event('appointment.slot_lost', 'appointment', a.id, jsonb_build_object('customer_id', a.customer_id));
      return 'slot_lost';
    end;
    perform public.emit_event('appointment.booked', 'appointment', a.id,
      jsonb_build_object('customer_id', a.customer_id, 'after_expiry', true));
    return 'rebooked_after_expiry';
  end if;

  return 'invalid_state:' || a.status::text;
end $$;

-- Job: expire holds whose timer ran out (also done lazily inside hold_slot)
create or replace function public.expire_stale_holds()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with x as (
    update public.appointments set status = 'expired'
     where status = 'held' and hold_expires_at < now()
    returning id, customer_id
  )
  select count(*) into n from x;
  return n;
end $$;

create table public.intake_forms (
  id                   uuid primary key default gen_random_uuid(),
  appointment_id       uuid not null unique references public.appointments (id) on delete cascade,
  customer_id          uuid not null references public.customers (id),
  primary_concern      text,
  concern_duration     text,
  previous_treatments  text,
  current_products     text,
  medical_history      text,
  current_medications  text,
  allergies            text,
  family_history       text,
  answers              jsonb not null default '{}',   -- full questionnaire, versioned by answers->>'form_version'
  submitted_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger intake_forms_updated_at before update on public.intake_forms
  for each row execute function public.set_updated_at();

-- Files live in Supabase Storage; this table is the index. Clinical files: private bucket 'clinical'.
create table public.media (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers (id) on delete cascade,
  appointment_id   uuid references public.appointments (id) on delete set null,
  kind             public.media_kind not null,
  storage_bucket   text not null default 'clinical',
  storage_path     text not null unique,
  content_type     text,
  taken_on         date,
  uploaded_by      uuid references public.profiles (id),
  created_at       timestamptz not null default now()
);
create index media_customer_idx on public.media (customer_id, kind, created_at desc);

-- -----------------------------------------------------------------------------
-- Consultations & prescriptions
-- -----------------------------------------------------------------------------
create table public.consultations (
  id                      uuid primary key default gen_random_uuid(),
  appointment_id          uuid not null unique references public.appointments (id),
  doctor_id               uuid not null references public.doctors (id),
  customer_id             uuid not null references public.customers (id),
  status                  public.consultation_status not null default 'draft',
  mode                    text not null default 'video' check (mode in ('video', 'audio', 'text')),
  identity_verified       boolean not null default false,
  consent_recorded        boolean not null default false,
  chief_complaint         text,
  observations            text,
  assessment              text,
  treatment_plan          text,       -- shown to the patient
  follow_up_instructions  text,       -- shown to the patient
  private_notes           text,       -- doctor only, never shown to patient or sales
  follow_up_in_weeks      int check (follow_up_in_weeks between 1 and 52),
  started_at              timestamptz,
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index consultations_customer_idx on public.consultations (customer_id, created_at desc);
create trigger consultations_updated_at before update on public.consultations
  for each row execute function public.set_updated_at();

create table public.prescriptions (
  id                      uuid primary key default gen_random_uuid(),
  consultation_id         uuid not null references public.consultations (id),
  doctor_id               uuid not null references public.doctors (id),
  customer_id             uuid not null references public.customers (id),
  items                   jsonb not null default '[]',   -- [{name, generic_name, strength, dosage, frequency, duration, instructions}]
  advice                  text,
  doctor_registration_no  text not null,                 -- snapshot at issue time
  pdf_path                text,                          -- clinical bucket
  issued_at               timestamptz not null default now(),
  created_at              timestamptz not null default now()
);
create index prescriptions_customer_idx on public.prescriptions (customer_id, issued_at desc);

-- -----------------------------------------------------------------------------
-- Catalog: products, plans, protocol templates
-- -----------------------------------------------------------------------------
create table public.products (
  id                     uuid primary key default gen_random_uuid(),
  sku                    text not null unique,
  slug                   text not null unique,
  name                   text not null,
  tagline                text,
  description_md         text,
  how_to_use_md          text,
  ingredients            jsonb not null default '[]',   -- [{name, role, amount}]
  benefits               jsonb not null default '[]',   -- compliant, substantiated statements only
  regulatory_category    public.regulatory_category not null default 'other',
  requires_consultation  boolean not null default true,
  price_paise            int check (price_paise >= 0),  -- standalone price (care products); null = only via plan
  hsn_code               text,
  gst_rate               numeric(5, 2) check (gst_rate between 0 and 28),
  days_of_supply         int check (days_of_supply > 0),
  images                 jsonb not null default '[]',   -- [{path, alt}] in public-media bucket
  is_active              boolean not null default true,
  sort_order             int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Treatment plans are priced by duration (1 / 2 / 3 months); products inside a plan are set by the doctor
create table public.plans (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  months              int not null check (months between 1 and 12),
  price_paise         int not null check (price_paise >= 0),
  compare_at_paise    int check (compare_at_paise >= 0),
  is_recommended      boolean not null default false,
  guarantee_eligible  boolean not null default true,
  hsn_code            text,                         -- used only if a plan is invoiced as one line (decision D-P14)
  gst_rate            numeric(5, 2) check (gst_rate between 0 and 28),
  description_md      text,
  is_active           boolean not null default true,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

create table public.protocol_templates (
  id                  uuid primary key default gen_random_uuid(),
  doctor_id           uuid references public.doctors (id) on delete cascade,  -- null = shared template
  name                text not null,
  concern             text,
  items               jsonb not null default '[]',   -- [{product_id, dosage, instructions, qty_per_month}]
  default_plan_id     uuid references public.plans (id),
  follow_up_in_weeks  int,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger protocol_templates_updated_at before update on public.protocol_templates
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders, recommendations, credits, payments, refunds, shipments
-- -----------------------------------------------------------------------------
create sequence public.order_code_seq start 10001;

create table public.orders (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique default ('YHC-' || nextval('public.order_code_seq')),
  customer_id           uuid not null references public.customers (id),
  source                public.order_source not null,
  recommendation_id     uuid,                                     -- fk added below
  plan_id               uuid references public.plans (id),
  parent_order_id       uuid references public.orders (id),       -- reorder chain
  status                public.order_status not null default 'pending_payment',
  subtotal_paise        int not null check (subtotal_paise >= 0),
  discount_paise        int not null default 0 check (discount_paise >= 0),
  consult_credit_paise  int not null default 0 check (consult_credit_paise >= 0),
  shipping_paise        int not null default 0 check (shipping_paise >= 0),
  total_paise           int not null check (total_paise >= 0),
  prices_include_tax    boolean not null default true,
  taxable_paise         int,                                      -- filled at invoice time
  cgst_paise            int not null default 0,
  sgst_paise            int not null default 0,
  igst_paise            int not null default 0,
  shipping_address      jsonb,
  supply_days           int check (supply_days > 0),
  paid_at               timestamptz,
  delivered_at          timestamptz,
  plan_end_on           date,                                     -- delivered date (IST) + supply_days
  guarantee_eligible    boolean not null default false,
  invoice_no            text unique,
  invoice_path          text,
  notes                 text,
  cancelled_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (total_paise = subtotal_paise - discount_paise - consult_credit_paise + shipping_paise)
);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_plan_end_idx on public.orders (plan_end_on) where status = 'delivered';
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id),
  name_snapshot     text not null,
  qty               int not null check (qty > 0),
  unit_price_paise  int not null default 0 check (unit_price_paise >= 0),
  dosage            text,
  instructions      text,
  hsn_code          text,
  gst_rate          numeric(5, 2),
  taxable_paise     int,                       -- per line, after allocation (plans: see D-P14)
  tax_paise         int
);
create index order_items_order_idx on public.order_items (order_id);

create table public.recommendations (
  id                    uuid primary key default gen_random_uuid(),
  consultation_id       uuid not null references public.consultations (id),
  customer_id           uuid not null references public.customers (id),
  doctor_id             uuid not null references public.doctors (id),
  plan_id               uuid not null references public.plans (id),
  items                 jsonb not null default '[]',   -- [{product_id, name, dosage, instructions, qty}]
  patient_note          text,
  subtotal_paise        int not null check (subtotal_paise >= 0),
  consult_credit_paise  int not null default 0 check (consult_credit_paise >= 0),
  total_paise           int not null check (total_paise >= 0),
  status                public.recommendation_status not null default 'draft',
  public_token          text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  payment_link_id       text unique,
  payment_link_url      text,
  expires_at            timestamptz,
  sent_at               timestamptz,
  opened_at             timestamptz,
  paid_at               timestamptz,
  order_id              uuid references public.orders (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index recommendations_customer_idx on public.recommendations (customer_id, created_at desc);
create index recommendations_status_idx on public.recommendations (status, sent_at);
create trigger recommendations_updated_at before update on public.recommendations
  for each row execute function public.set_updated_at();

alter table public.orders
  add constraint orders_recommendation_fk foreign key (recommendation_id) references public.recommendations (id);
-- Retrying "Pay" reuses the open order, so the consult credit is never reserved twice
create unique index orders_one_pending_per_recommendation on public.orders (recommendation_id)
  where status = 'pending_payment' and recommendation_id is not null;

-- ₹500 consult fee credited against a plan bought within N days (settings: consult.credit_window_days).
-- Reserved: used_order_id set (order pending). Consumed: used_at set by mark_order_paid. Released: order.expire job clears used_order_id.
create table public.consult_credits (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers (id),
  appointment_id  uuid not null unique references public.appointments (id),
  amount_paise    int not null check (amount_paise >= 0),
  expires_at      timestamptz not null,
  used_order_id   uuid references public.orders (id),
  used_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index consult_credits_customer_idx on public.consult_credits (customer_id) where used_order_id is null;

create table public.payments (
  id                        uuid primary key default gen_random_uuid(),
  purpose                   public.payment_purpose not null,
  customer_id               uuid not null references public.customers (id),
  appointment_id            uuid references public.appointments (id),
  order_id                  uuid references public.orders (id),
  provider                  text not null default 'razorpay',
  provider_order_id         text unique,
  provider_payment_id       text unique,
  provider_payment_link_id  text,
  amount_paise              int not null check (amount_paise >= 0),
  currency                  text not null default 'INR',
  status                    public.payment_status not null default 'created',
  method                    text,
  captured_at               timestamptz,
  failure_reason            text,
  raw                       jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  check (
    (purpose = 'consultation' and appointment_id is not null)
    or (purpose = 'order' and order_id is not null)
  )
);
create index payments_appointment_idx on public.payments (appointment_id);
create index payments_order_idx on public.payments (order_id);
create index payments_status_idx on public.payments (status, created_at desc);
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create table public.refunds (
  id                  uuid primary key default gen_random_uuid(),
  payment_id          uuid not null references public.payments (id),
  amount_paise        int not null check (amount_paise > 0),
  reason              text not null,
  provider_refund_id  text unique,
  method              text not null default 'razorpay' check (method in ('razorpay', 'bank_transfer')),
  payout_reference    text,                     -- UTR / reference for manual bank transfers
  status              public.refund_status not null default 'pending',
  initiated_by        uuid references public.profiles (id),
  guarantee_claim_id  uuid,                         -- fk added below
  created_at          timestamptz not null default now(),
  processed_at        timestamptz
);

create table public.shipments (
  id                     uuid primary key default gen_random_uuid(),
  order_id               uuid not null references public.orders (id),
  provider               text not null default 'shiprocket',
  provider_order_id      text,
  provider_shipment_id   text,
  awb                    text unique,
  courier                text,
  status                 public.shipment_status not null default 'created',
  tracking_url           text,
  expected_delivery_on   date,
  events                 jsonb not null default '[]',
  shipped_at             timestamptz,
  delivered_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index shipments_order_idx on public.shipments (order_id);
create trigger shipments_updated_at before update on public.shipments
  for each row execute function public.set_updated_at();

-- Mark an order delivered and compute when the plan runs out (IST calendar date)
-- Reorders continue from the parent plan's end date if it is still running (no lost days)
create or replace function public.mark_order_delivered(p_order_id uuid, p_delivered_at timestamptz default now())
returns public.orders language plpgsql security definer set search_path = public as $$
declare
  o           public.orders;
  v_parent_end date;
  v_delivered  date := (p_delivered_at at time zone 'Asia/Kolkata')::date;
begin
  select p.plan_end_on into v_parent_end
    from public.orders c join public.orders p on p.id = c.parent_order_id
   where c.id = p_order_id;

  update public.orders
     set status = 'delivered',
         delivered_at = p_delivered_at,
         plan_end_on = case when supply_days is not null
                            then greatest(v_delivered, coalesce(v_parent_end, v_delivered)) + supply_days
                            else null end
   where id = p_order_id and status in ('paid', 'processing', 'shipped')
  returning * into o;
  if found then
    perform public.emit_event('order.delivered', 'order', o.id,
      jsonb_build_object('customer_id', o.customer_id, 'plan_end_on', o.plan_end_on));
  end if;
  return o;
end $$;

-- Idempotency ledger for every inbound webhook
create table public.webhook_events (
  id               uuid primary key default gen_random_uuid(),
  provider         text not null,          -- razorpay | whatsapp | shiprocket | meta_leads
  event_id         text not null,
  event_type       text,
  signature_valid  boolean not null,
  payload          jsonb not null,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz,
  error            text,
  unique (provider, event_id)
);

-- Mark an order paid in ONE transaction: consume reserved consult credit, mark recommendation paid, emit order.paid.
-- Returns 'paid' | 'already_paid' | 'invalid_state:<status>'. Side effects (Shiprocket, invoice, messages) run in event handlers.
create or replace function public.mark_order_paid(p_order_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  update public.orders set status = 'paid', paid_at = now()
   where id = p_order_id and status = 'pending_payment'
  returning * into o;
  if not found then
    select * into o from public.orders where id = p_order_id;
    if not found then raise exception 'ORDER_NOT_FOUND'; end if;
    if o.paid_at is not null then return 'already_paid'; end if;
    return 'invalid_state:' || o.status::text;
  end if;

  update public.consult_credits set used_at = now()
   where used_order_id = o.id and used_at is null;

  if o.recommendation_id is not null then
    update public.recommendations
       set status = 'paid', paid_at = now(), order_id = o.id
     where id = o.recommendation_id;
  end if;

  perform public.emit_event('order.paid', 'order', o.id,
    jsonb_build_object('customer_id', o.customer_id, 'source', o.source, 'total_paise', o.total_paise,
                       'parent_order_id', o.parent_order_id, 'recommendation_id', o.recommendation_id));
  return 'paid';
end $$;

-- THE single idempotent entry point for a captured payment (webhook payment.captured / order.paid /
-- payment_link.paid, server-side verify, reconciliation). Compare-and-set on payments.status makes
-- concurrent calls safe; everything below runs in one transaction.
-- Returns jsonb: { result, payment_id, purpose, appointment_id, order_id, newly_captured }
create or replace function public.capture_payment(
  p_provider_order_id         text,
  p_provider_payment_link_id  text,
  p_provider_payment_id       text,
  p_amount_paise              int,
  p_method                    text default null,
  p_raw                       jsonb default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  pay      public.payments;
  v_new    boolean := false;
  v_result text;
begin
  select * into pay from public.payments
   where (p_provider_order_id is not null and provider_order_id = p_provider_order_id)
      or (p_provider_payment_link_id is not null and provider_payment_link_id = p_provider_payment_link_id)
   order by created_at desc
   limit 1
   for update;
  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if pay.status = 'captured' then
    return jsonb_build_object('result', 'already_captured', 'payment_id', pay.id, 'purpose', pay.purpose,
      'appointment_id', pay.appointment_id, 'order_id', pay.order_id, 'newly_captured', false);
  end if;

  if p_amount_paise <> pay.amount_paise then
    -- Do not raise (that would roll back this audit write); flag it and let the caller alert + refund
    update public.payments set failure_reason = 'AMOUNT_MISMATCH', raw = p_raw where id = pay.id;
    perform public.emit_event('payment.amount_mismatch', 'payment', pay.id,
      jsonb_build_object('expected', pay.amount_paise, 'received', p_amount_paise, 'provider_payment_id', p_provider_payment_id));
    return jsonb_build_object('result', 'amount_mismatch', 'payment_id', pay.id, 'purpose', pay.purpose,
      'appointment_id', pay.appointment_id, 'order_id', pay.order_id, 'newly_captured', false);
  end if;

  update public.payments
     set status = 'captured', provider_payment_id = p_provider_payment_id, method = p_method,
         captured_at = now(), raw = p_raw
   where id = pay.id and status <> 'captured';
  v_new := found;

  if pay.purpose = 'consultation' then
    perform public.emit_event('payment.consultation.captured', 'payment', pay.id,
      jsonb_build_object('customer_id', pay.customer_id, 'appointment_id', pay.appointment_id, 'amount_paise', pay.amount_paise));
    v_result := public.confirm_appointment_payment(pay.appointment_id);   -- emits appointment.booked / appointment.slot_lost
  else
    perform public.emit_event('payment.order.captured', 'payment', pay.id,
      jsonb_build_object('customer_id', pay.customer_id, 'order_id', pay.order_id, 'amount_paise', pay.amount_paise));
    v_result := public.mark_order_paid(pay.order_id);                       -- emits order.paid
  end if;

  return jsonb_build_object('result', v_result, 'payment_id', pay.id, 'purpose', pay.purpose,
    'appointment_id', pay.appointment_id, 'order_id', pay.order_id, 'newly_captured', v_new);
end $$;

-- -----------------------------------------------------------------------------
-- CRM: leads, activities, tasks
-- -----------------------------------------------------------------------------
create table public.leads (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null unique references public.customers (id) on delete cascade,
  stage              public.lead_stage not null default 'new',
  stage_changed_at   timestamptz not null default now(),
  assigned_to        uuid references public.profiles (id),
  source             text,                      -- meta_ads | whatsapp | website | google | referral | walk_in
  campaign           text,
  utm                jsonb not null default '{}',
  meta_lead_id       text unique,
  lost_reason        text,
  next_action_at     timestamptz,
  last_contacted_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index leads_stage_idx on public.leads (stage, stage_changed_at desc);
create index leads_assigned_idx on public.leads (assigned_to, stage);
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

create table public.lead_activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  actor_id    uuid references public.profiles (id),
  kind        text not null check (kind in ('note', 'call', 'whatsapp', 'email', 'stage_change', 'system')),
  body        text,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

create table public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references public.leads (id) on delete cascade,
  customer_id         uuid references public.customers (id) on delete cascade,
  assigned_to         uuid references public.profiles (id),
  kind                text not null,      -- call_new_lead | recover_hold | unpaid_plan | refill_call | side_effect | intake_missing | custom
  title               text not null,
  due_at              timestamptz,
  status              public.task_status not null default 'open',
  priority            smallint not null default 2 check (priority between 1 and 3),  -- 1 = urgent
  created_by_system   boolean not null default false,
  dedupe_key          text unique,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index tasks_assignee_idx on public.tasks (assigned_to, status, due_at);
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.lead_stage_rank(s public.lead_stage)
returns int language sql immutable as $$
  select array_position(enum_range(null::public.lead_stage), s)
$$;

-- System events move a lead FORWARD only. The retention loop
-- (product_delivered -> followup_active -> reorder_due -> reordered -> followup_active) may cycle.
-- A paid event re-opens a 'lost' lead. Manual moves use set_lead_stage_manual (server action).
create or replace function public.advance_lead_stage(p_customer_id uuid, p_stage public.lead_stage, p_reason text default null)
returns public.lead_stage language plpgsql security definer set search_path = public as $$
declare
  l          public.leads;
  v_loop     public.lead_stage[] := array['product_delivered', 'followup_active', 'reorder_due', 'reordered']::public.lead_stage[];
  v_allowed  boolean;
begin
  select * into l from public.leads where customer_id = p_customer_id for update;
  if not found then
    insert into public.leads (customer_id, stage, source) values (p_customer_id, p_stage, 'system')
    returning * into l;
    insert into public.lead_activities (lead_id, kind, body, meta)
    values (l.id, 'stage_change', coalesce(p_reason, 'created by system'), jsonb_build_object('to', p_stage));
    return p_stage;
  end if;

  if l.stage = p_stage then
    return l.stage;
  end if;

  if l.stage = 'lost' then
    v_allowed := p_stage in ('payment_successful', 'product_purchased', 'reordered');
  elsif l.stage = any (v_loop) and p_stage = any (v_loop) then
    v_allowed := true;
  else
    v_allowed := public.lead_stage_rank(p_stage) > public.lead_stage_rank(l.stage) and p_stage <> 'lost';
  end if;

  if not v_allowed then
    return l.stage;
  end if;

  update public.leads set stage = p_stage, stage_changed_at = now() where id = l.id;
  insert into public.lead_activities (lead_id, kind, body, meta)
  values (l.id, 'stage_change', p_reason, jsonb_build_object('from', l.stage, 'to', p_stage, 'by', 'system'));
  return p_stage;
end $$;

-- People may only set the manual stages, and only before money is involved (lost: any time before purchase).
create or replace function public.lead_manual_stage_allowed(p_from public.lead_stage, p_to public.lead_stage)
returns boolean language sql immutable as $$
  select case
    when p_to = 'lost' then p_from not in ('product_purchased', 'product_delivered', 'followup_active', 'reorder_due', 'reordered')
    when p_to in ('contacted', 'interested', 'consult_suggested')
      then p_from in ('new', 'contacted', 'interested', 'consult_suggested', 'consult_link_sent', 'lost')
    else false
  end
$$;

-- Browser-originated updates (sales users) cannot move stages outside the manual rules
create or replace function public.guard_lead_stage()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stage is distinct from old.stage
     and auth.uid() is not null
     and not public.has_role(array['admin']::public.app_role[])
     and not public.lead_manual_stage_allowed(old.stage, new.stage) then
    raise exception 'STAGE_SET_BY_SYSTEM_ONLY';
  end if;
  return new;
end $$;
create trigger leads_guard_stage before update on public.leads
  for each row execute function public.guard_lead_stage();

-- Server action helper for manual moves (logs the activity)
create or replace function public.set_lead_stage_manual(p_lead_id uuid, p_stage public.lead_stage, p_reason text default null)
returns public.lead_stage language plpgsql security definer set search_path = public as $$
declare l public.leads;
begin
  if auth.uid() is not null and not public.has_role(array['sales', 'admin']::public.app_role[]) then
    raise exception 'NOT_ALLOWED';
  end if;
  select * into l from public.leads where id = p_lead_id for update;
  if not found then raise exception 'LEAD_NOT_FOUND'; end if;
  if not public.lead_manual_stage_allowed(l.stage, p_stage) then
    raise exception 'STAGE_SET_BY_SYSTEM_ONLY';
  end if;
  if p_stage = 'lost' and coalesce(trim(p_reason), '') = '' then
    raise exception 'LOST_REASON_REQUIRED';
  end if;
  update public.leads
     set stage = p_stage, stage_changed_at = now(),
         lost_reason = case when p_stage = 'lost' then p_reason else lost_reason end
   where id = l.id;
  insert into public.lead_activities (lead_id, actor_id, kind, body, meta)
  values (l.id, auth.uid(), 'stage_change', p_reason, jsonb_build_object('from', l.stage, 'to', p_stage, 'by', 'manual'));
  return p_stage;
end $$;

-- -----------------------------------------------------------------------------
-- Messaging
-- -----------------------------------------------------------------------------
create table public.message_templates (
  key                     text primary key,           -- e.g. 'booking_confirmed'
  channel                 public.message_channel not null,
  provider_template_name  text,                       -- name approved in Meta / DLT template id for SMS
  language                text not null default 'en',
  category                public.message_category not null,
  body_preview            text not null,
  variables               jsonb not null default '[]',
  buttons                 jsonb not null default '[]',
  is_active               boolean not null default true,
  updated_at              timestamptz not null default now()
);
create trigger message_templates_updated_at before update on public.message_templates
  for each row execute function public.set_updated_at();

create table public.messages (
  id                   uuid primary key default gen_random_uuid(),
  customer_id          uuid references public.customers (id) on delete set null,
  channel              public.message_channel not null,
  direction            public.message_direction not null,
  template_key         text references public.message_templates (key),
  category             public.message_category,
  to_address           text,
  from_address         text,
  body                 text,
  payload              jsonb not null default '{}',
  provider_message_id  text unique,
  status               public.message_status not null default 'queued',
  error                text,
  related_entity       text,
  related_id           uuid,
  sent_at              timestamptz,
  delivered_at         timestamptz,
  read_at              timestamptz,
  created_at           timestamptz not null default now()
);
create index messages_customer_idx on public.messages (customer_id, created_at desc);
create index messages_related_idx on public.messages (related_entity, related_id);

-- -----------------------------------------------------------------------------
-- Background jobs (processed by /api/cron/jobs, triggered every minute)
-- -----------------------------------------------------------------------------
create table public.scheduled_jobs (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,                 -- e.g. 'message.send', 'refill.reminder', 'hold.expire'
  run_at        timestamptz not null default now(),
  payload       jsonb not null default '{}',
  status        public.job_status not null default 'pending',
  attempts      int not null default 0,
  max_attempts  int not null default 5,
  last_error    text,
  dedupe_key    text unique,                   -- prevents duplicate scheduling
  locked_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index scheduled_jobs_due_idx on public.scheduled_jobs (run_at) where status = 'pending';
create trigger scheduled_jobs_updated_at before update on public.scheduled_jobs
  for each row execute function public.set_updated_at();

create or replace function public.claim_jobs(p_limit int default 20)
returns setof public.scheduled_jobs language plpgsql security definer set search_path = public as $$
begin
  -- recover jobs stuck in 'running' (worker crashed)
  update public.scheduled_jobs
     set status = 'pending', locked_at = null
   where status = 'running' and locked_at < now() - interval '10 minutes';

  return query
  update public.scheduled_jobs j
     set status = 'running', locked_at = now(), attempts = j.attempts + 1
   where j.id in (
     select id from public.scheduled_jobs
      where status = 'pending' and run_at <= now()
      order by run_at
      limit p_limit
      for update skip locked
   )
  returning j.*;
end $$;

-- Cancel pending jobs by dedupe-key prefix (e.g. all reminders for an appointment that was cancelled)
create or replace function public.cancel_jobs(p_dedupe_prefix text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with x as (
    update public.scheduled_jobs set status = 'cancelled'
     where status = 'pending' and dedupe_key like p_dedupe_prefix || '%'
    returning 1
  )
  select count(*) into n from x;
  return n;
end $$;

-- -----------------------------------------------------------------------------
-- Care follow-ups
-- -----------------------------------------------------------------------------
create table public.care_checkins (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customers (id) on delete cascade,
  order_id          uuid not null references public.orders (id) on delete cascade,
  week_no           smallint not null check (week_no between 1 and 52),
  scheduled_for     date not null,
  sent_message_id   uuid references public.messages (id),
  response          text,
  responded_at      timestamptz,
  side_effect_flag  boolean not null default false,
  handled_by        uuid references public.profiles (id),
  handled_at        timestamptz,
  created_at        timestamptz not null default now(),
  unique (order_id, week_no)
);
create index care_checkins_customer_idx on public.care_checkins (customer_id, scheduled_for);

-- -----------------------------------------------------------------------------
-- Money-back guarantee (terms are data; nothing is live until a policy is active)
-- -----------------------------------------------------------------------------
create table public.guarantee_policies (
  id                        uuid primary key default gen_random_uuid(),
  version                   int not null unique,
  name                      text not null,
  refund_percent            numeric(5, 2) not null check (refund_percent between 0 and 100),
  min_plan_months           int not null check (min_plan_months between 1 and 24),
  claim_window_days         int not null check (claim_window_days between 1 and 365),
  min_checkin_response_pct  int not null default 0 check (min_checkin_response_pct between 0 and 100),
  require_monthly_photos    boolean not null default true,
  require_followup_consult  boolean not null default true,
  terms_md                  text not null,
  is_active                 boolean not null default false,
  published_at              timestamptz,
  created_at                timestamptz not null default now()
);
create unique index guarantee_policies_one_active on public.guarantee_policies ((true)) where is_active;

create table public.guarantee_enrollments (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers (id),
  policy_id       uuid not null references public.guarantee_policies (id),
  first_order_id  uuid not null unique references public.orders (id),
  started_on      date not null,
  status          text not null default 'active' check (status in ('active', 'completed', 'claimed', 'void')),
  void_reason     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index guarantee_enrollments_customer_idx on public.guarantee_enrollments (customer_id);
create trigger guarantee_enrollments_updated_at before update on public.guarantee_enrollments
  for each row execute function public.set_updated_at();

create table public.guarantee_claims (
  id                   uuid primary key default gen_random_uuid(),
  enrollment_id        uuid not null references public.guarantee_enrollments (id),
  customer_id          uuid not null references public.customers (id),
  status               public.guarantee_claim_status not null default 'submitted',
  customer_statement   text,
  eligibility          jsonb not null default '{}',   -- snapshot of every rule and its result at submission
  eligible             boolean,
  reviewed_by          uuid references public.profiles (id),
  review_notes         text,
  decided_at           timestamptz,
  refund_amount_paise  int check (refund_amount_paise >= 0),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index guarantee_claims_status_idx on public.guarantee_claims (status, created_at);
create trigger guarantee_claims_updated_at before update on public.guarantee_claims
  for each row execute function public.set_updated_at();

alter table public.refunds
  add constraint refunds_guarantee_claim_fk foreign key (guarantee_claim_id) references public.guarantee_claims (id);

-- -----------------------------------------------------------------------------
-- Content: concerns, posts, FAQs, reviews
-- -----------------------------------------------------------------------------
create table public.concerns (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  summary       text,
  body_md       text,
  sort_order    int not null default 0,
  is_published  boolean not null default false,
  updated_at    timestamptz not null default now()
);

create table public.posts (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  excerpt             text,
  body_md             text not null default '',
  cover_path          text,
  author_doctor_id    uuid references public.doctors (id),
  status              text not null default 'draft' check (status in ('draft', 'review', 'published')),
  medically_reviewed  boolean not null default false,
  seo                 jsonb not null default '{}',
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

create table public.faqs (
  id            uuid primary key default gen_random_uuid(),
  category      text not null default 'general',
  question      text not null,
  answer_md     text not null,
  sort_order    int not null default 0,
  is_published  boolean not null default false,
  unique (category, question)
);

create table public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid references public.customers (id) on delete set null,
  display_name       text not null,
  city               text,
  rating             smallint not null check (rating between 1 and 5),
  body               text not null,
  media              jsonb not null default '[]',
  has_before_after   boolean not null default false,
  verified_purchase  boolean not null default false,
  consent_id         uuid,                               -- fk below: no consent, no publication
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at         timestamptz not null default now(),
  check (status <> 'approved' or consent_id is not null)
);

-- -----------------------------------------------------------------------------
-- Free hair assessment answers are health data: kept out of leads (sales-visible)
-- -----------------------------------------------------------------------------
create table public.assessments (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references public.customers (id) on delete cascade,   -- null until OTP
  answers      jsonb not null,
  result       jsonb not null default '{}',
  form_version text not null,
  created_at   timestamptz not null default now()
);
create index assessments_customer_idx on public.assessments (customer_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Compliance: consents, data requests, audit log, settings
-- -----------------------------------------------------------------------------
create table public.consents (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers (id) on delete cascade,
  kind            public.consent_kind not null,
  version         text not null,          -- version of the policy/notice text shown
  granted         boolean not null,
  source          text not null,          -- booking_form | checkout | whatsapp | account | consult_call
  appointment_id  uuid references public.appointments (id),
  ip              inet,
  user_agent      text,
  created_at      timestamptz not null default now()
);
create index consents_customer_idx on public.consents (customer_id, kind, created_at desc);

alter table public.reviews
  add constraint reviews_consent_fk foreign key (consent_id) references public.consents (id);

create table public.data_requests (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers (id),
  kind         text not null check (kind in ('access', 'correction', 'erasure', 'withdraw_consent', 'grievance')),
  status       text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'rejected')),
  details      text,
  resolved_by  uuid references public.profiles (id),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table public.audit_logs (
  id          bigserial primary key,
  actor_id    uuid,
  actor_role  public.app_role,
  action      text not null,          -- e.g. 'consultation.view', 'refund.create', 'settings.update'
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip          inet,
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

create table public.settings (
  key          text primary key,
  value        jsonb not null,
  description  text,
  is_public    boolean not null default false,   -- readable by anon (footer, support numbers, guarantee flag)
  updated_by   uuid references public.profiles (id),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Analytics views (security_invoker: callers see only what RLS allows them)
-- -----------------------------------------------------------------------------
create view public.v_lead_funnel with (security_invoker = true) as
select stage, count(*)::int as leads
from public.leads
group by stage;

create view public.v_daily_kpis with (security_invoker = true) as
with days as (
  select generate_series(
    (now() at time zone 'Asia/Kolkata')::date - 89,
    (now() at time zone 'Asia/Kolkata')::date,
    interval '1 day'
  )::date as day
)
select
  d.day,
  (select count(*) from public.leads l
     where (l.created_at at time zone 'Asia/Kolkata')::date = d.day)::int as new_leads,
  (select count(*) from public.payments p
     where p.purpose = 'consultation' and p.status = 'captured'
       and (p.captured_at at time zone 'Asia/Kolkata')::date = d.day)::int as paid_consults,
  (select coalesce(sum(p.amount_paise), 0) from public.payments p
     where p.purpose = 'consultation' and p.status = 'captured'
       and (p.captured_at at time zone 'Asia/Kolkata')::date = d.day)::bigint as consult_revenue_paise,
  (select count(*) from public.appointments a
     where a.status = 'completed'
       and (a.completed_at at time zone 'Asia/Kolkata')::date = d.day)::int as completed_consults,
  (select count(*) from public.orders o
     where o.paid_at is not null and o.source = 'recommendation'
       and (o.paid_at at time zone 'Asia/Kolkata')::date = d.day)::int as plans_from_consults,
  (select count(*) from public.orders o
     where o.paid_at is not null and o.source = 'reorder'
       and (o.paid_at at time zone 'Asia/Kolkata')::date = d.day)::int as reorders,
  (select coalesce(sum(o.total_paise), 0) from public.orders o
     where o.paid_at is not null
       and (o.paid_at at time zone 'Asia/Kolkata')::date = d.day)::bigint as order_revenue_paise
from days d;

-- Sales-safe projections: no dosage/instructions/patient notes. These views run with owner rights
-- (not security_invoker) and filter by role themselves.
create view public.v_sales_recommendations as
select id, customer_id, doctor_id, plan_id, subtotal_paise, consult_credit_paise, total_paise,
       status, expires_at, sent_at, opened_at, paid_at, order_id, created_at
  from public.recommendations
 where status <> 'draft' and public.has_role(array['sales', 'admin']::public.app_role[]);

create view public.v_sales_order_items as
select oi.id, oi.order_id, oi.product_id, oi.name_snapshot, oi.qty, oi.unit_price_paise
  from public.order_items oi
 where public.has_role(array['sales', 'admin']::public.app_role[]);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'customers', 'addresses', 'doctors', 'doctor_integrations',
    'availability_rules', 'availability_exceptions', 'calendar_busy_blocks',
    'domain_events', 'appointments', 'intake_forms', 'media', 'consultations',
    'prescriptions', 'products', 'plans', 'protocol_templates', 'orders',
    'order_items', 'recommendations', 'consult_credits', 'payments', 'refunds',
    'shipments', 'webhook_events', 'leads', 'lead_activities', 'tasks',
    'message_templates', 'messages', 'scheduled_jobs', 'care_checkins',
    'guarantee_policies', 'guarantee_enrollments', 'guarantee_claims',
    'concerns', 'posts', 'faqs', 'reviews', 'consents', 'data_requests',
    'audit_logs', 'settings', 'assessments'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    -- Admins can read and write everything (except secret-only tables, handled below)
    if t not in ('doctor_integrations', 'webhook_events') then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.has_role(array[''admin'']::public.app_role[])) with check (public.has_role(array[''admin'']::public.app_role[]))',
        t || '_admin_all', t);
    end if;
  end loop;
end $$;
-- doctor_integrations, webhook_events: no further policies => service role only.

-- profiles
create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_select_staff on public.profiles for select to authenticated
  using (public.is_staff() and role <> 'customer');

-- customers
create policy customers_self_select on public.customers for select to authenticated using (profile_id = auth.uid());
create policy customers_self_update on public.customers for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy customers_staff_select on public.customers for select to authenticated
  using (public.has_role(array['doctor', 'sales', 'ops']::public.app_role[]));
create policy customers_sales_update on public.customers for update to authenticated
  using (public.has_role(array['sales']::public.app_role[])) with check (public.has_role(array['sales']::public.app_role[]));
-- (identity/consent columns are protected by customers_guard_columns)

-- addresses
create policy addresses_self_all on public.addresses for all to authenticated
  using (customer_id = public.current_customer_id()) with check (customer_id = public.current_customer_id());
create policy addresses_staff_select on public.addresses for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]));

-- doctors (public profile is public; secrets live in doctor_integrations)
create policy doctors_public_select on public.doctors for select to anon, authenticated using (is_active);
create policy doctors_self_update on public.doctors for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- availability
create policy availability_rules_doctor_all on public.availability_rules for all to authenticated
  using (doctor_id = public.current_doctor_id()) with check (doctor_id = public.current_doctor_id());
create policy availability_exceptions_doctor_all on public.availability_exceptions for all to authenticated
  using (doctor_id = public.current_doctor_id()) with check (doctor_id = public.current_doctor_id());
create policy calendar_busy_blocks_doctor_select on public.calendar_busy_blocks for select to authenticated
  using (doctor_id = public.current_doctor_id());

-- appointments
create policy appointments_customer_select on public.appointments for select to authenticated
  using (customer_id = public.current_customer_id());
create policy appointments_doctor_select on public.appointments for select to authenticated
  using (doctor_id = public.current_doctor_id());
-- No browser UPDATE on appointments: status changes go through audited server actions (service role).
create policy appointments_sales_ops_select on public.appointments for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]));

-- intake (clinical: customer + doctor only)
create policy intake_customer_select on public.intake_forms for select to authenticated
  using (customer_id = public.current_customer_id());
create policy intake_customer_insert on public.intake_forms for insert to authenticated
  with check (customer_id = public.current_customer_id());
-- Editable only until the consultation starts; afterwards it is part of the medical record
create policy intake_customer_update on public.intake_forms for update to authenticated
  using (customer_id = public.current_customer_id()
         and exists (select 1 from public.appointments a
                      where a.id = appointment_id and a.status in ('held', 'booked') and a.starts_at > now()))
  with check (customer_id = public.current_customer_id());
create policy intake_doctor_select on public.intake_forms for select to authenticated
  using (exists (select 1 from public.appointments a where a.id = appointment_id and a.doctor_id = public.current_doctor_id()));

-- media (clinical files; actual bytes are served by short-lived signed URLs from the server)
create policy media_customer_select on public.media for select to authenticated
  using (customer_id = public.current_customer_id());
create policy media_doctor_select on public.media for select to authenticated
  using (public.has_role(array['doctor']::public.app_role[]));

-- consultations: doctor only. Patients read their summary through server code that omits private_notes.
create policy consultations_doctor_all on public.consultations for all to authenticated
  using (doctor_id = public.current_doctor_id()) with check (doctor_id = public.current_doctor_id());

-- prescriptions
create policy prescriptions_doctor_all on public.prescriptions for all to authenticated
  using (doctor_id = public.current_doctor_id()) with check (doctor_id = public.current_doctor_id());
create policy prescriptions_customer_select on public.prescriptions for select to authenticated
  using (customer_id = public.current_customer_id());

-- catalog + content: public read of active/published rows
create policy products_public_select on public.products for select to anon, authenticated using (is_active);
create policy plans_public_select on public.plans for select to anon, authenticated using (is_active);
create policy concerns_public_select on public.concerns for select to anon, authenticated using (is_published);
create policy posts_public_select on public.posts for select to anon, authenticated using (status = 'published');
create policy faqs_public_select on public.faqs for select to anon, authenticated using (is_published);
create policy reviews_public_select on public.reviews for select to anon, authenticated using (status = 'approved');
create policy guarantee_policies_public_select on public.guarantee_policies for select to anon, authenticated using (is_active);
create policy posts_doctor_review on public.posts for update to authenticated
  using (public.has_role(array['doctor']::public.app_role[])) with check (public.has_role(array['doctor']::public.app_role[]));

-- protocol templates
create policy protocol_templates_doctor_all on public.protocol_templates for all to authenticated
  using (doctor_id = public.current_doctor_id() or (doctor_id is null and public.has_role(array['doctor']::public.app_role[])))
  with check (doctor_id = public.current_doctor_id());

-- orders & items
create policy orders_customer_select on public.orders for select to authenticated
  using (customer_id = public.current_customer_id());
create policy orders_staff_select on public.orders for select to authenticated
  using (public.has_role(array['sales', 'ops', 'doctor']::public.app_role[]));
-- No browser UPDATE on orders: ops overrides go through audited server actions.
create policy order_items_customer_select on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = public.current_customer_id()));
create policy order_items_staff_select on public.order_items for select to authenticated
  using (public.has_role(array['ops', 'doctor']::public.app_role[]));   -- sales: v_sales_order_items

-- recommendations (sales may see them to follow up unpaid plans)
create policy recommendations_customer_select on public.recommendations for select to authenticated
  using (customer_id = public.current_customer_id() and status <> 'draft');
create policy recommendations_doctor_all on public.recommendations for all to authenticated
  using (doctor_id = public.current_doctor_id()) with check (doctor_id = public.current_doctor_id());
-- sales: v_sales_recommendations (no dosage/instructions/notes)

create policy consult_credits_customer_select on public.consult_credits for select to authenticated
  using (customer_id = public.current_customer_id());
create policy consult_credits_staff_select on public.consult_credits for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]));

-- payments / refunds (writes: service role only, from webhooks)
create policy payments_customer_select on public.payments for select to authenticated
  using (customer_id = public.current_customer_id());
create policy payments_staff_select on public.payments for select to authenticated
  using (public.has_role(array['sales', 'ops', 'doctor']::public.app_role[]));
create policy refunds_ops_select on public.refunds for select to authenticated
  using (public.has_role(array['ops']::public.app_role[]));

-- shipments
create policy shipments_customer_select on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = public.current_customer_id()));
create policy shipments_staff_select on public.shipments for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]));
-- No browser UPDATE on shipments: ops overrides via audited server actions.

-- CRM (sales only; doctors do not see the pipeline)
create policy leads_sales_select on public.leads for select to authenticated
  using (public.has_role(array['sales']::public.app_role[]));
create policy leads_sales_insert on public.leads for insert to authenticated
  with check (public.has_role(array['sales']::public.app_role[]) and stage in ('new', 'contacted', 'interested'));
create policy leads_sales_update on public.leads for update to authenticated
  using (public.has_role(array['sales']::public.app_role[])) with check (public.has_role(array['sales']::public.app_role[]));
-- (stage moves are restricted by leads_guard_stage)
create policy lead_activities_sales_all on public.lead_activities for all to authenticated
  using (public.has_role(array['sales']::public.app_role[])) with check (public.has_role(array['sales']::public.app_role[]));
create policy tasks_staff_select on public.tasks for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]) or assigned_to = auth.uid());
create policy tasks_staff_update on public.tasks for update to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]) or assigned_to = auth.uid())
  with check (public.has_role(array['sales', 'ops']::public.app_role[]) or assigned_to = auth.uid());
create policy tasks_sales_insert on public.tasks for insert to authenticated
  with check (public.has_role(array['sales', 'ops']::public.app_role[]));

-- messaging
create policy message_templates_staff_select on public.message_templates for select to authenticated using (public.is_staff());
create policy messages_sales_select on public.messages for select to authenticated
  using (public.has_role(array['sales']::public.app_role[]));

-- care check-ins (care team = sales role; doctor sees flagged ones)
create policy care_checkins_sales_all on public.care_checkins for all to authenticated
  using (public.has_role(array['sales']::public.app_role[])) with check (public.has_role(array['sales']::public.app_role[]));
create policy care_checkins_doctor_select on public.care_checkins for select to authenticated
  using (public.has_role(array['doctor']::public.app_role[]));

-- guarantee
create policy guarantee_enrollments_customer_select on public.guarantee_enrollments for select to authenticated
  using (customer_id = public.current_customer_id());
create policy guarantee_enrollments_staff_select on public.guarantee_enrollments for select to authenticated
  using (public.has_role(array['doctor', 'sales', 'ops']::public.app_role[]));
create policy guarantee_claims_customer_select on public.guarantee_claims for select to authenticated
  using (customer_id = public.current_customer_id());
create policy guarantee_claims_doctor_review on public.guarantee_claims for all to authenticated
  using (public.has_role(array['doctor']::public.app_role[])) with check (public.has_role(array['doctor']::public.app_role[]));
create policy guarantee_claims_staff_select on public.guarantee_claims for select to authenticated
  using (public.has_role(array['sales', 'ops']::public.app_role[]));

-- compliance
create policy consents_customer_select on public.consents for select to authenticated
  using (customer_id = public.current_customer_id());
create policy data_requests_customer_select on public.data_requests for select to authenticated
  using (customer_id = public.current_customer_id());
create policy data_requests_customer_insert on public.data_requests for insert to authenticated
  with check (customer_id = public.current_customer_id());
create policy settings_staff_select on public.settings for select to authenticated using (public.is_staff());
create policy settings_public_select on public.settings for select to anon, authenticated using (is_public);
create policy assessments_customer_select on public.assessments for select to authenticated
  using (customer_id = public.current_customer_id());
create policy assessments_doctor_select on public.assessments for select to authenticated
  using (public.has_role(array['doctor']::public.app_role[]));
-- audit_logs, domain_events, scheduled_jobs: admin only (via admin_all policy)

-- -----------------------------------------------------------------------------
-- Function privileges: server-side helpers are not callable from browsers
-- -----------------------------------------------------------------------------
revoke execute on function public.hold_slot(uuid, uuid, timestamptz, public.appointment_kind, text, int, int) from public;
revoke execute on function public.confirm_appointment_payment(uuid) from public;
revoke execute on function public.expire_stale_holds() from public;
revoke execute on function public.claim_jobs(int) from public;
revoke execute on function public.cancel_jobs(text) from public;
revoke execute on function public.advance_lead_stage(uuid, public.lead_stage, text) from public;
revoke execute on function public.mark_order_delivered(uuid, timestamptz) from public;
revoke execute on function public.emit_event(text, text, uuid, jsonb) from public;
revoke execute on function public.capture_payment(text, text, text, int, text, jsonb) from public;
revoke execute on function public.mark_order_paid(uuid) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke execute on function public.hold_slot(uuid, uuid, timestamptz, public.appointment_kind, text, int, int) from anon, authenticated;
    revoke execute on function public.confirm_appointment_payment(uuid) from anon, authenticated;
    revoke execute on function public.expire_stale_holds() from anon, authenticated;
    revoke execute on function public.claim_jobs(int) from anon, authenticated;
    revoke execute on function public.cancel_jobs(text) from anon, authenticated;
    revoke execute on function public.advance_lead_stage(uuid, public.lead_stage, text) from anon, authenticated;
    revoke execute on function public.mark_order_delivered(uuid, timestamptz) from anon, authenticated;
    revoke execute on function public.emit_event(text, text, uuid, jsonb) from anon, authenticated;
    revoke execute on function public.capture_payment(text, text, text, int, text, jsonb) from anon, authenticated;
    revoke execute on function public.mark_order_paid(uuid) from anon, authenticated;
    revoke select on public.v_sales_recommendations, public.v_sales_order_items from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.hold_slot(uuid, uuid, timestamptz, public.appointment_kind, text, int, int) to service_role;
    grant execute on function public.confirm_appointment_payment(uuid) to service_role;
    grant execute on function public.expire_stale_holds() to service_role;
    grant execute on function public.claim_jobs(int) to service_role;
    grant execute on function public.cancel_jobs(text) to service_role;
    grant execute on function public.advance_lead_stage(uuid, public.lead_stage, text) to service_role;
    grant execute on function public.mark_order_delivered(uuid, timestamptz) to service_role;
    grant execute on function public.emit_event(text, text, uuid, jsonb) to service_role;
    grant execute on function public.capture_payment(text, text, text, int, text, jsonb) to service_role;
    grant execute on function public.mark_order_paid(uuid) to service_role;
  end if;
end $$;
