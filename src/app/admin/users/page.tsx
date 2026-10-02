import { ConfirmAction } from '@/components/admin/action-kit';
import { DataList } from '@/components/admin/data-list';
import { InviteDialog, RoleChangeDialog } from '@/components/admin/user-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { StatusChip } from '@/components/shared/status-chip';
import type { StaffUser } from '@/lib/domain/types';
import { requireAdminPage } from '@/server/admin/guard';
import { STAFF } from '@/server/demo/fixtures';
import { setActiveAction } from './actions';

export const metadata = { title: 'Users' };

const ROLE_LABEL: Record<StaffUser['role'], string> = {
  customer: 'Customer',
  doctor: 'Doctor',
  sales: 'Sales',
  ops: 'Ops',
  admin: 'Admin',
};

export default async function UsersPage() {
  const me = await requireAdminPage();
  const staff = [...STAFF].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name),
  );
  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & roles"
        description="Doctor and admin rights need a TOTP-verified session; the database enforces it."
        actions={<InviteDialog />}
      />
      <DataList<StaffUser>
        rows={staff}
        rowKey={(u) => u.id}
        caption="Staff users"
        columns={[
          {
            header: 'Name',
            cell: (u) => (
              <span>
                <span className="block font-medium text-ink">
                  {u.name}
                  {u.id === me.id ? (
                    <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">(you)</span>
                  ) : null}
                </span>
                <span className="block text-[12px] text-muted-foreground">{u.email}</span>
              </span>
            ),
          },
          { header: 'Role', cell: (u) => <span className="text-sm">{ROLE_LABEL[u.role]}</span> },
          {
            header: 'MFA',
            cell: (u) =>
              u.role === 'doctor' || u.role === 'admin' ? (
                <StatusChip tone="success">TOTP on</StatusChip>
              ) : (
                <StatusChip tone="neutral">Not required</StatusChip>
              ),
          },
          {
            header: 'Status',
            cell: (u) =>
              u.active ? (
                <StatusChip tone="success">Active</StatusChip>
              ) : (
                <StatusChip tone="neutral">Deactivated</StatusChip>
              ),
          },
        ]}
        actions={(u) =>
          u.id === me.id || u.role === 'customer' ? null : (
            <>
              {u.active ? <RoleChangeDialog userId={u.id} name={u.name} current={u.role} /> : null}
              <ConfirmAction
                action={setActiveAction.bind(null, u.id, { active: !u.active })}
                label={u.active ? 'Deactivate' : 'Reactivate'}
                variant="ghost"
                title={u.active ? `Deactivate ${u.name}?` : `Reactivate ${u.name}?`}
                description={
                  <p>
                    {u.active
                      ? 'They are signed out and can no longer access any portal. Their history stays. Leads they own should be reassigned.'
                      : 'They can sign in again with their existing role.'}
                  </p>
                }
                confirmLabel={u.active ? 'Deactivate' : 'Reactivate'}
                destructive={u.active}
              />
            </>
          )
        }
      />
      <p className="text-[13px] text-muted-foreground">Demo: changes reset when the server restarts.</p>
    </div>
  );
}
