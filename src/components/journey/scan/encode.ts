/*
 * Client-side photo handling for the scan (ADR-26 demo). Every capture is downscaled and re-encoded
 * on a canvas (which also drops EXIF/GPS) and kept only as a local blob preview — nothing is uploaded.
 */

const MAX_EDGE = 1280;

function encodeToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode_failed'))), 'image/jpeg', 0.8),
  );
}

/** Downscale + re-encode a video frame or a decoded bitmap. */
export async function reencode(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return encodeToBlob(canvas);
}

/** Decode a picked/taken photo file (respecting its orientation) and re-encode it. */
export async function reencodeFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return await reencode(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export function hasCamera(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
}
