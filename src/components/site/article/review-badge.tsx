import { FileClock } from 'lucide-react';
import type { Article } from '@/server/content/types';
import { cn } from '@/lib/utils';

/**
 * FR-M1-4: articles publish only after Dr. Tyagi's medical review. Until then every card and page
 * says so plainly. Renders nothing once an article is marked `medically_reviewed`.
 * TODO(client): Dr. Tyagi's review of each article — see docs/12 (content)
 */
export function ReviewBadge({
  status,
  tone = 'light',
  className,
}: {
  status: Article['reviewStatus'];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  if (status !== 'pending_medical_review') return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none font-medium',
        tone === 'dark'
          ? 'border-white/20 bg-white/10 text-on-dark backdrop-blur'
          : 'border-warning/30 bg-warning-bg text-warning',
        className,
      )}
    >
      <FileClock className="size-3.5 shrink-0" aria-hidden />
      Draft — pending Dr. Tyagi&apos;s medical review
    </span>
  );
}
