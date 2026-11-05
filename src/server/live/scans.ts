import 'server-only';

import type { Json } from '@/lib/database.types';
import { CAPTURE_ZONES, type CaptureZone } from '@/lib/journey/types';
import type { OutcomeReason, ScanOutcome } from '@/lib/scan/rules';
import { type AdminClient, createSupabaseAdminClient } from '@/lib/supabase/admin';
import { audit } from './platform';

/*
 * Reads of scans and scan photos (ADR-36, ADR-37).
 * - Photos are served by our own route (/api/scan/photo/[scanId]/[zone]) — never as Supabase signed
 *   URLs, because *.supabase.co is blocked by several Indian ISPs.
 * - The customer always sees their own scans. The sales team sees photos and answers of a scan only
 *   when the customer agreed to the team photo wording (consent version TEAM_PHOTO_CONSENT_VERSION)
 *   before that scan was finished (ADR-37). Older scans stay private, as promised at the time.
 * - Every read of clinical data is audited ('clinical.view').
 */

/** Photo consent wording that lets the hair-care (sales) team see the scan (ADR-37). */
export const TEAM_PHOTO_CONSENT_VERSION = '2026-11-06-team';

/** Same-origin URL of one scan photo (the route checks who may see it). */
export function photoPath(scanId: string, zone: CaptureZone): string {
  return `/api/scan/photo/${scanId}/${zone}`;
}

/**
 * True when one of the customer's photo consents uses the team wording, was granted, and was given
 * no later than `at` (the scan's finish time; an unfinished scan counts as "now").
 */
export function teamMaySee(
  consents: { version: string; granted: boolean; created_at: string }[],
  at: string | null,
): boolean {
  const limit = at ? Date.parse(at) : Number.POSITIVE_INFINITY;
  return consents.some(
    (c) => c.granted && c.version === TEAM_PHOTO_CONSENT_VERSION && Date.parse(c.created_at) <= limit,
  );
}

async function photoConsents(admin: AdminClient, customerId: string) {
  const { data } = await admin
    .from('consents')
    .select('version, granted, created_at')
    .eq('customer_id', customerId)
    .eq('kind', 'photo_clinical_use');
  return data ?? [];
}

async function download(admin: AdminClient, scanId: string, zone: CaptureZone, customerId?: string) {
  let query = admin.from('scan_photos').select('storage_path').eq('scan_id', scanId).eq('zone', zone);
  if (customerId) query = query.eq('customer_id', customerId);
  const { data: photo } = await query.maybeSingle();
  if (!photo) return null;
  const { data } = await admin.storage.from('clinical').download(photo.storage_path);
  return data ?? null;
}

/** The JPEG bytes of one zone photo, only when the scan belongs to `customerId`. */
export async function readScanPhoto(customerId: string, scanId: string, zone: CaptureZone): Promise<Blob | null> {
  return download(createSupabaseAdminClient(), scanId, zone, customerId);
}

/** The JPEG bytes for the sales team — only for scans the customer agreed to share (ADR-37). */
export async function readScanPhotoForTeam(scanId: string, zone: CaptureZone): Promise<Blob | null> {
  const admin = createSupabaseAdminClient();
  const { data: scan } = await admin.from('scans').select('customer_id, submitted_at').eq('id', scanId).maybeSingle();
  if (!scan) return null;
  if (!teamMaySee(await photoConsents(admin, scan.customer_id), scan.submitted_at)) return null;
  return download(admin, scanId, zone);
}

export interface ScanZoneView {
  zone: CaptureZone;
  photoUrl: string | null;
  ok: boolean;
  /** hair share in the centre of the photo, 0–1 */
  cover: number | null;
}

export interface ScanView {
  id: string;
  status: 'in_progress' | 'submitted';
  outcome: ScanOutcome | null;
  reasons: OutcomeReason[];
  createdAt: string;
  submittedAt: string | null;
  /** the sales team can see this scan's photos and answers (ADR-37) */
  teamVisible: boolean;
  zones: ScanZoneView[];
}

export interface CustomerView {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  age: number | null;
}

export async function getCustomer(customerId: string): Promise<CustomerView | null> {
  const { data } = await createSupabaseAdminClient()
    .from('customers')
    .select('id, full_name, phone, email, age_years')
    .eq('id', customerId)
    .is('deleted_at', null)
    .maybeSingle();
  return data
    ? { id: data.id, name: data.full_name ?? '', phone: data.phone, email: data.email, age: data.age_years }
    : null;
}

