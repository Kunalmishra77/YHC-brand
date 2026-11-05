import { NextResponse } from 'next/server';
import { AppError, toErrorBody } from '@/lib/errors';
import { requireRole } from '@/lib/rbac';
import { MAX_PHOTO_BYTES, photoMetaSchema } from '@/lib/validation/scan';
import { savePhoto } from '@/server/live/journey';

/*
 * POST /api/scan/photo — one scan photo (multipart: scanId, zone, analysis JSON, file). The browser
 * sends it to our server, which stores it in the private bucket (browsers never call Supabase —
 * ADR-36). JPEG only, re-encoded on the device (no EXIF/GPS).
 */
export async function POST(request: Request) {
  try {
    const user = await requireRole(['customer']);
    if (!user.customerId) throw new AppError('unauthenticated', 'Please start again with your details.', 401);
    const form = await request.formData();
    const meta = photoMetaSchema.parse({
      scanId: form.get('scanId'),
      zone: form.get('zone'),
      analysis: form.get('analysis'),
    });
    const file = form.get('file');
    if (!(file instanceof Blob)) throw new AppError('no_file', 'No photo was received.', 400);
    if (file.size > MAX_PHOTO_BYTES) throw new AppError('too_large', 'This photo is too large.', 413);
    const bytes = await file.arrayBuffer();
    const head = new Uint8Array(bytes.slice(0, 3));
    if (head[0] !== 0xff || head[1] !== 0xd8 || head[2] !== 0xff)
      throw new AppError('bad_type', 'Please send a JPEG photo.', 415);
    await savePhoto({ customerId: user.customerId, scanId: meta.scanId, zone: meta.zone, bytes, analysis: meta.analysis });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError')
      return NextResponse.json({ error: { code: 'invalid_input', message: 'Bad photo data.' } }, { status: 400 });
    const { error, status } = toErrorBody(e);
    return NextResponse.json({ error }, { status });
  }
}
