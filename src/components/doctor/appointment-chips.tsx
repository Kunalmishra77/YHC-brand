import { StatusChip } from '@/components/shared/status-chip';
import type { Appointment } from '@/lib/domain/types';
import { t } from '@/i18n/en';

/** FR-M5-2 status chips — always words: "Paid · intake done", "Photos missing", "Ready", "No-show". */
export function AppointmentChips({ appt }: { appt: Appointment }) {
  switch (appt.status) {
    case 'held':
      return <StatusChip tone="pending">{t('status.appointment.held')}</StatusChip>;
    case 'completed':
      return <StatusChip tone="success">{t('status.appointment.completed')}</StatusChip>;
    case 'no_show':
      return <StatusChip tone="danger">{t('status.appointment.no_show')}</StatusChip>;
    case 'booked':
      if (!appt.intakeDone) return <StatusChip tone="warning">Paid · intake missing</StatusChip>;
      return (
        <span className="inline-flex flex-wrap gap-1.5">
          <StatusChip tone="info">Paid · intake done</StatusChip>
          {appt.photosDone ? (
            <StatusChip tone="success">Ready</StatusChip>
          ) : (
            <StatusChip tone="warning">Photos missing</StatusChip>
          )}
        </span>
      );
    default:
      return <StatusChip tone="neutral">{t(`status.appointment.${appt.status}`)}</StatusChip>;
  }
}

export function readiness(appt: Appointment): string {
  if (appt.status !== 'booked') return t(`status.appointment.${appt.status}`).toLowerCase();
  if (!appt.intakeDone) return 'intake missing';
  if (!appt.photosDone) return 'photos missing';
  return 'ready';
}
