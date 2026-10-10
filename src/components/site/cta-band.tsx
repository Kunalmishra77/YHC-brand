import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CTA_GHOST_DARK, CTA_SILVER, H2, SECTION_Y } from '@/components/site/section';
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
      <div className={`container-yhc ${SECTION_Y}`}>
        <div className="max-w-xl">
          <h2 className={`${H2} text-on-dark`}>{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-on-dark-muted">{body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild className={CTA_SILVER}>
              <Link href="/book">{bookLabel}</Link>
            </Button>
            <Button asChild variant="outline" className={CTA_GHOST_DARK}>
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
