import type { Metadata } from 'next';
import Link from 'next/link';
import { ConsultPrejoin } from '@/components/booking/consult-prejoin';
import { SignInPrompt } from '@/components/booking/sign-in-prompt';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatIst } from '@/lib/time';
import { getDoctor } from '@/server/catalog';
import { db } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

export const metadata: Metadata = { title: 'Consultation room', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ConsultRoomPage({ params }: PageProps<'/consult/[appointmentId]'>) {
  const { appointmentId } = await params;
  const customer = await getCurrentCustomer();
  const doctor = getDoctor();

  if (!customer) {
    return (
      <div className="container-yhc py-12 md:py-20">
        <SignInPrompt
          tone="dark"
          title="Sign in to join your consultation"
          body="Verify the mobile number you booked with. Only you can enter your consultation room."
        />
      </div>
    );
  }

  const appt = db().appointments.find((a) => a.id === appointmentId && a.customerId === customer.id);
  if (!appt) {
    return (
      <Notice
        title="We couldn't find this consultation"
        body="It may belong to a different mobile number. Check the link in your WhatsApp reminder, or open your account."
      />
    );
  }

  const when = formatIst(new Date(appt.startsAt));
  if (appt.status === 'held') {
    return (
      <Notice
        title="This booking isn't confirmed yet"
        body={`Payment for ${when} hasn't reached us. If money left your account, message us on WhatsApp and we'll confirm it for you — otherwise pick a time again.`}
        cta={{ href: '/book', label: 'Book a time' }}
      />
    );
  }
  if (appt.status !== 'booked') {
    return (
      <Notice
        title={
          appt.status === 'completed' ? 'This consultation has ended' : 'This consultation is not active'
        }
        body={`${when} · ${t(`status.appointment.${appt.status}`)}. Your notes and plan appear in your account.`}
        cta={{ href: '/account', label: 'Go to your account' }}
      />
    );
  }

  return (
    <div className="container-yhc py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusChip tone="success">Booked · paid</StatusChip>
        <span className="price text-sm text-on-dark-muted">{appt.code}</span>
        {!appt.intakeDone ? (
          <Link
            href={`/book/intake/${appt.id}`}
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand-on-dark underline underline-offset-4"
          >
            Hair profile not done yet — complete it now
          </Link>
        ) : null}
      </div>
      <h1 className="display text-[32px] text-on-dark md:text-[44px]">
        Your consultation with {doctor.name}
      </h1>
      <p className="mt-2 mb-8 text-on-dark-muted">{when}</p>
      <ConsultPrejoin
        admitAt={formatIst(new Date(appt.startsAt), "h:mm aaa 'IST'")}
        doctorName={doctor.name}
        minutes={Math.round((Date.parse(appt.endsAt) - Date.parse(appt.startsAt)) / 60_000)}
      />
    </div>
  );
}

function Notice({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="container-yhc py-16 md:py-24">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="display text-[32px] text-on-dark md:text-[40px]">{title}</h1>
        <p className="mt-3 text-on-dark-muted">{body}</p>
        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-silver h-12 px-6 text-base text-obsidian hover:opacity-90">
            <Link href={cta?.href ?? '/account'}>{cta?.label ?? 'Go to your account'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
