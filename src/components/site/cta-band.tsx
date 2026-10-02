import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';

/** Closing call to action on dark — names the next step plainly. */
export function CtaBand({
  title = 'Start with a conversation, not a product.',
  body,
  bookLabel,
}: {
  title?: string;
  body: string;
  bookLabel: string;
}) {
  return (
    <section className="bg-obsidian text-on-dark">
      <div className="container-yhc grid gap-8 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-24">
        <div>
          <h2 className="display text-3xl text-on-dark">{title}</h2>
          <p className="mt-4 max-w-xl text-on-dark-muted">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
          <Button
            asChild
            className="h-12 bg-[image:var(--yhc-silver)] px-6 text-base text-obsidian hover:opacity-90"
          >
            <Link href="/book">{bookLabel}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 border-line-dark bg-transparent px-6 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
          >
            <a href={SITE.whatsappUrl}>
              <MessageCircle className="size-4" aria-hidden />
              Ask on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
