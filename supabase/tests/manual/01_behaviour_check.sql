-- =============================================================================
-- Behaviour checks for SQL functions and RLS. Run on a FRESH database only.
-- Every NOTICE must say PASS; column names state the expected value.
-- =============================================================================
\set ON_ERROR_STOP 1
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Fixtures: doctor (d), customers c1/c2, sales (5a)
insert into auth.users (id, phone) values
  ('00000000-0000-0000-0000-00000000000d', '+919000000001'),
  ('00000000-0000-0000-0000-0000000000c1', '+919000000002'),
  ('00000000-0000-0000-0000-0000000000c2', '+919000000003'),
  ('00000000-0000-0000-0000-00000000005a', '+919000000004');
update profiles set role = 'doctor' where id = '00000000-0000-0000-0000-00000000000d';
update profiles set role = 'sales'  where id = '00000000-0000-0000-0000-00000000005a';
insert into doctors (id, profile_id, slug, display_name, registration_no, registration_council)
values ('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-00000000000d','dr-tyagi','Dr. Tyagi','REG-123','DMC');
insert into customers (id, profile_id, phone, full_name) values
 ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000c1','+919000000002','Cust One'),
 ('00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-0000000000c2','+919000000003','Cust Two');

-- 1. Holds: overlap blocked, expired hold frees slot
select status, fee_paise from hold_slot('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-0000000000a1','2026-11-02 05:00+00');
do $$ begin
  perform hold_slot('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-0000000000a2','2026-11-02 05:15+00');
  raise exception 'TEST FAIL: overlap allowed';
exception when others then
  if sqlerrm <> 'SLOT_TAKEN' then raise; end if; raise notice 'PASS overlap blocked';
end $$;
update appointments set hold_expires_at = now() - interval '1 minute' where customer_id = '00000000-0000-0000-0000-0000000000a1';
select 'PASS expired hold replaced' where (select status from hold_slot('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-0000000000a2','2026-11-02 05:00+00')) = 'held';

-- 2. capture_payment: late payer loses slot, on-time payer booked, replays are no-ops, amount mismatch flagged
insert into payments (purpose, customer_id, appointment_id, provider_order_id, amount_paise)
select 'consultation', customer_id, id, 'order_c' || right(customer_id::text, 1), fee_paise from appointments;
select capture_payment('order_c1', null, 'pay_1', 50000) ->> 'result' as c1_slot_lost;
select capture_payment('order_c2', null, 'pay_2', 50000) ->> 'result' as c2_booked;
select capture_payment('order_c2', null, 'pay_2', 50000) ->> 'result' as c2_replay_already_captured;
select count(*) as booked_events_1 from domain_events where type = 'appointment.booked';
select count(*) as slot_lost_events_1 from domain_events where type = 'appointment.slot_lost';
select (hold_slot('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-0000000000a1','2026-11-03 05:00+00')).status as rehold_held;
insert into payments (purpose, customer_id, appointment_id, provider_order_id, amount_paise)
select 'consultation', customer_id, id, 'order_mismatch', 50000 from appointments where status = 'held' limit 1;
select capture_payment('order_mismatch', null, 'pay_x', 100) ->> 'result' as amount_mismatch;
select status as mismatch_payment_not_captured from payments where provider_order_id = 'order_mismatch';

-- 3. Lead stages (system rules)
select advance_lead_stage('00000000-0000-0000-0000-0000000000a1','consult_link_sent','link sent') as c1_lead_created;
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','consult_booked','held');
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','contacted','late') as should_stay_consult_booked;
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','product_delivered','x');
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','reorder_due','x');
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','followup_active','loop back') as loop_ok;
update leads set stage='lost' where customer_id='00000000-0000-0000-0000-0000000000a2';
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','contacted','x') as lost_stays_lost;
select advance_lead_stage('00000000-0000-0000-0000-0000000000a2','reordered','paid') as lost_reopened;

-- 4. Jobs
insert into scheduled_jobs (kind, dedupe_key, run_at) values ('a','appt:1:r24',now()-interval '1s'),('b','appt:1:r1',now()-interval '1s'),('c','x',now()+interval '1h');
select count(*) as claimed_2 from claim_jobs(10);
select cancel_jobs('appt:1') as cancelled_0_since_running;

-- 5. Orders: total check, mark paid (credit consumed once), delivered, reorder carries remaining days
insert into orders (id, customer_id, source, subtotal_paise, consult_credit_paise, total_paise, supply_days)
values ('00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000a2','recommendation',1499900,50000,1449900,90);
insert into consult_credits (customer_id, appointment_id, amount_paise, expires_at, used_order_id)
select '00000000-0000-0000-0000-0000000000a2', id, 50000, now() + interval '7 days', '00000000-0000-0000-0000-0000000000f1'
  from appointments where customer_id = '00000000-0000-0000-0000-0000000000a2' and status = 'booked';
