'use client';

import { ArrowLeft, CheckCircle2, Loader2, Lock, RotateCcw, Video } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState, useTransition } from 'react';
import { journeyHoldAction, journeyPayAction, journeySlotsAction } from '@/app/(site)/start/actions';
import { ContinueBar } from '@/components/booking/continue-bar';
import { Countdown } from '@/components/booking/countdown';
import { DemoPaymentSheet } from '@/components/booking/demo-payment-sheet';
import { SlotPicker } from '@/components/booking/slot-picker';
import type { ConfirmedView, HoldView, SlotDayView } from '@/components/booking/types';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';

/** Step 5 — pick a time, hold it, pay the consultation fee (demo Razorpay), confirmed (ADR-26). */
export function JourneyBooking({
  initialDays,
  doctor,
  feePaise,
  slotMinutes,
  holdMinutes,
  creditDays,
  initialConfirmed,
}: {
  initialDays: SlotDayView[];
  doctor: { name: string; qualifications: string };
  feePaise: number;
  slotMinutes: number;
  holdMinutes: number;
  creditDays: number;
  initialConfirmed: ConfirmedView | null;
}) {
  const fee = formatINR(feePaise);
  const [days, setDays] = useState(initialDays);
  const [day, setDay] = useState(() => initialDays.find((d) => d.slots.length > 0)?.date ?? '');
  const [slot, setSlot] = useState<{ startsAt: string; label: string } | null>(null);
  const [hold, setHold] = useState<HoldView | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [holdOver, setHoldOver] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedView | null>(initialConfirmed);
  const [pending, startTransition] = useTransition();

  const backToSlots = useCallback(async (message: string | null) => {
    setNotice(message);
    setHold(null);
    setSlot(null);
    setDeadline(null);
    setHoldOver(false);
    const res = await journeySlotsAction();
    if (res.ok) {
      setDays(res.data);
      setDay((cur) =>
        res.data.some((d) => d.date === cur && d.slots.length > 0)
          ? cur
          : (res.data.find((d) => d.slots.length > 0)?.date ?? cur),
      );
    }
  }, []);

  const holdTime = () => {
    if (!slot) return;
    setNotice(null);
    startTransition(async () => {
      const res = await journeyHoldAction({ startsAt: slot.startsAt });
      if (!res.ok) {
        if (res.error.code === 'slot_taken') await backToSlots(res.error.message);
        else setNotice(res.error.message);
        return;
      }
      setHold(res.data);
      setDeadline(Date.now() + res.data.holdSecondsLeft * 1000);
      setHoldOver(res.data.holdSecondsLeft <= 0);
      window.scrollTo({ top: 0 });
    });
  };

  const pay = async (): Promise<string | null> => {
    if (!hold) return 'Please pick a time again.';
    const res = await journeyPayAction({ appointmentId: hold.appointmentId });
    if (!res.ok) {
      if (res.error.code === 'slot_lost') {
        setPayOpen(false);
        await backToSlots(res.error.message);
        return null;
      }
      return res.error.message;
    }
    setPayOpen(false);
    setConfirmed(res.data);
    window.scrollTo({ top: 0 });
    return null;
  };

  if (confirmed) return <Confirmed confirmed={confirmed} doctorName={doctor.name} minutes={slotMinutes} />;

  if (hold) {
    return (
      <section aria-labelledby="pay-title" className="max-w-2xl">
        {holdOver && !payOpen ? (
          <div>
            <h2 id="pay-title" className="display text-[clamp(1.75rem,1.4rem+1.4vw,2.375rem)] text-balance">
              Your {holdMinutes}-minute hold has ended
            </h2>
            <p className="mt-3 text-body">
              The time was released so others could book it. Nothing was charged.
            </p>
            <Button className="mt-6 h-12 px-6 text-base" onClick={() => void backToSlots(null)}>
              <RotateCcw className="size-4" aria-hidden />
              Pick a time again
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void backToSlots(null)}
                className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium text-body hover:text-ink"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Change time
              </button>
              {deadline ? <Countdown deadline={deadline} onExpire={() => setHoldOver(true)} /> : null}
            </div>
            <h2
              id="pay-title"
              className="display mt-3 text-[clamp(1.75rem,1.4rem+1.4vw,2.375rem)] text-balance"
            >
              Pay {fee} to confirm
            </h2>
            <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
              <Row label="Doctor" value={`${doctor.name}, ${doctor.qualifications}`} />
              <Row label="When" value={hold.when} />
              <Row label="Consultation" value={`${slotMinutes}-minute video consultation`} />
              <Row
                label="To pay now"
                value={<span className="price text-lg text-ink">{formatINR(hold.feePaise)}</span>}
              />
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              {fee} is credited against your first plan if bought within {creditDays} days (pending
              confirmation).
            </p>
            <ContinueBar
              summary={
                <>
                  <span className="block text-muted-foreground">{hold.when}</span>
                  <span className="price font-medium text-ink">{formatINR(hold.feePaise)}</span>
                </>
              }
            >
              <Button className="h-12 px-6 text-base md:px-10" onClick={() => setPayOpen(true)}>
                <Lock className="size-4" aria-hidden />
                Pay {formatINR(hold.feePaise)}
              </Button>
            </ContinueBar>
          </div>
        )}
        <DemoPaymentSheet
          open={payOpen}
          onOpenChange={setPayOpen}
          amountPaise={hold.feePaise}
          description={`Video consultation · ${hold.when} · ${hold.code}`}
          onConfirm={pay}
        />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="slot-title"
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12"
    >
      <div className="min-w-0">
        <h2 id="slot-title" className="display text-[clamp(1.75rem,1.4rem+1.4vw,2.375rem)] text-balance">
          When would you like to speak with {doctor.name}?
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-body">
          Choose a time — we hold it for {holdMinutes} minutes while you pay the {fee} consultation fee.
        </p>
        {notice ? (
          <p
            role="alert"
            className="mt-5 rounded-md border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning"
          >
            {notice}
          </p>
        ) : null}
        <div className="mt-6">
          <SlotPicker
            days={days}
            day={day}
            onDayChange={setDay}
            selected={slot?.startsAt ?? null}
            onSelect={(s, date) => {
              const d = days.find((x) => x.date === date);
              setSlot({ startsAt: s.startsAt, label: `${d?.tab ?? ''}, ${s.time} IST` });
              setNotice(null);
            }}
          />
        </div>
      </div>

      {/* Desktop summary — the mobile/tablet equivalent is the ContinueBar below. */}
      <aside
        aria-label="Your consultation"
        className="hidden self-start rounded-2xl border border-line bg-pearl p-6 lg:sticky lg:top-24 lg:block"
      >
        <p className="text-[13px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Your consultation
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Doctor</dt>
            <dd className="mt-0.5 font-medium text-ink">{doctor.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Format</dt>
            <dd className="mt-0.5 text-ink">{slotMinutes}-minute video call</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="mt-0.5 font-medium text-ink">{slot ? slot.label : 'Not chosen yet'}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm text-body">Consultation fee</span>
          <span className="price text-lg text-ink">{fee}</span>
        </div>
        <Button className="mt-5 h-12 w-full text-base" disabled={!slot || pending} onClick={holdTime}>
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Hold time &amp; pay {fee}
        </Button>
        <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
          {fee} is credited against your first plan if bought within {creditDays} days (pending confirmation).
        </p>
      </aside>

      <ContinueBar
        className="lg:hidden"
        summary={
          slot ? (
            <>
              <span className="block text-muted-foreground">Selected</span>
              <span className="font-medium text-ink">{slot.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choose a time to continue</span>
          )
        }
      >
        <Button className="h-12 px-6 text-base md:px-10" disabled={!slot || pending} onClick={holdTime}>
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Hold time &amp; pay {fee}
        </Button>
      </ContinueBar>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[15px] text-ink sm:text-right">{value}</dd>
    </div>
  );
}

function Confirmed({
  confirmed,
  doctorName,
  minutes,
}: {
  confirmed: ConfirmedView;
  doctorName: string;
  minutes: number;
}) {
  return (
    <section aria-labelledby="done-title" className="max-w-2xl">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-5" aria-hidden />
        <span className="text-sm font-medium">Booked · {formatINR(confirmed.feePaise)} paid</span>
      </div>
      <h2 id="done-title" className="display mt-3 text-[clamp(2rem,1.5rem+1.8vw,2.75rem)] text-balance">
        Your consultation is confirmed.
      </h2>
      <p className="mt-3 text-lg text-ink">
        {confirmed.when} with {doctorName}
      </p>
      <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        <Row label="Appointment ID" value={<code className="price">{confirmed.code}</code>} />
        <Row
          label="Amount paid"
          value={
            <span className="price">
              {formatINR(confirmed.feePaise)} · {confirmed.paidAt}
            </span>
          }
        />
        {confirmed.paymentId ? (
          <Row label="Payment reference" value={<code className="text-sm">{confirmed.paymentId}</code>} />
        ) : null}
        <Row label="Shared with the doctor" value="Your 3D scan assessment and health form" />
      </dl>
      <div className="bg-hero-dark mt-8 rounded-2xl p-6 text-on-dark">
        <div className="flex items-start gap-3">
          <Video className="mt-1 size-5 shrink-0 text-platinum" aria-hidden />
          <div>
            <p className="font-medium">What happens next</p>
            <ul className="mt-2 space-y-1.5 text-sm text-on-dark-muted">
              <li>Your patient portal shows your journey, scan and appointment.</li>
              <li>
                The &quot;Join consultation&quot; button opens 15 minutes before your {minutes}-minute slot.
              </li>
              <li>We will remind you on WhatsApp the day before. (Demo: messages are logged, not sent.)</li>
            </ul>
            <Button asChild className="bg-silver mt-5 h-12 px-6 text-base text-obsidian hover:opacity-90">
              <Link href="/account">Go to my patient portal</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
