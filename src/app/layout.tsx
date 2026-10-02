import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { clientEnv } from '@/lib/env';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: 'Your Hair Company — Doctor-led hair care', template: '%s · Your Hair Company' },
  description:
    'Video consultation with Dr. Tyagi, a personalised hair plan, delivery to your door and follow-up care.',
};

export const viewport: Viewport = {
  themeColor: '#121315',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
