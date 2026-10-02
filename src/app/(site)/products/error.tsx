'use client';

import { SiteError } from '@/components/site/site-error';

export default function SegmentError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <SiteError retry={retry} />;
}
