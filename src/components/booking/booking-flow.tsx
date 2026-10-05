'use client';

import { ArrowLeft, CalendarPlus, CheckCircle2, Loader2, Lock, MessageCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  appointmentStatusAction,
  applyKeptPaymentAction,
  hasKeptPaymentAction,
  holdSlotAction,
  payConsultationAction,
  refreshSlotsAction,
} from '@/app/(site)/book/actions';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/money';
import type { BookingDetails } from '@/lib/validation/booking';
import { ConsultTicket } from './consult-ticket';
import { ContinueBar } from './continue-bar';
import { Countdown } from './countdown';
import { DemoPaymentSheet } from './demo-payment-sheet';
import { DETAILS_FORM_ID, DetailsForm } from './details-form';
import { PhoneVerify } from './phone-verify';
import { SlotPicker } from './slot-picker';
import { Stepper } from './stepper';
import type { ConfirmedView, HoldView, SignedInView, SlotDayView } from './types';

export interface BookingFlowProps {
  initialDays: SlotDayView[];
  signedIn: SignedInView | null;
  doctor: { name: string; qualifications: string };
  feePaise: number;
  slotMinutes: number;
  holdMinutes: number;
  creditDays: number;
}

type Step = 0 | 1 | 2 | 3 | 4;

/** /book — slot first, then mobile + OTP, short form, pay, confirmed (FR-M3-1..8, ADR-10). */
export function BookingFlow(props: BookingFlowProps) {
  const { doctor, feePaise, slotMinutes, holdMinutes, creditDays } = props;
  const fee = formatINR(feePaise);
  const steps = ['Pick a time', 'Verify mobile', 'Your details', `Pay ${fee}`, 'Confirmed'] as const;

  const [step, setStep] = useState<Step>(0);
  const [days, setDays] = useState(props.initialDays);
  const [day, setDay] = useState(() => props.initialDays.find((d) => d.slots.length > 0)?.date ?? '');
  const [slot, setSlot] = useState<{ startsAt: string; label: string } | null>(null);
  const [signedIn, setSignedIn] = useState(props.signedIn);
  const [hold, setHold] = useState<HoldView | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [holdOver, setHoldOver] = useState(false);
  const [keptPayment, setKeptPayment] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [confirming, setConfirming] = useState<'waiting' | 'slow' | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedView | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the step heading so keyboard and screen-reader users land on the new step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step, confirming]);

  const reloadSlots = useCallback(async () => {
    const res = await refreshSlotsAction();
    if (res.ok) {
      setDays(res.data);
      setDay((cur) =>
        res.data.some((d) => d.date === cur && d.slots.length > 0)
          ? cur
          : (res.data.find((d) => d.slots.length > 0)?.date ?? cur),
      );
    }
  }, []);

  const backToSlots = useCallback(
    (message: string | null) => {
      setNotice(message);
      setSlot(null);
      setHold(null);
      setDeadline(null);
      setHoldOver(false);
      setStep(0);
      void reloadSlots();
    },
    [reloadSlots],
  );

  const submitDetails = (values: BookingDetails) => {
    if (!slot) {
      backToSlots('Please pick a time first.');
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const res = await holdSlotAction({
        ...values,
        age: String(values.age),
        startsAt: slot.startsAt,
      });
      if (!res.ok) {
        if (res.error.code === 'slot_taken') backToSlots(res.error.message);
        else if (res.error.code === 'unauthenticated' || res.error.code === 'forbidden') {
          setSignedIn(null);
          setStep(1);
        } else setFormError(res.error.message);
        return;
      }
      setHold(res.data);
      setDeadline(Date.now() + res.data.holdSecondsLeft * 1000);
      setHoldOver(res.data.holdSecondsLeft <= 0);
      setSignedIn((s) => (s ? { ...s, name: values.name, age: values.age } : s));
      const kept = await hasKeptPaymentAction();
      setKeptPayment(kept.ok && kept.data);
      setStep(3);
    });
  };

  // Poll the server until it says "booked" (FR-M2-6 style). Max 60 s, then reassure.
  useEffect(() => {
    if (confirming !== 'waiting' || !hold) return;
    let stopped = false;
    let tries = 0;
    const started = Date.now();
    const poll = async () => {
      if (stopped) return;
      tries += 1;
      const res = await appointmentStatusAction({ appointmentId: hold.appointmentId });
      if (stopped) return;
      if (res.ok && res.data.confirmed) {
        setConfirmed(res.data.confirmed);
        setConfirming(null);
        setStep(4);
        return;
      }
      if (Date.now() - started > 60_000) {
        setConfirming('slow');
        return;
      }
      window.setTimeout(poll, Math.min(800 + tries * 400, 3000));
    };
    const first = window.setTimeout(poll, 900);
    return () => {
      stopped = true;
      window.clearTimeout(first);
    };
  }, [confirming, hold]);

  const confirmPayment = async (): Promise<string | null> => {
    if (!hold) return 'Please pick a time again.';
    const res = await payConsultationAction({ appointmentId: hold.appointmentId });
    if (!res.ok) {
      if (res.error.code === 'slot_lost') {
        setPayOpen(false);
        setKeptPayment(true);
        backToSlots(res.error.message);
        return null;
      }
      return res.error.message;
    }
    setPayOpen(false);
    setConfirming('waiting');
    return null;
  };

  const confirmWithKept = () => {
    if (!hold) return;
    startTransition(async () => {
      const res = await applyKeptPaymentAction({ appointmentId: hold.appointmentId });
      if (!res.ok) {
        setFormError(res.error.message);
        setKeptPayment(false);
        return;
      }
      setKeptPayment(false);
      setConfirming('waiting');
    });
  };

  const when = confirmed?.when ?? hold?.when ?? (slot ? slot.label : null);
  const creditNote = `${fee} is credited against your first plan if bought within ${creditDays} days (pending confirmation).`;
  const ticketStatus =
    step === 4 ? (
      <StatusChip tone="success">Booked · {fee} paid</StatusChip>
    ) : step === 3 && hold && !holdOver ? (
      <StatusChip tone="pending">Held · awaiting payment</StatusChip>
    ) : null;

  return (
    <div className="container-yhc py-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <Stepper steps={steps} current={step} className="mb-6 md:mb-10" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <ConsultTicket
              compact
              className="mb-6 lg:hidden"
              doctorName={doctor.name}
              qualifications={doctor.qualifications}
              minutes={slotMinutes}
              feePaise={feePaise}
              when={when}
              status={ticketStatus}
              creditNote={creditNote}
            />

            {step === 0 ? (
              <section aria-labelledby="step-title">
                <StepHeading ref={headingRef} eyebrow="Book a consultation">
                  When would you like to speak with {doctor.name}?
                </StepHeading>
                <p className="mt-3 max-w-xl text-body">
                  Choose a time first — we&apos;ll hold it for {holdMinutes} minutes while you verify your
                  number and pay.
                </p>
                {notice ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-md border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning"
                  >
                    {notice}
                  </p>
                ) : null}
                {keptPayment ? (
                  <p className="mt-3 rounded-md bg-info-bg px-4 py-3 text-sm text-info">
                    Your {fee} payment is kept. Pick a new time and confirm — no second payment.
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
                <ContinueBar
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
                  <Button
                    className="h-12 px-6 text-base md:px-10"
                    disabled={!slot}
                    onClick={() => setStep(signedIn ? 2 : 1)}
                  >
                    Continue
                  </Button>
                </ContinueBar>
              </section>
            ) : null}

            {step === 1 ? (
              <section aria-labelledby="step-title">
                <BackLink onClick={() => setStep(0)}>Change time</BackLink>
                <StepHeading ref={headingRef} eyebrow="Verify your mobile">
                  Your number, so we can confirm your booking
                </StepHeading>
                <div className="mt-6 max-w-md">
                  <PhoneVerify
                    onVerified={(view) => {
                      setSignedIn(view);
                      setStep(2);
                    }}
                  />
                </div>
              </section>
            ) : null}

            {step === 2 && signedIn ? (
              <section aria-labelledby="step-title">
                <BackLink onClick={() => setStep(0)}>Change time</BackLink>
                <StepHeading ref={headingRef} eyebrow="Your details">
                  A few details for Dr. Tyagi
                </StepHeading>
                <p className="mt-3 text-sm text-muted-foreground">
                  Verified as <span className="price text-ink">{signedIn.maskedPhone}</span> ·{' '}
                  <button
                    type="button"
                    className="min-h-11 font-medium text-brand underline-offset-4 hover:underline"
                    onClick={() => {
                      setSignedIn(null);
                      setStep(1);
                    }}
                  >
                    Use a different number
                  </button>
                </p>
                <div className="mt-6">
                  <DetailsForm
                    defaults={{ name: signedIn.name, age: signedIn.age }}
                    onSubmit={submitDetails}
                    disabled={pending}
                    serverError={formError}
                  />
                </div>
                <ContinueBar
                  summary={
                    <>
                      <span className="block text-muted-foreground">Next</span>
                      <span className="font-medium text-ink">Hold time &amp; pay {fee}</span>
                    </>
                  }
                >
                  <Button
                    type="submit"
                    form={DETAILS_FORM_ID}
                    className="h-12 px-6 text-base md:px-10"
                    disabled={pending}
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                    ) : null}
                    Continue to payment
                  </Button>
                </ContinueBar>
              </section>
            ) : null}

            {step === 3 && hold ? (
              <section aria-labelledby="step-title">
                {confirming ? (
                  <ConfirmingPanel slow={confirming === 'slow'} headingRef={headingRef} />
                ) : holdOver && !payOpen ? (
                  <div>
                    <StepHeading ref={headingRef} eyebrow="Hold ended">
                      Your {holdMinutes}-minute hold has ended
                    </StepHeading>
                    <p className="mt-3 max-w-xl text-body">
                      The time was released so others could book it. Nothing was charged. Pick a time again —
                      it only takes a moment.
                    </p>
                    <Button className="mt-6 h-12 px-6 text-base" onClick={() => backToSlots(null)}>
                      <RotateCcw className="size-4" aria-hidden />
                      Pick a time again
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <BackLink onClick={() => setStep(2)}>Edit details</BackLink>
                      {deadline ? (
                        <Countdown
                          deadline={deadline}
                          // While the payment sheet is open the server decides (FR-M3-8); the panel waits.
                          onExpire={() => setHoldOver(true)}
                        />
                      ) : null}
                    </div>
                    <StepHeading ref={headingRef} eyebrow={keptPayment ? 'Confirm your new time' : 'Payment'}>
                      {keptPayment ? 'Confirm with your earlier payment' : `Pay ${fee} to confirm`}
                    </StepHeading>
                    <dl className="mt-6 divide-y divide-line rounded-lg border border-line bg-card">
                      <SummaryRow label="Doctor" value={`${doctor.name}, ${doctor.qualifications}`} />
                      <SummaryRow label="When" value={hold.when} />
                      <SummaryRow label="Consultation" value={`${slotMinutes}-minute video consultation`} />
                      <SummaryRow
                        label={keptPayment ? 'Already paid' : 'To pay now'}
                        value={<span className="price text-lg text-ink">{formatINR(hold.feePaise)}</span>}
                      />
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">{creditNote}</p>
                    <p aria-live="assertive" className="mt-3 min-h-5 text-sm text-danger">
                      {formError}
                    </p>
                    <ContinueBar
                      summary={
                        <>
                          <span className="block text-muted-foreground">{hold.when}</span>
                          <span className="price font-medium text-ink">{formatINR(hold.feePaise)}</span>
                        </>
                      }
                    >
                      {keptPayment ? (
                        <Button
                          className="h-12 px-6 text-base md:px-10"
                          disabled={pending}
                          onClick={confirmWithKept}
                        >
                          {pending ? (
                            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                          ) : null}
                          Confirm booking
                        </Button>
                      ) : (
                        <Button className="h-12 px-6 text-base md:px-10" onClick={() => setPayOpen(true)}>
                          <Lock className="size-4" aria-hidden />
                          Pay {formatINR(hold.feePaise)}
                        </Button>
                      )}
                    </ContinueBar>
                    <p className="mt-4 hidden text-[13px] text-muted-foreground md:block">
                      Secure payment by Razorpay · UPI, cards and netbanking. Your booking is confirmed only
                      after we receive the payment.
                    </p>
                  </div>
                )}
                <DemoPaymentSheet
                  open={payOpen}
                  onOpenChange={setPayOpen}
                  amountPaise={hold.feePaise}
                  description={`Video consultation · ${hold.when} · ${hold.code}`}
                  onConfirm={confirmPayment}
                />
              </section>
            ) : null}

            {step === 4 && confirmed ? (
              <ConfirmedPanel
                confirmed={confirmed}
                doctorName={doctor.name}
                minutes={slotMinutes}
                maskedPhone={signedIn?.maskedPhone ?? null}
                headingRef={headingRef}
              />
            ) : null}
          </div>

          <div className="hidden lg:block">
            <ConsultTicket
              className="sticky top-24"
              doctorName={doctor.name}
              qualifications={doctor.qualifications}
              minutes={slotMinutes}
              feePaise={feePaise}
              when={when}
              status={ticketStatus}
              creditNote={creditNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeading({
  eyebrow,
  children,
  ref,
}: {
  eyebrow: string;
  children: React.ReactNode;
  ref: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1
        id="step-title"
        ref={ref}
        tabIndex={-1}
        className="display mt-2 text-[32px] text-balance outline-none md:text-[40px]"
      >
        {children}
      </h1>
    </div>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium text-body hover:text-ink"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[15px] text-ink sm:text-right">{value}</dd>
    </div>
  );
}

function ConfirmingPanel({ slow, headingRef }: { slow: boolean; headingRef: React.Ref<HTMLHeadingElement> }) {
  return (
    <div className="py-6" aria-live="polite" aria-busy={!slow}>
      <StepHeading ref={headingRef} eyebrow="Payment received by Razorpay">
        Confirming payment…
      </StepHeading>
      {!slow ? (
        <div className="mt-6 flex items-center gap-3 text-body">
          <Loader2 className="size-5 animate-spin text-brand motion-reduce:animate-none" aria-hidden />
          <p>We&apos;re waiting for our server to confirm your payment. Please keep this page open.</p>
        </div>
      ) : (
        <p className="mt-6 max-w-xl text-body">
          This is taking longer than usual. Your slot stays reserved while we confirm — we&apos;ll message you
          on WhatsApp as soon as it&apos;s done. You won&apos;t be charged twice.
        </p>
      )}
    </div>
  );
}

function ConfirmedPanel({
  confirmed,
  doctorName,
  minutes,
  maskedPhone,
  headingRef,
}: {
  confirmed: ConfirmedView;
  doctorName: string;
  minutes: number;
  maskedPhone: string | null;
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  const downloadIcs = () => {
    const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const url = `${window.location.origin}/consult/${confirmed.appointmentId}`;
    // Neutral title only — no clinical details in calendar events (CLAUDE.md).
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Your Hair Company//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${confirmed.code}@yourhaircompany.com`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(confirmed.startsAt)}`,
      `DTEND:${stamp(confirmed.endsAt)}`,
      `SUMMARY:Video consultation · Your Hair Company`,
      `DESCRIPTION:Appointment ${confirmed.code}. Join here: ${url}`,
      `URL:${url}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = href;
    a.download = `yhc-consultation-${confirmed.code}.ics`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return (
    <section aria-labelledby="step-title">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-5" aria-hidden />
        <span className="text-sm font-medium">Booked · {formatINR(confirmed.feePaise)} paid</span>
      </div>
      <h1
        id="step-title"
        ref={headingRef}
        tabIndex={-1}
        className="display mt-3 text-[32px] text-balance outline-none md:text-[44px]"
      >
        Your consultation is confirmed.
      </h1>
      <p className="mt-3 text-lg text-ink">
        {confirmed.when} with {doctorName}
      </p>

      <dl className="mt-6 divide-y divide-line rounded-lg border border-line bg-card">
        <SummaryRow label="Appointment ID" value={<code className="price">{confirmed.code}</code>} />
        <SummaryRow
          label="Amount paid"
          value={
            <span className="price">
              {formatINR(confirmed.feePaise)} paid · {confirmed.paidAt}
            </span>
          }
        />
        {confirmed.paymentId ? (
          <SummaryRow
            label="Payment reference"
            value={<code className="text-sm">{confirmed.paymentId}</code>}
          />
        ) : null}
      </dl>

      <div className="mt-5 flex gap-3 rounded-lg bg-mist/60 px-4 py-3.5 text-sm text-body">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
        <p>
          We&apos;ve sent your confirmation on WhatsApp{maskedPhone ? ` to ${maskedPhone}` : ''}, with a
          reminder the day before and an hour before. Your video link is in your account and in those
          messages.
          <span className="text-muted-foreground"> (Demo: messages are logged, not sent.)</span>
        </p>
      </div>

      <button
        type="button"
        onClick={downloadIcs}
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand underline-offset-4 hover:underline"
      >
        <CalendarPlus className="size-4" aria-hidden />
        Add to your calendar (.ics)
      </button>

      <div className="mt-8 rounded-xl border border-line bg-card p-5 shadow-card md:p-6">
        <p className="eyebrow">Next step</p>
        <p className="mt-2 text-lg font-medium text-ink">Complete your hair profile — about 3 minutes</p>
        <p className="mt-1 text-sm text-body">
          A few questions and three scalp photos help {doctorName} make the most of your {minutes} minutes.
        </p>
        <Button asChild className="mt-5 h-12 w-full px-8 text-base sm:w-auto">
          <Link href={`/book/intake/${confirmed.appointmentId}`}>Complete your hair profile</Link>
        </Button>
      </div>
    </section>
  );
}
