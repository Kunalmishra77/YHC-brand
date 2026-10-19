'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_IDS,
  analyticsConfigured,
  readConsent,
  type AnalyticsConsent,
} from '@/lib/analytics';

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

/** Staff portals and the demo switcher are never measured. */
const UNTRACKED = ['/account', '/doctor', '/sales', '/admin', '/demo', '/consult'];

/**
 * Cookie consent + tag loader (audit BIZ-01, DPDP Act). Renders nothing until an analytics ID is
 * configured. Tags load only after "Accept"; "Decline" is as easy as "Accept" and is remembered.
 */
export function AnalyticsConsent() {
  const pathname = usePathname();
  // localStorage is read after hydration ('unknown' on the server) without a setState-in-effect.
  const stored = useSyncExternalStore(subscribe, () => readConsent() ?? 'none', () => 'unknown' as const);
  const [chosen, setConsent] = useState<AnalyticsConsent | null>(null);
  const consent: AnalyticsConsent | null | 'unknown' = chosen ?? (stored === 'none' ? null : stored);

  if (!analyticsConfigured() || consent === 'unknown') return null;
  if (UNTRACKED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const choose = (value: AnalyticsConsent) => {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      // Private mode: the choice lasts for this page view only.
    }
    setConsent(value);
  };

  return (
    <>
      {consent === 'granted' ? <Tags /> : null}
      {consent === null ? (
        <div
          role="region"
          aria-label="Cookie choices"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl bg-card p-4 text-sm text-body shadow-raised ring-1 ring-line sm:p-5 md:bottom-5"
        >
          <p className="leading-relaxed text-pretty">
            We&apos;d like to use cookies to measure visits and our ads. No health information is ever shared.
            See our{' '}
            <Link href="/legal/privacy" className="font-medium text-ink underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="button" className="h-11 flex-1" onClick={() => choose('granted')}>
              Accept
            </Button>
            <Button type="button" variant="outline" className="h-11 flex-1 border-steel" onClick={() => choose('denied')}>
              Decline
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Tags() {
  const { ga4, metaPixel } = ANALYTICS_IDS;
  return (
    <>
      {ga4 ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`} strategy="afterInteractive" />
          <Script id="yhc-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga4)},{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {metaPixel ? (
        <Script id="yhc-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixel)});fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
