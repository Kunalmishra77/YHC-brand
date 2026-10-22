import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SLOTS } from '@/lib/slots';

const SUGGESTIONS = [
  { href: '/concerns', label: 'Hair concerns' },
  { href: '/plans', label: 'Treatment plans' },
  { href: '/doctor-tyagi', label: 'Meet Dr. Tyagi' },
  { href: '/faqs', label: 'FAQs' },
];

export default function SiteNotFound() {
  return (
    <section className="container-yhc grid gap-10 py-20 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:py-28">
      <div>
      <p className="price text-sm text-muted-foreground">404</p>
      <h1 className="display mt-3 max-w-2xl text-[clamp(2.25rem,1.7rem+2.2vw,3.25rem)] text-balance">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-pretty text-body">
        The link may be old or mistyped. Start your free scan, or try one of these.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-12 px-6 text-base">
          <Link href="/start">Begin my free 3D scan</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 border-steel px-6 text-base">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
      <ul className="mt-10 max-w-md divide-y divide-line border-y border-line">
        {SUGGESTIONS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="flex min-h-12 items-center py-2 text-ink hover:text-brand">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
      </div>
      {SLOTS.E03.ready ? (
        <Image
          src={SLOTS.E03.src}
          width={SLOTS.E03.width}
          height={SLOTS.E03.height}
          alt=""
          sizes="(min-width: 768px) 40vw, 80vw"
          className="mx-auto w-full max-w-sm"
        />
      ) : null}
    </section>
  );
}
