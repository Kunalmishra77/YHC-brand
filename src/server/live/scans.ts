import 'server-only';

import { CAPTURE_ZONES, type CaptureZone } from '@/lib/journey/types';
import type { OutcomeReason, ScanOutcome } from '@/lib/scan/rules';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { audit } from './platform';

/*
 * Customer-side reads of their own scans (ADR-36). Photos are served by our own route
 * (/api/scan/photo/[scanId]/[zone]) — never as Supabase signed URLs, because *.supabase.co is
 * blocked by several Indian ISPs and the browser would show a broken image. Every read of
 * clinical data is audited ('clinical.view').
 */

/** Same-origin URL of one scan photo (the route checks the viewer owns the scan). */
export function photoPath(scanId: string, zone: CaptureZone): string {
  return `/api/scan/photo/${scanId}/${zone}`;
}

/** The JPEG bytes of one zone photo, only when the scan belongs to `customerId`. */
export async function readScanPhoto(customerId: string, scanId: string, zone: CaptureZone): Promise<Blob | null> {
  const admin = createSupabaseAdminClient();
  const { data: photo } = await admin
    .from('scan_photos')
    .select('storage_path')
    .eq('scan_id', scanId)
    .eq('customer_id', customerId)
    .eq('zone', zone)
    .maybeSingle();
  if (!photo) return null;
  const { data } = await admin.storage.from('clinical').download(photo.storage_path);
  return data ?? null;
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

export async function listScans(customerId: string): Promise<Omit<ScanView, 'zones'>[]> {
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

/** One scan with photos (signed URLs). `scanId` omitted: the latest submitted scan. */
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

  const { data: photos } = await admin
    .from('scan_photos')
    .select('zone, storage_path, quality, metrics')
    .eq('scan_id', scan.id);

  await audit({ actorId: viewer.id, actorRole: viewer.role, action: 'clinical.view', entity: 'scan', entityId: scan.id });

  const byZone = new Map((photos ?? []).map((p) => [p.zone, p]));
  const zones: ScanZoneView[] = CAPTURE_ZONES.flatMap((zone) => {
    const p = byZone.get(zone);
    if (!p) return [];
    const q = (p.quality ?? {}) as Record<string, unknown>;
    const m = (p.metrics ?? {}) as Record<string, unknown>;
    return [
      {
        zone,
        photoUrl: photoPath(scan.id, zone),
        ok: q.ok === true,
        cover: typeof m.cover === 'number' ? m.cover : null,
      },
    ];
  });
  return {
    id: scan.id,
    status: scan.status === 'submitted' ? 'submitted' : 'in_progress',
    outcome: scan.outcome,
    reasons: scan.outcome_reasons as OutcomeReason[],
    createdAt: scan.created_at,
    submittedAt: scan.submitted_at,
    zones,
  };
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
