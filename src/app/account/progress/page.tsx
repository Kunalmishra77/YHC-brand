import { Lock } from 'lucide-react';
import { formatDay } from '@/components/account/format';
import { PhotoTile } from '@/components/account/photo-tile';
import { PhotoUploader } from '@/components/account/photo-uploader';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { t } from '@/i18n/en';
import { requireRole } from '@/lib/rbac';
import { PHOTO_ANGLES } from '@/server/account/photos';
import { activePlan, customerPhotos } from '@/server/account/queries';
import { recordAudit } from '@/server/demo/store';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Progress' };

export default async function ProgressPage() {
  const user = await requireRole(['customer']);
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const photos = customerPhotos(customer.id);
  const plan = activePlan(customer.id);
  if (photos.length) recordAudit(user.name, 'clinical.view', `Progress photos · ${customer.id}`);

  const first = photos[0];
  const latest = photos.length > 1 ? photos.at(-1) : undefined;
  // Same month windows as the guarantee engine: delivery day … day 30 = month 1.
  const offset = plan ? plan.progress.day - 1 : 0;
  const monthNo = plan ? (offset <= 30 ? 1 : Math.ceil(offset / 30)) : null;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Progress"
        description="Monthly photos from the same three angles help Dr. Tyagi see slow changes that are easy to miss in the mirror."
      />

      <p className="flex items-start gap-2 rounded-lg bg-mist p-4 text-sm text-ink">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Private by default. Only you and Dr. Tyagi can see these photos. They are never used for marketing
          unless you give separate permission in Profile → Consents.
        </span>
      </p>

      {first && latest ? (
        <section aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="eyebrow">
            Side by side
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-line bg-card p-4 sm:gap-6 md:p-6">
            {[first, latest].map((set) => (
              <div key={set.id}>
                <p className="text-sm font-semibold text-ink">{set.label}</p>
                <p className="text-[13px] text-muted-foreground">{formatDay(set.takenOn, 'd MMM yyyy')}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {PHOTO_ANGLES.map((a) => (
                    <PhotoTile key={a.id} angle={a.label} date={formatDay(set.takenOn, 'd MMM')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {t('common.resultsVary')} Changes in density usually take several months of steady use.
          </p>
        </section>
      ) : null}

      <section id="upload" aria-label="Upload photos" className="scroll-mt-6">
        <PhotoUploader
          angles={PHOTO_ANGLES}
          title={monthNo ? `Upload your month ${monthNo} photos` : "Upload this month's photos"}
        />
      </section>

      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="eyebrow">
          Timeline
        </h2>
        {photos.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No photos yet"
            body="Your first set becomes the baseline. Add one above — it takes about two minutes."
          />
        ) : (
          <ol className="mt-3 space-y-4">
            {[...photos].reverse().map((set) => (
              <li key={set.id} className="rounded-xl border border-line bg-card p-4 md:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-ink">{set.label}</p>
                  <p className="text-sm text-muted-foreground">{formatDay(set.takenOn)}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
                  {PHOTO_ANGLES.map((a) => (
                    <PhotoTile key={a.id} angle={a.label} date={formatDay(set.takenOn, 'd MMM')} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
