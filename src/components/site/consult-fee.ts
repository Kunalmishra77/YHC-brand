import 'server-only';

import { formatINR } from '@/lib/money';
import { getSetting, getSettingNumber } from '@/server/demo/store';

/** Consultation fee and credit rules come from settings, never constants (CLAUDE.md). */
export function getConsultTerms() {
  const feePaise = getSettingNumber('consult.fee_paise');
  const creditEnabled = getSetting('consult.credit_enabled') === 'true';
  const creditWindowDays = getSettingNumber('consult.credit_window_days');
  return {
    feePaise,
    fee: formatINR(feePaise),
    slotMinutes: getSettingNumber('consult.slot_minutes'),
    creditEnabled,
    creditWindowDays,
    // TODO(client): confirm the consultation-fee credit — see docs/12 / docs/15 pending
    creditLine: creditEnabled
      ? `${formatINR(feePaise)} consultation fee credited if you buy within ${creditWindowDays} days of your consultation (pending confirmation)`
      : null,
    bookLabel: `Book consultation · ${formatINR(feePaise)}`,
  };
}
