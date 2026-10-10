import { ArrowRight, ArrowUpRight, Clock, Mail, MessageCircle, PenLine } from 'lucide-react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

const ROW =
  'group flex min-h-16 items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-mist focus-visible:bg-mist';

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

/** Direct ways to reach the team: WhatsApp, email, the contact page, and consultation hours. */
export function ChannelList() {
  return (
    <ul className="-mx-3 divide-y divide-line">
      <li>
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className={ROW}>
          <Badge strong>
            <MessageCircle className="size-5" />
          </Badge>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">WhatsApp</span>
            <span className="block text-sm text-muted-foreground">Usually the quickest way to reach us</span>
          </span>
          <ArrowUpRight
            className="size-4 shrink-0 text-steel transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden
          />
          <span className="sr-only">(opens WhatsApp in a new tab)</span>
        </a>
      </li>
      <li>
        <a href={`mailto:${SITE.supportEmail}`} className={ROW}>
          <Badge>
            <Mail className="size-5" />
          </Badge>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Email</span>
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
              A short form; we reply on WhatsApp or by phone
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-steel" aria-hidden />
        </Link>
      </li>
      <li className="flex min-h-16 items-center gap-4 px-3 py-3">
        <Badge>
          <Clock className="size-5" />
        </Badge>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">Consultation hours</span>
          {/* TODO(client): consultation and support hours — see docs/12 C */}
          <span className="block text-sm text-muted-foreground">To be confirmed</span>
        </span>
      </li>
    </ul>
  );
}
