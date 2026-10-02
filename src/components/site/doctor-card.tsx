import { BadgeCheck } from 'lucide-react';
import type { Doctor } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { PhotoPlaceholder } from './photo-placeholder';

/** DoctorCard (docs/07 §5): photo, name, qualifications, registration no., short bio. */
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
        'grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14',
        className,
      )}
    >
      <PhotoPlaceholder
        caption="Photo: Dr. Tyagi — to be supplied"
        tone="light"
        className="aspect-[4/5] w-full max-w-sm md:max-w-none"
      />
      <div>
        <Heading className="display text-3xl">{doctor.name}</Heading>
        <p className="mt-2 text-lg text-ink">{doctor.qualifications}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-body">
          <BadgeCheck className="size-4 text-brand" aria-hidden />
          <span>
            Reg. No. <span className="price">{doctor.registrationNo}</span>
          </span>
          <span aria-hidden>·</span>
          <span>{doctor.council}</span>
        </p>
        <p className="mt-6 max-w-prose text-body">{doctor.bio}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
