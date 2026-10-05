'use client';

import { Camera, CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { uploadProgressPhotosAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AngleId = 'front' | 'crown' | 'parting';

/**
 * FR-M4-5 guided upload — the same 3 angles every month.
 * Demo: previews stay in the browser; only the set is recorded on the server.
 * TODO(phase-04): client-side compression + signed upload URLs to the private photos bucket, with retry.
 */
export function PhotoUploader({
  angles,
  title,
}: {
  angles: readonly { id: AngleId; label: string; hint: string }[];
  title: string;
}) {
  const router = useRouter();
  const [previews, setPreviews] = useState<Partial<Record<AngleId, string>>>({});
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => {
    const created = urls.current;
    return () => created.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function pick(angle: AngleId, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a photo (JPG, PNG or HEIC).');
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    setPreviews((p) => ({ ...p, [angle]: url }));
  }

  const count = angles.filter((a) => previews[a.id]).length;

  function submit() {
    setError(null);
    start(async () => {
      const res = await uploadProgressPhotosAction({ angles: angles.map((a) => a.id) });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setDone(res.data.label);
      setPreviews({});
      toast.success(`${res.data.label} photos saved`, {
        description: 'Dr. Tyagi will compare them at your next review.',
      });
      router.refresh();
    });
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-6"
      >
        <CheckCircle2 className="size-6 text-success" aria-hidden />
        <p className="font-semibold text-ink">{done} photos saved</p>
        <p className="text-sm text-body">
          Thank you. They are private — only you and Dr. Tyagi can see them. We will remind you next month.
        </p>
        <Button variant="outline" className="h-11 px-5" onClick={() => setDone(null)}>
          Add another set
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-line/80 md:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-body">
        Natural daylight, dry hair, no hats or filters. Use the same spot each month so changes are easier to
        compare.
      </p>
      <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {angles.map((a, i) => {
          const src = previews[a.id];
          const inputId = `photo-${a.id}`;
          return (
            <li key={a.id} className="min-w-0">
              <label
                htmlFor={inputId}
                className={cn(
                  'relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed p-2 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand',
                  src ? 'border-transparent' : 'border-platinum bg-pearl hover:border-steel',
                )}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never optimised
                  <img
                    src={src}
                    alt={`${a.label} preview`}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <>
                    <Camera className="size-5 text-steel" aria-hidden />
                    <span className="text-[13px] leading-tight font-medium text-ink">
                      {i + 1}. {a.label}
                    </span>
                  </>
                )}
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => pick(a.id, e.target.files?.[0])}
                />
              </label>
              <p className="mt-1.5 hidden text-[12px] text-muted-foreground sm:block">{a.hint}</p>
              {src ? (
                <button
                  type="button"
                  onClick={() => document.getElementById(inputId)?.click()}
                  className="mt-1 inline-flex min-h-11 items-center gap-1 text-[13px] font-medium text-brand"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> Retake
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {count} of {angles.length} angles added
        </p>
        <Button
          className="h-12 px-6"
          disabled={count < angles.length || pending}
          onClick={submit}
          aria-busy={pending}
        >
          {pending ? 'Saving…' : 'Save photos'}
        </Button>
      </div>
    </div>
  );
}
