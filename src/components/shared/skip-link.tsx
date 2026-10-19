import { t } from '@/i18n/en';
import { cn } from '@/lib/utils';

/**
 * WCAG 2.4.1 bypass block: the first focusable element of every layout. Hidden until it receives
 * keyboard focus, then jumps to the layout's `<main id="main" tabIndex={-1}>`.
 */
export function SkipLink({ targetId = 'main', className }: { targetId?: string; className?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-obsidian focus:px-5 focus:text-sm focus:font-medium focus:text-on-dark focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-white',
        className,
      )}
    >
      {t('common.skipToContent')}
    </a>
  );
}
