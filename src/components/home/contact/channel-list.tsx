import { ArrowRight, ArrowUpRight, Clock, Mail, MessageCircle, PenLine } from 'lucide-react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

const ROW =
  'group flex min-h-14 items-center gap-4 rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-mist focus-visible:bg-mist';

function Badge({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full',
        strong ? 'bg-obsidian text-platinum' : 'bg-card text-ink ring-1 ring-line',
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

/** Direct ways to reach the team: WhatsApp (when set up), email, the contact form, and hours (when set). */
export function ChannelList() {
  return (
    <ul className="-mx-3 divide-y divide-line">
      {SITE.whatsappAvailable ? (
        <li>
          <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className={ROW}>
            <Badge strong>
              <MessageCircle className="size-5" />
            </Badge>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">WhatsApp</span>
              <span className="block text-sm text-muted-foreground">The quickest way to reach us</span>
            </span>
            <ArrowUpRight
              className="size-4 shrink-0 text-steel transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              aria-hidden
            />
            <span className="sr-only">(opens WhatsApp in a new tab)</span>
          </a>
        </li>
      ) : null}
      <li>
        <a href={`mailto:${SITE.supportEmail}`} className={ROW}>
          <Badge strong={!SITE.whatsappAvailable}>
            <Mail className="size-5" />
          </Badge>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Email us</span>
            <span className="block text-sm break-all text-muted-foreground">{SITE.supportEmail}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-steel" aria-hidden />
        </a>
      </li>
      <li>
        <Link href="/contact" className={ROW}>
          <Badge>
            <PenLine className="size-5" />
          </Badge>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Send a message</span>
            <span className="block text-sm text-muted-foreground">
              A short form. We will get back to you.
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-steel" aria-hidden />
        </Link>
      </li>
      {SITE.supportHours ? (
        <li className="flex min-h-14 items-center gap-4 px-3 py-2.5">
          <Badge>
            <Clock className="size-5" />
          </Badge>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Opening hours</span>
            <span className="block text-sm text-muted-foreground">{SITE.supportHours}</span>
          </span>
        </li>
      ) : null}
    </ul>
  );
}
