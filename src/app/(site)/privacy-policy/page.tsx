import { permanentRedirect } from 'next/navigation';

/** Friendly alias for  (footer and shared links). */
export default function Page() {
  permanentRedirect('/legal/privacy');
}
