import { CalendarClock, Video } from 'lucide-react';
import { formatINR } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * The booking "ticket": a dark, quiet summary that fills in as the customer moves through the flow.
 * Desktop: sticky side panel. Mobile: compact strip above the step.
 */
export function ConsultTicket({
  doctorName,
  qualifications,
  minutes,
  feePaise,
  when,
  status,
  creditNote,
  compact = false,
  className,
}: {
  doctorName: string;
  qualifications: string;
  minutes: number;
  feePaise: number;
  when: string | null;
  status?: React.ReactNode;
  creditNote: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={cn('bg-hero-dark rounded-lg px-4 py-3 text-on-dark', className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-on-dark-muted">
              {doctorName} · {minutes}-min video
            </p>
            <p className="truncate text-sm font-medium">{when ?? 'Choose a time below'}</p>
          </div>
          <p className="price shrink-0 text-base">{formatINR(feePaise)}</p>
        </div>
        {status ? <div className="mt-2">{status}</div> : null}
      </div>
    );
  }

  return (
    <aside
      aria-label="Your consultation"
      className={cn('bg-hero-dark overflow-hidden rounded-xl text-on-dark shadow-raised', className)}
    >
      <div className="px-6 pt-6 pb-5">
        <p className="text-[13px] tracking-[0.12em] text-brand-on-dark uppercase">Video consultation</p>
        <p className="display mt-3 text-[32px] text-on-dark">{doctorName}</p>
        <p className="mt-1 text-sm text-on-dark-muted">{qualifications}</p>
      </div>
      <div className="relative">
        <div className="mx-6 border-t border-dashed border-line-dark" />
        <span
          className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-pearl"
          aria-hidden
        />
        <span
          className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-pearl"
          aria-hidden
        />
      </div>
      <dl className="space-y-4 px-6 py-5 text-sm">
        <div className="flex gap-3">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-platinum" aria-hidden />
          <div>
            <dt className="text-on-dark-muted">When</dt>
            <dd className={cn('mt-0.5 font-medium', when ? 'text-on-dark' : 'text-on-dark-muted')}>
              {when ?? 'Choose a time'}
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <Video className="mt-0.5 size-4 shrink-0 text-platinum" aria-hidden />
          <div>
            <dt className="text-on-dark-muted">How</dt>
            <dd className="mt-0.5 text-on-dark">{minutes}-minute video call from your phone or laptop</dd>
          </div>
        </div>
      </dl>
      <div className="border-t border-line-dark bg-black/20 px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-on-dark-muted">Consultation fee</span>
          <span className="price text-2xl text-on-dark">{formatINR(feePaise)}</span>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-on-dark-muted">{creditNote}</p>
        {status ? <div className="mt-4">{status}</div> : null}
      </div>
    </aside>
  );
}
