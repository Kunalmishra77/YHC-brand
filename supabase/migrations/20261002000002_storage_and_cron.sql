-- =============================================================================
-- Storage buckets + scheduled job trigger
-- =============================================================================

-- clinical: PRIVATE. Intake/progress photos, prescriptions, invoices, doctor signature.
--   No storage policies on purpose: the server issues short-lived signed upload/download URLs.
-- public-media: PUBLIC read. Product images, blog covers, doctor portrait.
insert into storage.buckets (id, name, public)
values ('clinical', 'clinical', false),
       ('public-media', 'public-media', true)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Job runner trigger (every minute) — Supabase hosted only.
-- pg_cron + pg_net call the Next.js endpoint that drains scheduled_jobs and domain_events.
-- Run this block MANUALLY in the Supabase SQL editor per environment after setting the two
-- vault secrets (see docs/11_Deployment_DevOps.md §Job runner). It is commented out so that
-- `supabase db reset` works locally without pg_cron.
-- -----------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
-- select vault.create_secret('https://<your-domain>/api/cron/jobs', 'jobs_url');
-- select vault.create_secret('<CRON_SECRET value>', 'cron_secret');
-- select cron.schedule('yhc-run-jobs', '* * * * *', $$
--   select net.http_post(
--     url     := (select decrypted_secret from vault.decrypted_secrets where name = 'jobs_url'),
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
--     ),
--     body    := '{}'::jsonb,
--     timeout_milliseconds := 25000
--   );
-- $$);
