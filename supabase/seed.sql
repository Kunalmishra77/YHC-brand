-- =============================================================================
-- Seed data (safe for every environment). Dev users/doctor are created by
-- `pnpm seed:dev` (scripts/seed-dev.ts) because they need auth.users rows.
-- =============================================================================

-- Settings (all tunable from Admin > Settings)
insert into public.settings (key, value, description) values
  ('consult.hold_minutes',            '10',            'Minutes a slot stays held while the customer pays'),
  ('consult.credit_enabled',          'true',          'Credit the consultation fee against the first plan'),
  ('consult.credit_window_days',      '7',             'Days after a completed consult in which the credit can be used'),
  ('consult.reminder_offsets_min',    '[1440, 60, 0]', 'Appointment reminders, minutes before start'),
  ('consult.intake_nudge_offsets_min','[1440, 180]',   'Remind to finish intake/photos, minutes before start'),
  ('consult.free_reschedule_hours',   '6',             'Free reschedule allowed until this many hours before start'),
  ('consult.sales_hold_minutes',      '240',           'Hold length when sales books on behalf and sends a pay link'),
  ('consult.follow_up_fee_no_plan_paise','50000',      'Follow-up consult fee without an active plan (pending D-P5)'),
  ('messaging.quiet_hours',           '{"start":"21:00","end":"09:00"}', 'No scheduled non-urgent messages in this IST window (user-triggered transactional messages are exempt)'),
  ('messaging.send_time_ist',         '"10:00"',       'Default IST time for scheduled reminders (refill, photo requests)'),
  ('care.checkin_time_ist',           '"10:30"',       'IST time for weekly care check-ins'),
  ('messaging.journeys',              '{"lead_welcome":true,"booking":true,"intake_reminders":true,"consult_reminders":true,"plan_ready":true,"plan_nudge":true,"order_updates":true,"care_checkins":true,"progress_photos":true,"refill":true,"followup_due":true,"guarantee_updates":true}', 'Journey on/off switches'),
  ('consult.cancel_full_refund_hours','24',            'Cancel at least this many hours before start for a full refund (pending client decision D-P4)'),
  ('consult.follow_up_fee_paise',     '0',             'Follow-up consult fee for customers with an active plan (pending D-P5)'),
  ('reorder.validity_days',           '180',           'Days a consultation stays valid for one-tap reorders (pending D-P6)'),
  ('sales.round_robin_pool',          '[]',            'Profile ids of sales users who receive new leads'),
  ('sales.working_hours',             '{"days":[1,2,3,4,5,6],"start":"09:30","end":"19:30"}', 'Sales working hours (IST); leads outside hours are assigned at next start'),
  ('business.legal_name',             '"[Legal entity name]"', 'Shown on invoices and legal pages'),
  ('business.address',                '"[Registered address]"', 'Shown on invoices and legal pages'),
  ('business.state',                  '"[State]"',     'Supplier state for GST place-of-supply'),
  ('business.grievance_officer',      '{"name":"[Name]","email":"[email]","phone":"[phone]"}', 'Required on site by e-commerce rules'),
  ('business.support_email',          '"care@yourhaircompany.com"', 'Support email (confirm)'),
  ('recommendation.link_ttl_hours',   '72',            'Plan payment link validity'),
  ('recommendation.nudge_after_hours','24',            'WhatsApp nudge if plan unpaid'),
  ('recommendation.task_after_hours', '48',            'Sales call task if plan still unpaid'),
  ('refill.reminder_days_before',     '[7, 4, 1]',     'Refill reminders before plan_end_on'),
  ('refill.sales_task_days_after',    '0',             'Create refill call task on/after plan end'),
  ('care.checkin_weeks',              '[1, 2, 3, 4]',  'Weekly WhatsApp check-ins after delivery'),
  ('sales.first_contact_sla_minutes', '15',            'Target time to first contact a new lead'),
  ('shipping.flat_fee_paise',         '0',             'Shipping charge per order'),
  ('guarantee.enabled',               'false',         'Turn on only after the guarantee policy is approved by Dr. Tyagi and counsel'),
  ('business.support_whatsapp',       '"+91XXXXXXXXXX"', 'Support WhatsApp number shown on site'),
  ('business.gstin',                  '"[GSTIN]"',     'Shown on invoices')