select mark_order_paid('00000000-0000-0000-0000-0000000000f1') as paid;
select mark_order_paid('00000000-0000-0000-0000-0000000000f1') as already_paid;
select count(*) as credit_consumed_1 from consult_credits where used_at is not null;
select plan_end_on as plan_end_2027_02_09 from mark_order_delivered('00000000-0000-0000-0000-0000000000f1','2026-11-10 20:00+00');
insert into orders (id, customer_id, source, parent_order_id, subtotal_paise, total_paise, supply_days, status)
values ('00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000a2','reorder','00000000-0000-0000-0000-0000000000f1',599900,599900,30,'paid');
select plan_end_on as reorder_end_2027_03_11 from mark_order_delivered('00000000-0000-0000-0000-0000000000f2','2027-02-04 06:00+00');
do $$ begin
  insert into orders (customer_id, source, subtotal_paise, total_paise) values ('00000000-0000-0000-0000-0000000000a2','shop',1000,999);
  raise exception 'TEST FAIL total check';
exception when check_violation then raise notice 'PASS total check'; end $$;

-- 6. RLS as customer c1
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
set request.jwt.claims = '{"aal":"aal1"}';
select count(*) as c1_sees_own_appts_2 from appointments;
select count(*) as c1_sees_customers_1 from customers;
select count(*) as c1_sees_leads_0 from leads;
select count(*) as c1_sees_plans_3 from plans;
do $$ begin update profiles set role='admin' where id = auth.uid(); raise exception 'TEST FAIL escalation';
exception when others then if sqlerrm <> 'ROLE_CHANGE_NOT_ALLOWED' then raise; end if; raise notice 'PASS role escalation blocked'; end $$;
do $$ begin update customers set phone = '+919999999999' where id = public.current_customer_id(); raise exception 'TEST FAIL phone change';
exception when others then if sqlerrm <> 'CUSTOMER_FIELD_LOCKED' then raise; end if; raise notice 'PASS customer cannot change phone'; end $$;

-- 7. RLS as sales
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000005a';
select count(*) as sales_sees_leads_2 from leads;
select set_lead_stage_manual((select id from leads where customer_id = '00000000-0000-0000-0000-0000000000a1'), 'interested', 'called') as manual_interested_ok;
select count(*) as sales_view_recommendations_0 from v_sales_recommendations;
select count(*) as sales_sees_consultations_0 from consultations;
select count(*) as sales_sees_intake_0 from intake_forms;
select count(*) as sales_sees_recommendations_base_0 from recommendations;
do $$ begin update customers set profile_id = auth.uid() where id = '00000000-0000-0000-0000-0000000000a1'; raise exception 'TEST FAIL hijack';
exception when others then if sqlerrm <> 'CUSTOMER_FIELD_LOCKED' then raise; end if; raise notice 'PASS sales cannot hijack customer'; end $$;
do $$ begin update leads set stage = 'payment_successful' where customer_id = '00000000-0000-0000-0000-0000000000a1';
  if found then raise exception 'TEST FAIL stage'; end if; raise notice 'PASS (no c1 lead row yet)';
exception when others then if sqlerrm <> 'STAGE_SET_BY_SYSTEM_ONLY' then raise; end if; raise notice 'PASS sales cannot set system stage'; end $$;
do $$ begin update leads set stage = 'contacted' where customer_id = '00000000-0000-0000-0000-0000000000a2'; raise exception 'TEST FAIL manual from reordered';
exception when others then if sqlerrm <> 'STAGE_SET_BY_SYSTEM_ONLY' then raise; end if; raise notice 'PASS manual stage blocked after purchase'; end $$;

-- 8. Doctor: aal1 sees nothing clinical, aal2 sees own appointments
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
select count(*) as doctor_aal1_sees_appts_0 from appointments;
set request.jwt.claims = '{"aal":"aal2"}';
select count(*) as doctor_aal2_sees_appts_3 from appointments;
select count(*) as doctor_sees_leads_0 from leads;
select count(*) as doctor_integrations_0 from doctor_integrations;
reset role;
reset request.jwt.claim.sub;   -- back to "service role" (no user)
reset request.jwt.claims;

-- 9. Deactivated staff cannot reactivate themselves
update profiles set is_active = false where id = '00000000-0000-0000-0000-00000000005a';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000005a';
set request.jwt.claims = '{"aal":"aal1"}';
select count(*) as deactivated_sales_sees_leads_0 from leads;
do $$ begin update profiles set is_active = true where id = auth.uid();
  raise exception 'TEST FAIL reactivated';
exception when others then if sqlerrm <> 'PROFILE_FIELD_LOCKED' then raise; end if; raise notice 'PASS deactivated user cannot reactivate'; end $$;
reset role;
reset request.jwt.claim.sub;
reset request.jwt.claims;

-- 10. Anonymous
set role anon;
select count(*) as anon_plans_3 from plans;
select count(*) as anon_customers_0 from customers;
select count(*) as anon_public_settings_6 from settings;
do $$ begin perform hold_slot('00000000-0000-0000-0000-0000000000dd','00000000-0000-0000-0000-0000000000a1','2026-11-04 05:00+00'); raise exception 'TEST FAIL anon exec';
exception when insufficient_privilege then raise notice 'PASS anon cannot call hold_slot'; end $$;
do $$ begin perform capture_payment('x', null, 'y', 1); raise exception 'TEST FAIL anon capture';
exception when insufficient_privilege then raise notice 'PASS anon cannot call capture_payment'; end $$;
reset role;
select count(*) as kpi_rows_90 from v_daily_kpis;
