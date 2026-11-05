import 'server-only';

import type { z } from 'zod';
import type { Json } from '@/lib/database.types';
import { AppError } from '@/lib/errors';
import type { CaptureZone } from '@/lib/journey/types';
import { ANALYSIS_VERSION } from '@/lib/scan/analyse';
import { type ScanOutcome, type ZoneAnalysis, decideOutcome, parseScanRules } from '@/lib/scan/rules';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { beginScanSchema, startScanFormSchema, zoneAnalysisSchema } from '@/lib/validation/scan';
import { emitEvent, getLiveSetting } from './platform';

/*
 * Real patient journey v1 (ADR-36): email OTP → customer + lead → scan (photos in the private
 * `clinical` bucket) → outcome by `scan.rules` → the lead gets the outcome for the sales team.
 * Clinical data (answers, photos, per-zone numbers) never goes to logs, events or the lead.
 */

const BUCKET = 'clinical';
const CONSENT_VERSION = '2026-11-05';

type StartForm = z.output<typeof startScanFormSchema>;

export function maskEmail(email: string): string {
  const [user = '', domain = ''] = email.split('@');
  const shown = user.length <= 2 ? user.slice(0, 1) : `${user.slice(0, 2)}${'•'.repeat(Math.min(6, user.length - 2))}`;
  return `${shown}@${domain}`;
}

/** Sends the 6-digit email code (Supabase Auth over our SMTP). New emails get an account. */
export async function sendEmailCode(input: StartForm): Promise<{ sentTo: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: { shouldCreateUser: true, data: { full_name: input.name } },
  });
  if (error) {
    if (error.status === 429)
      throw new AppError('rate_limited', 'Please wait a minute before asking for a new code.', 429);
    throw new AppError('otp_send_failed', 'We could not send the code. Please check the email address.', 502);
  }
  return { sentTo: maskEmail(input.email) };
}

/**
 * Checks the code, then makes sure the customer row, consents and the lead exist. Returns the
 * customer id. The auth session cookies are set on our domain by the server client.
 */
export async function verifyEmailCode(
  input: StartForm & { code: string },
  ctx: { ip: string | null; userAgent: string | null; utm: Record<string, string> },
): Promise<{ customerId: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ email: input.email, token: input.code, type: 'email' });
  if (error || !data.user)
    throw new AppError('otp_invalid', 'That code does not match or has expired. Please try again.', 422);
  return onboardCustomer({ userId: data.user.id, ...input }, ctx);
}

async function onboardCustomer(
  input: { userId: string; name: string; email: string; mobile: string; age: number },
  ctx: { ip: string | null; userAgent: string | null; utm: Record<string, string> },
): Promise<{ customerId: string }> {
  const admin = createSupabaseAdminClient();
  const phone = `+91${input.mobile}`;

  const { data: profile } = await admin.from('profiles').select('role').eq('id', input.userId).maybeSingle();
  if (profile && profile.role !== 'customer')
    throw new AppError('staff_account', 'This email belongs to a staff account. Please use a personal email.', 409);
  await admin.from('profiles').update({ full_name: input.name, phone }).eq('id', input.userId);

  let customerId: string;
  const { data: own } = await admin.from('customers').select('id, phone').eq('profile_id', input.userId).maybeSingle();
  if (own) {
    customerId = own.id;
    const { error } = await admin
      .from('customers')
      .update({ full_name: input.name, email: input.email, age_years: input.age, phone, deleted_at: null })
      .eq('id', own.id);
    if (error?.code === '23505')
      throw new AppError('phone_in_use', 'This mobile number is already used with another email. Please use that email.', 409);
  } else {
    const { data: byPhone } = await admin.from('customers').select('id, profile_id').eq('phone', phone).maybeSingle();
    if (byPhone?.profile_id && byPhone.profile_id !== input.userId)
      throw new AppError('phone_in_use', 'This mobile number is already used with another email. Please use that email.', 409);
    if (byPhone) {
      customerId = byPhone.id;
      await admin
        .from('customers')
        .update({ profile_id: input.userId, full_name: input.name, email: input.email, age_years: input.age })
        .eq('id', byPhone.id);
    } else {
      const { data: created, error } = await admin
        .from('customers')
        .insert({
          profile_id: input.userId,
          phone,
          full_name: input.name,
          email: input.email,
          age_years: input.age,
          whatsapp_opt_in: true,
        })
        .select('id')
        .single();
      if (error || !created) throw new AppError('signup_failed', 'We could not save your details. Please try again.', 500);
      customerId = created.id;
    }
  }

  await admin.from('consents').insert([
    { customer_id: customerId, kind: 'privacy_policy', version: CONSENT_VERSION, granted: true, source: 'website', ip: ctx.ip, user_agent: ctx.userAgent },
    { customer_id: customerId, kind: 'whatsapp_utility', version: CONSENT_VERSION, granted: true, source: 'website', ip: ctx.ip, user_agent: ctx.userAgent },
  ]);

  const { data: lead } = await admin.from('leads').select('id').eq('customer_id', customerId).maybeSingle();
  if (!lead) {
    const { data: created } = await admin
      .from('leads')
      .insert({
        customer_id: customerId,
        stage: 'new',
        source: ctx.utm.utm_source ?? 'website',
        campaign: ctx.utm.utm_campaign ?? null,
        utm: ctx.utm,
      })
      .select('id')
      .single();
    if (created) {
      await admin
        .from('lead_activities')
        .insert({ lead_id: created.id, kind: 'system', body: 'Signed up on the website (email verified)' });
      await emitEvent('lead.created', 'lead', created.id, { source: 'website' });
    }
  }
  return { customerId };
}

