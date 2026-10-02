import {
  CalendarClock,
  Circle,
  IndianRupee,
  MessageCircle,
  Package,
  PhoneCall,
  Shuffle,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { MessageStatus } from '@/lib/domain/types';
import type { TimelineItem } from '@/server/sales/views';

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  call: PhoneCall,
  whatsapp: MessageCircle,
  note: StickyNote,
  stage_change: Shuffle,
  payment: IndianRupee,
  appointment: CalendarClock,
  order: Package,
  message: MessageCircle,
};

const MSG_TONE: Record<MessageStatus, ChipTone> = {
  queued: 'pending',
  sent: 'neutral',
  delivered: 'info',
  read: 'success',
  failed: 'danger',
  received: 'info',
};

/** Lead timeline — newest first; message rows show template + delivery status only (no bodies). */
export function LeadTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
      {items.map((item) => {
        const Icon = item.type === 'message' ? MessageCircle : (ACTIVITY_ICONS[item.kind] ?? Circle);
        return (
          <li key={`${item.type}-${item.id}`} className="relative flex gap-3">
            <span className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-card">
              <Icon className="size-4 text-steel" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              {item.type === 'activity' ? (
                <>
                  <p className={item.kind === 'payment' ? 'font-medium text-success' : 'text-ink'}>
                    {item.summary}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {item.actor} · {item.atLabel}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink">
                      {item.direction === 'inbound' ? 'Customer replied on WhatsApp' : `WhatsApp template `}
                      {item.direction === 'outbound' ? (
                        <code className="rounded bg-mist px-1.5 py-0.5 text-[12px] text-ink">
                          {item.template ?? 'session message'}
                        </code>
                      ) : null}
                    </p>
                    <StatusChip tone={MSG_TONE[item.status]}>{item.statusLabel}</StatusChip>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {item.direction === 'inbound' ? 'Message text visible to the doctor only · ' : ''}
                    {item.atLabel}
                  </p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
