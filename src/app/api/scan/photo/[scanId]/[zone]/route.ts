import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CAPTURE_ZONES } from '@/lib/journey/types';
import { toErrorBody } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import { readScanPhoto, readScanPhotoForTeam } from '@/server/live/scans';

/*
 * GET /api/scan/photo/[scanId]/[zone] — streams one scan photo from the private bucket. Browsers
 * never call Supabase directly (ISP block, ADR-36), so photos go through our domain.
 * - customer: only their own scans;
 * - sales/admin: only scans the customer agreed to share with the hair-care team (ADR-37).
 * Private, never cached by shared caches.
 */
const paramsSchema = z.object({ scanId: z.uuid(), zone: z.enum(CAPTURE_ZONES) });

export async function GET(_request: Request, ctx: RouteContext<'/api/scan/photo/[scanId]/[zone]'>) {
  try {
    const user = await requireRole(['customer', 'sales', 'admin']);
    const parsed = paramsSchema.safeParse(await ctx.params);
    if (!parsed.success) return new NextResponse(null, { status: 404 });
    const { scanId, zone } = parsed.data;
    const photo =
      user.role === 'customer'
        ? user.customerId
          ? await readScanPhoto(user.customerId, scanId, zone)
          : null
        : await readScanPhotoForTeam(scanId, zone);
    if (!photo) return new NextResponse(null, { status: 404 });
    return new NextResponse(photo, {
      headers: {
        'content-type': 'image/jpeg',
        'cache-control': 'private, max-age=600',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (e) {
    const { error, status } = toErrorBody(e);
    return NextResponse.json({ error }, { status });
  }
}
