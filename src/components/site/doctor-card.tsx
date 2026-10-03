import { BadgeCheck, Video } from 'lucide-react';
import type { Doctor } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/**
 * DoctorCard (docs/07 §5). Until Dr. Tyagi's portrait arrives we show a credential card styled like
 * the letterhead on every prescription — real, verifiable facts instead of a grey silhouette.
 * TODO(client): Dr. Tyagi portrait + signature image — see docs/12 C.
 */
export function DoctorCard({
  doctor,
  className,
  headingLevel = 'h2',
  children,
}: {
  doctor: Doctor;
  className?: string;
  headingLevel?: 'h1' | 'h2';
  children?: React.ReactNode;
}) {
  const Heading = headingLevel;
  return (
    <div
      className={cn(
        'grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16',
        className,
      )}
    >
      <CredentialCard doctor={doctor} />
      <div>
        <Heading className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">{doctor.name}</Heading>
        <p className="mt-2 text-lg text-ink">{doctor.qualifications}</p>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-body">{doctor.bio}</p>
        <ul className="mt-8 grid max-w-prose gap-3 text-body sm:grid-cols-2">
          {[
            'Reads your history and scalp photos before the call',
            'Explains what is likely going on, in plain words',
            'Prescribes only if treatment is right for you',
            'Reviews your progress at follow-up',
          ].map((line) => (
            <li key={line} className="flex gap-2.5 text-[15px]">
              <span className="mt-2.5 h-px w-4 shrink-0 bg-steel" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </div>
  );
}

function CredentialCard({ doctor }: { doctor: Doctor }) {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      <div
        className="absolute -inset-3 -z-10 rounded-[28px] bg-[image:var(--yhc-silver)] opacity-40 blur-2xl"
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl bg-obsidian text-on-dark shadow-raised ring-1 ring-line-dark">
        <div className="flex items-center justify-between border-b border-line-dark px-6 py-4">
          <span className="font-display text-lg">Your Hair Company</span>
          <span className="flex items-center gap-1.5 text-[12px] text-on-dark-muted">
            <Video className="size-3.5" aria-hidden />
            Video consultation
          </span>
        </div>
        <div className="px-6 pt-8 pb-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-[image:var(--yhc-silver)] font-display text-2xl text-obsidian">
            T
          </div>
          <p className="mt-6 font-display text-[34px] leading-none">{doctor.name}</p>
          <p className="mt-2 text-sm text-on-dark-muted">{doctor.qualifications}</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-dark pt-6 text-sm">
            <div>
              <dt className="text-[12px] text-on-dark-muted">Registration</dt>
              <dd className="price mt-0.5">{doctor.registrationNo}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-on-dark-muted">Council</dt>
              <dd className="mt-0.5">{doctor.council}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-on-dark-muted">Focus</dt>
              <dd className="mt-0.5">Hair &amp; scalp</dd>
            </div>
            <div>
              <dt className="text-[12px] text-on-dark-muted">Consults</dt>
              <dd className="mt-0.5">One to one, 30 min</dd>
            </div>
          </dl>
        </div>
        <figcaption className="flex items-center gap-2 border-t border-line-dark bg-ink-2 px-6 py-3.5 text-[12px] text-on-dark-muted">
          <BadgeCheck className="size-4 text-brand-on-dark" aria-hidden />
          Registration number appears on every prescription
        </figcaption>
      </div>
    </figure>
  );
}
