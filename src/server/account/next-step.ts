import 'server-only';

import { addDays, differenceInCalendarDays } from 'date-fns';

/*
 * FR-M4-2: the single "next step" on the account overview. PURE — derived from state, in priority:
 * intake pending → join consultation → this month's photos → reorder → follow-up due.
 */

export type NextStepKind = 'intake' | 'join' | 'photos' | 'reorder' | 'followup' | 'book' | 'on_track';

export interface NextStep {
  kind: NextStepKind;
  title: string;
  body: string;
  cta: { label: string; href: string } | null;
}

export interface NextStepInput {
  now: Date;
  today: string; // IST date
  upcoming: {
    id: string;
    startsAt: string;
    endsAt: string;
    intakeDone: boolean;
    whenLabel: string;
  }[];
  /** active delivered plan, if any */
  plan: { orderId: string; deliveredOn: string; planEndOn: string; orderCode: string } | null;
  /** true when a newer plan order already exists (paid / on its way) */
  hasNewerPlanOrder: boolean;
  photoDates: string[]; // IST dates
  /** IST date the follow-up is due (last consult + followUpInWeeks), if one is pending */
  followUpDueOn: string | null;
  hasAnyConsult: boolean;
  joinWindowMinutes: number;
  reorderWindowDays: number;
  readableDate: (ymd: string) => string;
  links: {
    intake: (id: string) => string;
    join: (id: string) => string;
    photos: string;
    order: (id: string) => string;
    book: string;
  };
}

const d = (ymd: string) => new Date(`${ymd}T00:00:00Z`);

export function deriveNextStep(i: NextStepInput): NextStep {
  const soonest = [...i.upcoming].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const needsIntake = soonest.find((a) => !a.intakeDone);
  if (needsIntake) {
    return {
      kind: 'intake',
      title: 'Complete your hair profile',
      body: `Dr. Tyagi reads it before your consultation on ${needsIntake.whenLabel}. It takes about 3 minutes, plus 3 scalp photos.`,
      cta: { label: 'Complete hair profile', href: i.links.intake(needsIntake.id) },
    };
  }

  const joinable = soonest.find((a) => {
    const opensAt = new Date(a.startsAt).getTime() - i.joinWindowMinutes * 60_000;
    return i.now.getTime() >= opensAt && i.now.getTime() <= new Date(a.endsAt).getTime();
  });
  if (joinable) {
    return {
      kind: 'join',
      title: 'Your consultation is starting',
      body: `Dr. Tyagi will see you at ${joinable.whenLabel}. Find a quiet, well-lit spot and allow camera and microphone.`,
      cta: { label: 'Join consultation', href: i.links.join(joinable.id) },
    };
  }

  if (i.plan) {
    const offset = differenceInCalendarDays(d(i.today), d(i.plan.deliveredOn));
    const month = offset <= 30 ? 0 : Math.ceil(offset / 30) - 1;
    const windowStart = month === 0 ? 0 : month * 30 + 1;
    const windowEnd = (month + 1) * 30;
    const hasPhoto = i.photoDates.some((p) => {
      const o = differenceInCalendarDays(d(p), d(i.plan?.deliveredOn ?? p));
      return o >= windowStart && o <= windowEnd;
    });
    const daysLeft = differenceInCalendarDays(d(i.plan.planEndOn), d(i.today));
    if (!hasPhoto && daysLeft >= 0) {
      const due = addDays(d(i.plan.deliveredOn), windowEnd).toISOString().slice(0, 10);
      return {
        kind: 'photos',
        title: `Upload your month ${month + 1} progress photos`,
        body: `Same 3 angles as before — front hairline, crown and parting. Due by ${i.readableDate(due)}. Only Dr. Tyagi and you can see them.`,
        cta: { label: "Upload this month's photos", href: i.links.photos },
      };
    }
    if (daysLeft <= i.reorderWindowDays && !i.hasNewerPlanOrder) {
      return {
        kind: 'reorder',
        title: daysLeft >= 0 ? 'Continue your plan without a gap' : 'Your plan has finished',
        body:
          daysLeft >= 0
            ? `Your current plan ends on ${i.readableDate(i.plan.planEndOn)}. Reorder the same plan to the same address in one tap.`
            : `Your plan ended on ${i.readableDate(i.plan.planEndOn)}. Reorder to continue your routine.`,
        cta: { label: 'Reorder my plan', href: i.links.order(i.plan.orderCode) },
      };
    }
  }

  if (i.followUpDueOn && soonest.length === 0) {
    const daysToDue = differenceInCalendarDays(d(i.followUpDueOn), d(i.today));
    if (daysToDue <= 14) {
      return {
        kind: 'followup',
        title: daysToDue < 0 ? 'Your follow-up is overdue' : 'Your follow-up consultation is due',
        body: `Dr. Tyagi asked to review your progress around ${i.readableDate(i.followUpDueOn)}. Pick a time that suits you.`,
        cta: { label: 'Book follow-up', href: i.links.book },
      };
    }
  }

  if (!i.hasAnyConsult && soonest.length === 0) {
    return {
      kind: 'book',
      title: 'Start with a consultation',
      body: 'A 30-minute video consultation with Dr. Tyagi. Your plan is chosen after he has seen your scalp and history.',
      cta: { label: 'Book consultation', href: i.links.book },
    };
  }

  return {
    kind: 'on_track',
    title: 'You are on track',
    body: i.plan
      ? 'Keep to your routine every day. We will message you on WhatsApp when the next step is due.'
      : 'Nothing is due right now. We will message you on WhatsApp when the next step is due.',
    cta: null,
  };
}
