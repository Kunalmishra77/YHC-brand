import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CAPTURE_ZONES } from '@/lib/journey/types';
import { toErrorBody } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import { readScanPhoto } from '@/server/live/scans';

/*
 * GET /api/scan/photo/[scanId]/[zone] — streams one of the signed-in customer's own scan photos
 * from the private bucket. Browsers never call Supabase directly (ISP block, ADR-36), so photos
 * go through our domain. Private, never cached by shared caches.
 */
const paramsSchema = z.object({ scanId: z.uuid(), zone: z.enum(CAPTURE_ZONES) });

export async function GET(_request: Request, ctx: RouteContext<'/api/scan/photo/[scanId]/[zone]'>) {
  try {
    const user = await requireRole(['customer']);
    const parsed = paramsSchema.safeParse(await ctx.params);
    if (!parsed.success || !user.customerId) return new NextResponse(null, { status: 404 });
    const photo = await readScanPhoto(user.customerId, parsed.data.scanId, parsed.data.zone);
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
