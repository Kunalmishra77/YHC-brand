import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/lib/images';
import { SITE } from '@/lib/site';

/** Closing call to action on the obsidian stage — names the next step plainly. */
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
    <section className="relative isolate overflow-hidden bg-obsidian text-on-dark">
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 md:block" aria-hidden>
        <Image
          src={IMAGES.heroPortrait.src}
          alt=""
          fill
          sizes="50vw"
          className="object-cover object-[50%_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian to-transparent" />
      </div>
      <div className="container-yhc py-20 md:py-28">
        <div className="max-w-xl">
          <h2 className="display text-[clamp(2.25rem,1.6rem+2.6vw,3.5rem)] text-on-dark">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-on-dark-muted">{body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian hover:opacity-95"
            >
              <Link href="/book">{bookLabel}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-line-dark bg-transparent px-7 text-base text-on-dark hover:bg-graphite hover:text-on-dark"
            >
              <a href={SITE.whatsappUrl}>
                <MessageCircle className="size-4" aria-hidden />
                Ask on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
