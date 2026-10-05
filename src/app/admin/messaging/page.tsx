import { Moon, RefreshCw } from 'lucide-react';
import { DataList } from '@/components/admin/data-list';
import { istShort, MESSAGE_TONE } from '@/components/admin/format';
import { JourneySwitch, QuietHoursForm } from '@/components/admin/messaging-controls';
import { ActionButton } from '@/components/admin/order-dialogs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { StatusChip } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import type { Message, MessageTemplate } from '@/lib/domain/types';
import { requireAdminPage } from '@/server/admin/guard';
import { adminState, type Journey } from '@/server/admin/state';
import { TEMPLATES } from '@/server/demo/fixtures';
import { db, getSetting } from '@/server/demo/store';
import { retryMessageAction } from './actions';

export const metadata = { title: 'Messaging' };

const APPROVAL: Record<MessageTemplate['approval'], ['success' | 'pending' | 'neutral', string]> = {
  approved: ['success', 'Approved'],
  pending: ['pending', 'Pending approval'],
  draft: ['neutral', 'Draft'],
};

const CHANNEL: Record<Message['channel'], string> = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' };

function parseQuiet(value: string): { start: string; end: string } {
  try {
    const v: unknown = JSON.parse(value);
    if (v && typeof v === 'object' && 'start' in v && 'end' in v) {
      return { start: String(v.start), end: String(v.end) };
    }
  } catch {
    // fall through to the documented default (FR-M8-7)
  }
  return { start: '21:00', end: '09:00' };
}

export default async function MessagingPage() {
  await requireAdminPage();
  const s = db();
  const quiet = parseQuiet(getSetting('messaging.quiet_hours'));
  const journeys = adminState().journeys;
  const messages = [...s.messages].sort((a, b) => b.at.localeCompare(a.at));
  const failed = messages.filter((m) => m.status === 'failed').length;
  const nameOf = (id: string | null) => s.customers.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Messaging"
        description="Templates, journeys, quiet hours and the message log. Utility templates never carry offers."
      />

      <section aria-labelledby="journeys-title" className="space-y-3">
        <div>
          <h2 id="journeys-title" className="text-base font-semibold text-ink">
            Journeys
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Demo: switches live in memory until the journey settings table lands (Phase 05). Offsets come from
            Settings.
          </p>
        </div>
        <DataList<Journey>
          rows={journeys}
          rowKey={(j) => j.key}
          caption="Journeys"
          columns={[
            { header: 'Journey', cell: (j) => <span className="font-medium text-ink">{j.label}</span> },
            { header: 'Trigger', cell: (j) => <span className="text-sm">{j.trigger}</span> },
            {
              header: 'Templates',
              cell: (j) => (
                <span className="text-[13px] text-muted-foreground">{j.templates.join(', ')}</span>
              ),
            },
            {
              header: 'Quiet hours',
              cell: (j) =>
                j.quietHours ? (
                  <StatusChip tone="neutral">Respects quiet hours</StatusChip>
                ) : (
                  <StatusChip tone="info">Sent immediately</StatusChip>
                ),
            },
          ]}
          actions={(j) => <JourneySwitch journeyKey={j.key} label={j.label} enabled={j.enabled} />}
        />
      </section>

      <section
        aria-labelledby="quiet-title"
        className="rounded-xl bg-card p-4 shadow-card ring-1 ring-line/80 md:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <Moon className="size-4 text-steel" aria-hidden />
          <h2 id="quiet-title" className="text-base font-semibold text-ink">
            Quiet hours
          </h2>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-body">
          Scheduled non-urgent messages (check-ins, photo requests, refill reminders, nudges, marketing) wait
          until quiet hours end. Booking and order confirmations, plan-ready, OTPs and consultation reminders
          are never delayed.
        </p>
        <QuietHoursForm start={quiet.start} end={quiet.end} />
      </section>

      <section aria-labelledby="templates-title" className="space-y-3">
        <div>
          <h2 id="templates-title" className="text-base font-semibold text-ink">
            Templates
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {TEMPLATES.length} templates · WhatsApp templates are approved by Meta; final wording needs Dr.
            Tyagi’s (medical) and YHC’s (brand) sign-off.
          </p>
        </div>
        <DataList<MessageTemplate>
          rows={TEMPLATES}
          rowKey={(tpl) => tpl.key}
          caption="Message templates"
          columns={[
            { header: 'Key', cell: (tpl) => <code className="text-[13px] text-ink">{tpl.key}</code> },
            { header: 'Channel', cell: (tpl) => CHANNEL[tpl.channel] },
            { header: 'Category', cell: (tpl) => <span className="capitalize">{tpl.category}</span> },
            {
              header: 'Approval',
              cell: (tpl) => (
                <StatusChip tone={APPROVAL[tpl.approval][0]}>{APPROVAL[tpl.approval][1]}</StatusChip>
              ),
            },
            {
              header: 'Preview',
              className: 'max-w-md',
              cell: (tpl) => <span className="text-[13px] text-body">{tpl.bodyPreview}</span>,
            },
          ]}
        />
      </section>

      <section aria-labelledby="log-title" className="space-y-3">
        <div>
          <h2 id="log-title" className="text-base font-semibold text-ink">
            Message log
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {messages.length} messages · {failed} failed. Failed sends retry up to 3 times, then fall back to
            SMS for transactional messages.
          </p>
        </div>
        <DataList<Message>
          rows={messages}
          rowKey={(m) => m.id}
          caption="Message log"
          empty={<EmptyState title="No messages yet" />}
          columns={[
            {
              header: 'Template',
              cell: (m) => (
                <span>
                  <code className="text-[13px] text-ink">{m.template ?? 'Inbound reply'}</code>
                  <span className="block text-[12px] text-muted-foreground">
                    {CHANNEL[m.channel]} · {m.direction}
                  </span>
                </span>
              ),
            },
            { header: 'Customer', cell: (m) => nameOf(m.customerId) },
            {
              header: 'Content',
              className: 'max-w-sm',
              cell: (m) =>
                m.direction === 'inbound' ? (
                  <span className="text-[13px] text-muted-foreground italic">
                    Visible to the care team only
                  </span>
                ) : (
                  <span className="text-[13px] text-body">{m.preview}</span>
                ),
            },
            {
              header: 'Status',
              cell: (m) => (
                <StatusChip tone={MESSAGE_TONE[m.status]}>{t(`status.message.${m.status}`)}</StatusChip>
              ),
            },
            {
              header: 'Time',
              cell: (m) => <span className="text-sm text-muted-foreground">{istShort(m.at)}</span>,
            },
          ]}
          actions={(m) =>
            m.status === 'failed' ? (
              <ActionButton
                action={retryMessageAction.bind(null, m.id)}
                label="Retry"
                icon={<RefreshCw className="size-4" aria-hidden />}
              />
            ) : null
          }
        />
      </section>
    </div>
  );
}