on conflict (key) do nothing;

-- Settings the public site may read with the anon key
update public.settings set is_public = true
 where key in ('business.support_whatsapp', 'business.support_email', 'business.legal_name', 'business.address',
               'business.grievance_officer', 'guarantee.enabled');

-- Treatment plans (approved pricing)
insert into public.plans (slug, name, months, price_paise, compare_at_paise, is_recommended, sort_order, description_md) values
  ('plan-1-month',  '1-month plan',  1,  599900, null,    false, 1, 'One month of your doctor-recommended routine.'),
  ('plan-2-months', '2-month plan',  2, 1099900, 1199800, false, 2, 'Two months. Saves ₹999 compared with buying monthly.'),
  ('plan-3-months', '3-month plan',  3, 1499900, 1799700, true,  3, 'Three months. Saves ₹2,998 compared with buying monthly. Doctor-recommended duration.')
on conflict (slug) do nothing;

-- Guarantee policy: DRAFT with placeholders. Not active. Fill in after Dr. Tyagi + counsel sign off.
insert into public.guarantee_policies
  (version, name, refund_percent, min_plan_months, claim_window_days, min_checkin_response_pct,
   require_monthly_photos, require_followup_consult, terms_md, is_active)
values
  (1, 'YHC Money-Back Guarantee v1 (DRAFT)', 100, 3, 30, 75, true, true,
   '[DRAFT — placeholders] If you follow your prescribed plan for [__] months, share monthly progress photos and attend your follow-up consultation, and see no visible improvement, you can claim a refund of [__%] of your plan payments within [__] days of finishing the plan. Full terms: [link].',
   false)
on conflict (version) do nothing;

