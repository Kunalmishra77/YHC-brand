/** Shown under the homepage results (copy rules: PRD §15). Shared by the server section and the dialog. */
export const RESULT_DISCLAIMER =
  'Results vary from person to person. Shared with written permission. Faces hidden. Photos not edited.';

/** The short honest line beside the heading (docs/20 §1). */
export const RESULT_LINE = 'Real patients, shared with permission. Results vary.';

/** Everyday words for the clinic's concern labels (src/server/content/results.ts stays as recorded). */
const CONCERN_PLAIN: Record<string, string> = {
  'Diffuse thinning': 'Thinning all over',
  'Receding hairline': 'Hairline moving back',
  'Crown thinning': 'Thin at the crown',
};

const VIEW_PLAIN: Record<string, string> = {
  'Top-front': 'Top of the head',
  Side: 'Side of the head',
  Crown: 'Crown, from behind',
};

export const plainConcern = (concern: string): string => CONCERN_PLAIN[concern] ?? concern;
export const plainView = (view: string): string => VIEW_PLAIN[view] ?? view;
