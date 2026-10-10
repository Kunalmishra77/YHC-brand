import { BadgeCheck, Video } from 'lucide-react';
import Image from 'next/image';
import type { Doctor } from '@/lib/domain/types';
import { publicCredential } from '@/lib/credentials';
import { DOCTOR_PORTRAIT } from '@/lib/images';
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
        'grid items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:gap-20',
        className,
      )}
    >
      <DoctorVisual doctor={doctor} />
      <div>
        <Heading className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] text-balance">
          {doctor.name}
        </Heading>
        <p className="mt-2 text-lg text-ink">
          {publicCredential(doctor.qualifications) ?? 'Dermatologist · hair and scalp'}
        </p>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-pretty text-body">{doctor.bio}</p>
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

/** Dr. Anil Tyagi's portrait with the credential card overlapping its lower edge. */
function DoctorVisual({ doctor }: { doctor: Doctor }) {
  const img = DOCTOR_PORTRAIT;
  return (
    <div className="relative mx-auto w-full max-w-md">
      <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-mist ring-1 ring-line">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 28rem, (min-width: 640px) 28rem, 100vw"
          className="object-cover object-[50%_20%]"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-obsidian/45 to-transparent"
          aria-hidden
        />
        <figcaption className="sr-only">{doctor.name}</figcaption>
      </figure>
      <div className="relative -mt-14 px-3 sm:-mt-20 sm:px-6">
        <CredentialCard doctor={doctor} />
      </div>
    </div>
  );
}

function CredentialCard({ doctor }: { doctor: Doctor }) {
  return (
    <figure className="relative w-full">
      <div
        className="absolute -inset-3 -z-10 rounded-[28px] bg-[image:var(--yhc-silver)] opacity-30 blur-2xl"
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
        <div className="px-6 pt-6 pb-6">
          <p className="font-display text-[30px] leading-none">{doctor.name}</p>
          <p className="mt-2 text-sm text-on-dark-muted">
            {publicCredential(doctor.qualifications) ?? 'Dermatologist · hair and scalp'}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-dark pt-5 text-sm">
            <div>
              <dt className="text-[12px] text-on-dark-muted">Registration</dt>
              <dd className="price mt-0.5">{publicCredential(doctor.registrationNo) ?? 'Being added'}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-on-dark-muted">Council</dt>
              <dd className="mt-0.5">{publicCredential(doctor.council) ?? 'Being added'}</dd>
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
