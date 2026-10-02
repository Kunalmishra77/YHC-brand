import Link from 'next/link';
import { cn } from '@/lib/utils';

// TODO(client): logo SVGs — see docs/12. Wordmark placeholder set in the display face.
export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <Link
      href="/"
      className={cn('inline-flex items-baseline gap-2 rounded-sm', className)}
      aria-label="Your Hair Company — home"
    >
      <span
        className={cn(
          'font-display text-[26px] leading-none font-medium tracking-tight',
          tone === 'light' ? 'text-on-dark' : 'text-ink',
        )}
      >
        Your Hair Company
      </span>
    </Link>
  );
}