// ---------------------------------------------------------------------------------------------
// Scan

export async function beginScan(
  customerId: string,
  input: z.output<typeof beginScanSchema>,
  ctx: { ip: string | null; userAgent: string | null },
): Promise<{ scanId: string }> {
  const admin = createSupabaseAdminClient();
  const { data: open } = await admin
    .from('scans')
    .select('id')
    .eq('customer_id', customerId)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  let scanId = open?.id;
  if (scanId) {
    await admin.from('scans').update({ answers: input.answers }).eq('id', scanId);
  } else {
    const { data: created, error } = await admin
      .from('scans')
      .insert({ customer_id: customerId, answers: input.answers })
      .select('id')
      .single();
    if (error || !created) throw new AppError('scan_failed', 'We could not start your scan. Please try again.', 500);
    scanId = created.id;
  }
  await admin.from('consents').insert({
    customer_id: customerId,
    kind: 'photo_clinical_use',
    version: CONSENT_VERSION,
    granted: true,
    source: 'website',
    ip: ctx.ip,
    user_agent: ctx.userAgent,
  });
  return { scanId };
}

async function openScan(customerId: string, scanId: string) {
  const { data } = await createSupabaseAdminClient()
    .from('scans')
    .select('id, status')
    .eq('id', scanId)
    .eq('customer_id', customerId)
    .maybeSingle();
  if (!data) throw new AppError('not_found', 'We could not find this scan.', 404);
  if (data.status !== 'in_progress') throw new AppError('scan_closed', 'This scan is already finished.', 409);
  return data;
}

export async function savePhoto(input: {
  customerId: string;
  scanId: string;
  zone: CaptureZone;
  bytes: ArrayBuffer;
  analysis: z.output<typeof zoneAnalysisSchema>;
}): Promise<void> {
  await openScan(input.customerId, input.scanId);
  const admin = createSupabaseAdminClient();
  const path = `scans/${input.customerId}/${input.scanId}/${input.zone}.jpg`;
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, input.bytes, { contentType: 'image/jpeg', upsert: true });
  if (upErr) throw new AppError('upload_failed', 'The photo did not upload. Please try again.', 502);
  const { quality, ...metrics } = input.analysis;
  const { error } = await admin.from('scan_photos').upsert(
    {
      scan_id: input.scanId,
      customer_id: input.customerId,
      zone: input.zone,
      storage_path: path,
      quality: { ...quality, ok: metrics.ok, issue: metrics.issue },
      metrics: { cover: metrics.cover, shine: metrics.shine, version: ANALYSIS_VERSION },
    },
    { onConflict: 'scan_id,zone' },
  );
  if (error) throw new AppError('upload_failed', 'The photo did not save. Please try again.', 500);
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export async function submitScan(customerId: string, scanId: string): Promise<{ outcome: ScanOutcome }> {
  await openScan(customerId, scanId);
  const admin = createSupabaseAdminClient();
  const [{ data: photos }, { data: scan }, { data: customer }, rulesRaw] = await Promise.all([
    admin.from('scan_photos').select('zone, quality, metrics').eq('scan_id', scanId),
    admin.from('scans').select('answers').eq('id', scanId).single(),
    admin.from('customers').select('age_years').eq('id', customerId).single(),
    getLiveSetting('scan.rules'),
  ]);
  const rules = parseScanRules(rulesRaw);
  if (!photos || photos.length < rules.minZones)
    throw new AppError('too_few_photos', `Please take at least ${rules.minZones} photos.`, 409);

  const zones: Partial<Record<CaptureZone, ZoneAnalysis>> = {};
  for (const p of photos) {
    const q = (p.quality ?? {}) as Record<string, unknown>;
    const m = (p.metrics ?? {}) as Record<string, unknown>;
    zones[p.zone as CaptureZone] = {
      ok: q.ok === true,
      issue: typeof q.issue === 'string' ? (q.issue as ZoneAnalysis['issue']) : null,
      cover: num(m.cover),
      shine: num(m.shine),
    };
  }
  const answers = (scan?.answers ?? {}) as Record<string, unknown>;
  const longBald = answers.longBald === 'large' || answers.longBald === 'small' ? answers.longBald : 'no';
  const { outcome, reasons } = decideOutcome({ age: customer?.age_years ?? 0, longBald, zones, rules });

  const { error } = await admin
    .from('scans')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      outcome,
      outcome_reasons: reasons,
      zones: zones as unknown as NonNullable<Json>,
      analysis_version: ANALYSIS_VERSION,
    })
    .eq('id', scanId)
    .eq('status', 'in_progress');
  if (error) throw new AppError('scan_failed', 'We could not finish your scan. Please try again.', 500);

  const { data: lead } = await admin.from('leads').select('id').eq('customer_id', customerId).maybeSingle();
  if (lead) {
    await admin.from('leads').update({ outcome, latest_scan_id: scanId }).eq('id', lead.id);
    await admin
      .from('lead_activities')
      .insert({ lead_id: lead.id, kind: 'system', body: `Scan finished: ${OUTCOME_LABEL[outcome]}`, meta: { outcome } });
  }
  await emitEvent('scan.submitted', 'scan', scanId, { outcome });
  return { outcome };
}

export const OUTCOME_LABEL: Record<ScanOutcome, string> = {
  eligible: 'Eligible',
  not_eligible: 'Not eligible',
  unclear: 'Needs a closer look',
};
