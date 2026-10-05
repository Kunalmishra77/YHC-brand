import { AlertTriangle, CheckCircle2, Circle, Clock, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChipTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';

const TONES: Record<ChipTone, { className: string; icon: LucideIcon }> = {
  success: { className: 'bg-success-bg text-success', icon: CheckCircle2 },
  warning: { className: 'bg-warning-bg text-warning', icon: AlertTriangle },
  danger: { className: 'bg-danger-bg text-danger', icon: XCircle },
  info: { className: 'bg-info-bg text-info', icon: Info },
  pending: { className: 'bg-mist text-ink', icon: Clock },
  neutral: { className: 'bg-mist text-body', icon: Circle },
};

/** Status always = colour + icon + words (docs/07 §5, WCAG: colour never the only signal). */
export function StatusChip({
  tone,
  children,
  className,
}: {
  tone: ChipTone;
  children: React.ReactNode;
  className?: string;
}) {
  const { className: toneClass, icon: Icon } = TONES[tone];
  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 align-middle text-[13px] leading-none font-medium whitespace-nowrap',
        toneClass,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate py-px">{children}</span>
    </span>
  );
}
