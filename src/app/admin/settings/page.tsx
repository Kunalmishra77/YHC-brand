import { ResetDemoButton, SettingRow } from '@/components/admin/setting-row';
import { PageHeader } from '@/components/shared/page-header';
import { requireAdminPage } from '@/server/admin/guard';
import { settingKind } from '@/server/admin/settings';
import { db } from '@/server/demo/store';

export const metadata = { title: 'Settings' };

const GROUPS: Record<string, string> = {
  consult: 'Consultations',
  recommendation: 'Plan recommendations',
  refill: 'Refills',
  sales: 'Sales',
  messaging: 'Messaging',
  guarantee: 'Guarantee',
};

const SENSITIVE: Record<string, string> = {
  'consult.fee_paise': 'This is a price shown to customers (in paise: 50000 = ₹500).',
  'guarantee.enabled':
    'Turning this on shows the guarantee everywhere with the active terms. Production default is off until the client approves the terms.',
  'consult.credit_enabled': 'Changes what customers pay for their first plan.',
};

export default async function SettingsPage() {
  await requireAdminPage();
  const settings = db().settings;
  const groups = Object.entries(
    settings.reduce<Record<string, typeof settings>>((acc, s) => {
      const g = s.key.split('.')[0] ?? 'other';
      (acc[g] ??= []).push(s);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Time windows, fees and switches used across the platform. Every change is validated and audited."
      />
      {groups.map(([group, rows]) => (
        <section
          key={group}
          aria-labelledby={`g-${group}`}
          className="rounded-xl bg-card px-4 shadow-card ring-1 ring-line/80 md:px-5"
        >
          <h2 id={`g-${group}`} className="border-b border-line py-3 text-base font-semibold text-ink">
            {GROUPS[group] ?? group}
          </h2>
          <div className="divide-y divide-line">
            {rows.map((s) => (
              <SettingRow
                key={`${s.key}:${s.value}`}
                settingKey={s.key}
                description={s.description}
                value={s.value}
                kind={settingKind(s)}
                sensitive={SENSITIVE[s.key]}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3 rounded-lg border border-dashed border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Demo data</h2>
          <p className="text-[13px] text-muted-foreground">
            Demo: changes reset when the server restarts — or now, with this button.
          </p>
        </div>
        <ResetDemoButton />
      </section>
    </div>
  );
}