-- WhatsApp / SMS / email template catalog. provider_template_name is filled once Meta approves each template.
insert into public.message_templates (key, channel, category, body_preview, variables, buttons) values
  ('lead_welcome',           'whatsapp', 'marketing',      'Hi {{1}}, thanks for reaching out to Your Hair Company. Book a video consultation with Dr. Tyagi or chat with our hair expert.', '["name"]', '[{"type":"url","text":"Book consultation"},{"type":"quick_reply","text":"Talk to an expert"}]'),
  ('consult_link',           'whatsapp', 'utility',        'Hi {{1}}, here is your link to book a consultation with Dr. Tyagi: {{2}}', '["name","booking_url"]', '[]'),
  ('booking_confirmed',      'whatsapp', 'utility',        'Your consultation is confirmed. {{1}} with Dr. Tyagi (Reg. No. {{6}}) on {{2}} at {{3}} IST. Appointment ID {{4}}. Payment of ₹{{5}} received.', '["name","date","time","appointment_code","amount","doctor_reg_no"]', '[{"type":"url","text":"Complete your hair profile"},{"type":"url","text":"Join consultation"}]'),
  ('intake_reminder',        'whatsapp', 'utility',        'Hi {{1}}, please complete your hair profile and upload scalp photos before your consultation on {{2}}.', '["name","date"]', '[{"type":"url","text":"Complete now"}]'),
  ('consult_reminder_24h',   'whatsapp', 'utility',        'Reminder: your consultation with Dr. Tyagi is tomorrow, {{1}} at {{2}} IST.', '["date","time"]', '[{"type":"url","text":"Join link"}]'),
  ('consult_reminder_1h',    'whatsapp', 'utility',        'Your consultation with Dr. Tyagi starts in 1 hour ({{1}} IST). Please join from a quiet, well-lit place.', '["time"]', '[{"type":"url","text":"Join consultation"}]'),
  ('consult_starting',       'whatsapp', 'utility',        'Dr. Tyagi is ready for your consultation now.', '[]', '[{"type":"url","text":"Join now"}]'),
  ('slot_lost_rebook',       'whatsapp', 'utility',        'Your payment of ₹{{1}} was received but the slot was taken while you were paying. Please pick a new time; your payment is kept for it.', '["amount"]', '[{"type":"url","text":"Pick a new time"}]'),
  ('plan_ready',             'whatsapp', 'utility',        'Hi {{1}}, Dr. Tyagi (Reg. No. {{2}}) has shared your personalised hair plan.', '["name","doctor_reg_no"]', '[{"type":"url","text":"View my plan","base":"/r/"}]'),
  ('plan_unpaid_nudge',      'whatsapp', 'utility',        'Your plan from Dr. Tyagi is ready. The link is valid until {{1}}.', '["expires_at"]', '[{"type":"url","text":"View my plan","base":"/r/"}]'),
  ('order_confirmed',        'whatsapp', 'utility',        'Order {{1}} confirmed. Amount paid ₹{{2}}. We will share tracking as soon as it ships.', '["order_code","amount"]', '[]'),
  ('order_shipped',          'whatsapp', 'utility',        'Your order {{1}} has shipped with {{2}}. Expected delivery: {{3}}.', '["order_code","courier","eta"]', '[{"type":"url","text":"Track order"}]'),
  ('order_delivered',        'whatsapp', 'utility',        'Your order {{1}} was delivered. Here is how to start your routine.', '["order_code"]', '[{"type":"url","text":"How to start"}]'),
  ('care_checkin',           'whatsapp', 'utility',        'Week {{1}} check-in: how is your routine going?', '["week_no"]', '[{"type":"quick_reply","text":"Going well"},{"type":"quick_reply","text":"I have a question"},{"type":"quick_reply","text":"Facing an issue"}]'),
  ('progress_photo_request', 'whatsapp', 'utility',        'Time for your monthly progress photos. They help Dr. Tyagi review your plan.', '[]', '[{"type":"url","text":"Upload photos"}]'),
  ('refill_reminder',        'whatsapp', 'utility',        'Your current plan ends around {{1}}. Continue your plan so there is no gap.', '["plan_end_date"]', '[{"type":"url","text":"Reorder"}]'),
  ('followup_consult_due',   'whatsapp', 'utility',        'It is time for your follow-up review with Dr. Tyagi.', '[]', '[{"type":"url","text":"Book follow-up"}]'),
  ('guarantee_claim_update', 'whatsapp', 'utility',        'Update on your guarantee claim {{1}}: {{2}}.', '["claim_id","status"]', '[]'),
  ('consult_pay_link',       'whatsapp', 'utility',        'Hi {{1}}, we have reserved {{2}} IST for your consultation with Dr. Tyagi. Please confirm and pay ₹{{3}} before {{4}} to keep the slot.', '["name","slot","amount","hold_until"]', '[{"type":"url","text":"Confirm & pay"}]'),
  ('appointment_rescheduled','whatsapp', 'utility',        'Your consultation is now on {{1}} at {{2}} IST. Appointment ID {{3}}.', '["date","time","appointment_code"]', '[{"type":"url","text":"Join consultation"}]'),
  ('appointment_cancelled',  'whatsapp', 'utility',        'Your consultation {{1}} has been cancelled. {{2}}', '["appointment_code","refund_note"]', '[{"type":"url","text":"Book again"}]'),
  ('consult_refund_processed','whatsapp','utility',        'A refund of ₹{{1}} for appointment {{2}} has been processed. It may take 5–7 working days to reach your account.', '["amount","appointment_code"]', '[]'),
  ('no_show_rebook',         'whatsapp', 'utility',        'We missed you at your consultation today. Would you like to pick a new time?', '[]', '[{"type":"url","text":"Pick a time"}]'),
  ('prescription_ready',     'whatsapp', 'utility',        'Your prescription from Dr. Tyagi (Reg. No. {{1}}) is ready.', '["doctor_reg_no"]', '[{"type":"url","text":"View prescription"}]'),
  ('order_out_for_delivery', 'whatsapp', 'utility',        'Your order {{1}} is out for delivery today.', '["order_code"]', '[{"type":"url","text":"Track order"}]'),
  ('reorder_needs_followup', 'whatsapp', 'utility',        'To continue your plan, Dr. Tyagi needs a quick follow-up review first.', '[]', '[{"type":"url","text":"Book follow-up"}]'),
  ('staff_side_effect_alert','whatsapp', 'utility',        'Care alert: patient {{1}} reported an issue in week {{2}} check-in. Open the portal to review.', '["patient_first_name","week_no"]', '[{"type":"url","text":"Open portal"}]'),
  ('otp_login',              'whatsapp', 'authentication', '{{1}} is your Your Hair Company verification code.', '["code"]', '[]'),
  ('otp_login_sms',          'sms',      'authentication', '{#var#} is your Your Hair Company verification code. Do not share it. - YHC', '["code"]', '[]'),
  ('booking_confirmed_sms',  'sms',      'utility',        'Consultation confirmed: {#var#} IST with Dr. Tyagi. ID {#var#}. Details: {#var#} - YHC', '["datetime","appointment_code","link"]', '[]'),
  ('consult_reminder_sms',   'sms',      'utility',        'Reminder: your YHC consultation is at {#var#} IST. Join: {#var#} - YHC', '["datetime","join_url"]', '[]'),
  ('plan_ready_sms',         'sms',      'utility',        'Dr. Tyagi has shared your hair plan. View: {#var#} - YHC', '["link"]', '[]'),
  ('order_shipped_sms',      'sms',      'utility',        'Order {#var#} shipped. Track: {#var#} - YHC', '["order_code","tracking_url"]', '[]'),
  ('booking_confirmed_email','email',    'utility',        'Consultation confirmed — {{date}} {{time}} IST', '["name","date","time","appointment_code","join_url"]', '[]'),
  ('prescription_ready_email','email',   'utility',        'Your prescription from Dr. Tyagi', '["name","link"]', '[]'),
  ('plan_ready_email',       'email',    'utility',        'Your personalised hair plan from Dr. Tyagi', '["name","link","expires_at"]', '[]'),
  ('order_confirmed_email',  'email',    'utility',        'Order {{order_code}} confirmed', '["name","order_code","amount","items"]', '[]'),
  ('order_shipped_email',    'email',    'utility',        'Your order {{order_code}} is on its way', '["name","order_code","courier","tracking_url"]', '[]'),
  ('guarantee_claim_email',  'email',    'utility',        'Your guarantee claim {{claim_id}}: {{status}}', '["name","claim_id","status","notes"]', '[]'),
  ('staff_invite_email',     'email',    'utility',        'You have been invited to the YHC portal', '["name","role","link"]', '[]')
on conflict (key) do nothing;

-- Starter FAQs (edit in Admin > Content; every medical answer to be reviewed by Dr. Tyagi)
insert into public.faqs (category, question, answer_md, sort_order) values
  ('consultation', 'How does the consultation work?', 'Pick a time, pay the ₹500 consultation fee, share a few details and scalp photos, then meet Dr. Tyagi on a 30-minute video call. You receive your personalised plan on WhatsApp after the call.', 1),
  ('consultation', 'Is the ₹500 adjusted if I buy a plan?', '[Confirm] Yes. If you buy your recommended plan within 7 days of your consultation, ₹500 is deducted from the plan price.', 2),
  ('plans',        'What do the plans cost?', '1 month ₹5,999 · 2 months ₹10,999 · 3 months ₹14,999. Prices include GST.', 3),
  ('guarantee',    'How does the money-back guarantee work?', '[Placeholder until terms are approved] Follow your plan as prescribed, share monthly progress photos and attend your follow-up. If there is no visible improvement, claim a refund under the published terms.', 4),
  ('delivery',     'How long does delivery take?', '[Confirm with logistics] Usually [__]–[__] working days after payment.', 5)
on conflict do nothing;
