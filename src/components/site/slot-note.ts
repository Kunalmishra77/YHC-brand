import { t } from '@/i18n/en';
import type { SiteImage } from '@/lib/images';

/**
 * The "Illustrative image" chip text for a large image (docs/20 §1): shown when a generated slot is
 * marked illustrative, or when the temporary fallback is one of the illustrative doctor scenes (their
 * alt text starts with "Illustrative image"). Returns undefined when no chip is needed.
 */
export function illustrativeNote(
  image: SiteImage & { illustrative?: boolean; ready?: boolean },
): string | undefined {
  if (image.illustrative && image.ready !== false) return t('common.illustrativeImage');
  if (image.alt.startsWith('Illustrative image')) return t('common.illustrativeImage');
  return undefined;
}
