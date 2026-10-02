import type { RegulatoryCategory } from '@/lib/domain/types';

// TODO(client): regulatory category per product — see docs/12 D-P2
export const REGULATORY_LABEL: Record<RegulatoryCategory, string> = {
  drug: 'Prescription medicine',
  cosmetic: 'Cosmetic',
  ayurvedic: 'Ayurvedic',
  supplement: 'Food supplement',
  other: 'Hair care',
};
