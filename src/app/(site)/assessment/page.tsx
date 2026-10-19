import { permanentRedirect } from 'next/navigation';

/*
 * The standalone eight-question quiz was a second entry funnel. Its questions now sit inside the one
 * journey at /start (ADR-33, audit FUN-03), so old links and bookmarks move there permanently.
 * `assessment-quiz.tsx` and `actions.ts` in this folder are unused until the client confirms they can go.
 */
export default function AssessmentPage(): never {
  permanentRedirect('/start');
}
