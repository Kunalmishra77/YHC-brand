import type { Metadata } from 'next';
import Link from 'next/link';
import { IntakeForm } from '@/components/booking/intake-form';
import { SignInPrompt } from '@/components/booking/sign-in-prompt';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { Button } from '@/components/ui/button';
import { t } from '@/i18n/en';
import { formatIst } from '@/lib/time';
import { getDoctor } from '@/server/catalog';
import { db } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

export const metadata: Metadata = { title: 'Your hair profile', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function IntakePage({ params }: PageProps<'/book/intake/[appointmentId]'>) {
  const { appointmentId } = await params;
  const customer = await getCurrentCustomer();
  const doctor = getDoctor();

  if (!customer) {
    return (
      <div className="container-yhc py-12 md:py-20">
        <SignInPrompt
          title="Sign in to complete your hair profile"
          body="For your privacy, verify the mobile number you booked with. We'll bring you straight back here."
        />
      </div>
    );
  }

  const appt = db().appointments.find((a) => a.id === appointmentId && a.customerId === customer.id);
  if (!appt) {
    return (
      <div className="container-yhc py-12 md:py-20">
        <EmptyState
          title="We couldn't find this consultation"
          body="It may belong to a different mobile number. Check the link in your WhatsApp confirmation, or open your account."
          action={
            <Button asChild className="h-11">
              <Link href="/account">Go to your account</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (appt.status !== 'booked' && appt.status !== 'held') {
    return (
      <div className="container-yhc py-12 md:py-20">
        <EmptyState
          title="This consultation can no longer be updated"
          body={`Status: ${t(`status.appointment.${appt.status}`)}. If you need help, message us on WhatsApp.`}
          action={
            <Button asChild className="h-11">
              <Link href="/account">Go to your account</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const existing = db().intake.find((f) => f.appointmentId === appt.id);
  const when = formatIst(new Date(appt.startsAt));

  return (
    <div className="container-yhc py-8 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b border-line pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone={appt.status === 'booked' ? 'success' : 'pending'}>
              {t(`status.appointment.${appt.status}`)}
            </StatusChip>
            <span className="price text-sm text-muted-foreground">{appt.code}</span>
          </div>
          <p className="eyebrow mt-5">Your hair profile · about 3 minutes</p>
          <h1 className="display mt-2 text-[32px] text-balance md:text-[44px]">
            Help {doctor.name} prepare for you
          </h1>
          <p className="mt-3 max-w-2xl text-body">
            Your consultation is on <span className="font-medium text-ink">{when}</span>. Answer what you can
            — there are no wrong answers, and you can save and come back.
          </p>
        </header>
        <IntakeForm
          appointmentId={appt.id}
          when={when}
          joinHref={`/consult/${appt.id}`}
          doctorName={doctor.name}
          initial={
            existing
              ? {
                  duration: existing.duration,
                  pattern: existing.pattern,
                  previousTreatments: existing.previousTreatments,
                  currentProducts: existing.currentProducts,
                  medicalHistory: existing.medicalHistory,
                  medications: existing.medications,
                  allergies: existing.allergies,
                  familyHistory: existing.familyHistory,
                }
              : null
          }
          initialPhotos={appt.photosDone ? 3 : 0}
          alreadyDone={appt.intakeDone}
        />
      </div>
    </div>
  );
}
