import { ArrowDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IMAGES } from '@/lib/images';

/**
 * Product still-life hero (ADR-25): the obsidian stage is the one memorable element on the page;
 * one metallic light sweep, then stillness.
 */
export function HomeHero({
  bookLabel,
  slotMinutes,
  fee,
  creditNote,
  nextSlot,
  doctorName,
  registrationNo,
}: {
  bookLabel: string;
  slotMinutes: number;
  fee: string;
  creditNote: string | null;
  nextSlot: { label: string; remainingToday: number } | null;
  doctorName: string;
  registrationNo: string;
}) {
  return (
    <section className="sheen-sweep relative isolate overflow-hidden bg-obsidian text-on-dark">
      {/* Desktop: wide still life on the right, fading into obsidian */}
      <div className="absolute inset-y-0 right-0 hidden w-[72%] md:block" aria-hidden>
        <Image
          src={IMAGES.hero.src}
          alt=""
          fill
          priority
          sizes="72vw"
          className="object-cover object-[70%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
      </div>

      {/* Mobile: portrait still life above the copy */}
      <div className="relative aspect-[4/4.2] w-full md:hidden" aria-hidden>
        <Image
          src={IMAGES.heroPortrait.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_70%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
      </div>

      <div className="container-yhc relative">
        <div className="-mt-28 max-w-[34rem] pb-12 md:mt-0 md:flex md:min-h-[clamp(560px,calc(100svh-11rem),760px)] md:flex-col md:justify-center md:py-24">
          <p className="flex items-center gap-2 text-sm text-on-dark-muted">
            <span className="h-px w-8 bg-platinum/60" aria-hidden />
            Dermatologist-led hair care, across India
          </p>
          <h1 className="display mt-5 text-[clamp(2.75rem,1.6rem+4.6vw,5.5rem)] leading-[1.02] text-on-dark">
            Hair care,
            <br />
            prescribed.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-on-dark-muted">
            It starts with a {slotMinutes}-minute video consultation with {doctorName}. If treatment is right
            for you, you get a plan made for your pattern and history — delivered, and followed up.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-13 bg-[image:var(--yhc-silver)] px-7 text-base font-semibold text-obsidian shadow-[0_8px_30px_rgba(201,204,209,0.18)] hover:opacity-95"
            >
              <Link href="/book">{bookLabel}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 border-line-dark bg-white/[0.03] px-7 text-base text-on-dark backdrop-blur hover:bg-white/10 hover:text-on-dark"
            >
              <Link href="/assessment">Free hair assessment</Link>
            </Button>
          </div>

          {nextSlot ? (
            <Link
              href="/book"
              className="mt-6 inline-flex w-fit items-center gap-3 rounded-full border border-line-dark bg-ink-2/70 py-2 pr-4 pl-3 text-sm backdrop-blur transition-colors hover:border-steel"
            >
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[#5fb48a]" />
              </span>
              <span className="text-on-dark-muted">
                Next available: <span className="font-medium text-on-dark">{nextSlot.label}</span>
                {nextSlot.remainingToday > 0 && nextSlot.remainingToday <= 3
                  ? ` · ${nextSlot.remainingToday} left today`
                  : ''}
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Facts rail */}
      <div className="relative border-t border-line-dark/80 bg-obsidian/60 backdrop-blur">
        <dl className="container-yhc grid grid-cols-2 divide-line-dark md:grid-cols-4 md:divide-x">
          <Fact term={`${slotMinutes} min`} detail="one-to-one video consultation" />
          <Fact term={fee} detail={creditNote ?? 'consultation fee'} />
          <Fact term="Prescribed" detail="plans chosen for your pattern" />
          <Fact term={`Reg. No. ${registrationNo}`} detail={`${doctorName}, dermatologist`} small />
        </dl>
      </div>
      <a
        href="#concerns"
        className="absolute right-6 bottom-28 hidden size-11 items-center justify-center rounded-full border border-line-dark text-on-dark-muted hover:text-on-dark lg:flex"
        aria-label="Scroll to the next section"
      >
        <ArrowDown className="size-4" />
      </a>
    </section>
  );
}

function Fact({ term, detail, small }: { term: string; detail: string; small?: boolean }) {
  return (
    <div className="py-5 md:px-6 md:first:pl-0">
      <dt className={small ? 'price text-sm text-on-dark' : 'price text-xl text-on-dark'}>{term}</dt>
      <dd className="mt-1 text-[13px] leading-snug text-on-dark-muted">{detail}</dd>
    </div>
  );
}