export async function listScans(customerId: string): Promise<Omit<ScanView, 'zones' | 'teamVisible'>[]> {
  const { data } = await createSupabaseAdminClient()
    .from('scans')
    .select('id, status, outcome, outcome_reasons, created_at, submitted_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []).map((s) => ({
    id: s.id,
    status: s.status === 'submitted' ? 'submitted' : 'in_progress',
    outcome: s.outcome,
    reasons: s.outcome_reasons as OutcomeReason[],
    createdAt: s.created_at,
    submittedAt: s.submitted_at,
  }));
}

async function zonesFor(admin: AdminClient, scanId: string, withPhotos: boolean): Promise<ScanZoneView[]> {
  const { data: photos } = await admin.from('scan_photos').select('zone, quality, metrics').eq('scan_id', scanId);
  const byZone = new Map((photos ?? []).map((p) => [p.zone, p]));
  return CAPTURE_ZONES.flatMap((zone) => {
    const p = byZone.get(zone);
    if (!p) return [];
    const q = (p.quality ?? {}) as Record<string, unknown>;
    const m = (p.metrics ?? {}) as Record<string, unknown>;
    return [
      {
        zone,
        photoUrl: withPhotos ? photoPath(scanId, zone) : null,
        ok: q.ok === true,
        cover: typeof m.cover === 'number' ? m.cover : null,
      },
    ];
  });
}

/** One scan with photos. `scanId` omitted: the latest submitted scan. */
export async function getScan(
  customerId: string,
  viewer: { id: string; role: 'customer' | 'admin' },
  scanId?: string,
): Promise<ScanView | null> {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from('scans')
    .select('id, status, outcome, outcome_reasons, created_at, submitted_at')
    .eq('customer_id', customerId);
  query = scanId ? query.eq('id', scanId) : query.eq('status', 'submitted');
  const { data: scan } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!scan) return null;

  const [zones, consents] = await Promise.all([zonesFor(admin, scan.id, true), photoConsents(admin, customerId)]);
  await audit({ actorId: viewer.id, actorRole: viewer.role, action: 'clinical.view', entity: 'scan', entityId: scan.id });
  return {
    id: scan.id,
    status: scan.status === 'submitted' ? 'submitted' : 'in_progress',
    outcome: scan.outcome,
    reasons: scan.outcome_reasons as OutcomeReason[],
    createdAt: scan.created_at,
    submittedAt: scan.submitted_at,
    teamVisible: teamMaySee(consents, scan.submitted_at),
    zones,
  };
}

export interface TeamScanView {
  id: string;
  outcome: ScanOutcome | null;
  reasons: OutcomeReason[];
  submittedAt: string | null;
  /** false: taken before the customer agreed to share photos — only the result is shown */
  visible: boolean;
  answers: Record<string, string> | null;
  zones: ScanZoneView[];
}

/**
 * The latest finished scan for the sales team (ADR-37). Photos, per-area notes and answers only
 * when the customer agreed to share them; otherwise just the result. The caller checks the role.
 */
export async function getScanForTeam(
  customerId: string,
  viewer: { id: string; role: 'sales' | 'admin' },
): Promise<{ latest: TeamScanView | null; finished: number }> {
  const admin = createSupabaseAdminClient();
  const [{ data: scans }, consents] = await Promise.all([
    admin
      .from('scans')
      .select('id, outcome, outcome_reasons, submitted_at, answers')
      .eq('customer_id', customerId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(20),
    photoConsents(admin, customerId),
  ]);
  const scan = scans?.[0];
  if (!scan) return { latest: null, finished: 0 };
  const visible = teamMaySee(consents, scan.submitted_at);
  const zones = visible ? await zonesFor(admin, scan.id, true) : [];
  if (visible)
    await audit({ actorId: viewer.id, actorRole: viewer.role, action: 'clinical.view', entity: 'scan', entityId: scan.id });
  return {
    finished: scans.length,
    latest: {
      id: scan.id,
      outcome: scan.outcome,
      reasons: scan.outcome_reasons as OutcomeReason[],
      submittedAt: scan.submitted_at,
      visible,
      answers: visible ? stringRecord(scan.answers) : null,
      zones,
    },
  };
}

function stringRecord(v: Json): Record<string, string> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  return Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => typeof e[1] === 'string'));
}

/** The open (in-progress) scan id, if the customer left mid-way. */
export async function openScanId(customerId: string): Promise<string | null> {
  const { data } = await createSupabaseAdminClient()
    .from('scans')
    .select('id')
    .eq('customer_id', customerId)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
