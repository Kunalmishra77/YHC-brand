import { AuditTable } from '@/components/admin/audit-table';
import { PageHeader } from '@/components/shared/page-header';
import { requireAdminPage } from '@/server/admin/guard';
import { db } from '@/server/demo/store';

export const metadata = { title: 'Audit log' };

export default async function AuditPage() {
  await requireAdminPage();
  const rows = [...db().audit]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map(({ id, actor, action, target, at }) => ({ id, actor, action, target, at }));
  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        description="Clinical record views, price, settings and terms changes, refunds, role changes and exports. Entries cannot be edited."
      />
      <AuditTable rows={rows} />
    </div>
  );
}
