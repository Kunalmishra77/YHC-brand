import { Logo } from '@/components/shared/logo';

/** Dark, distraction-free layout for the patient video room (FR-M5-6). */
export default function ConsultLayout({ children }: LayoutProps<'/consult'>) {
  return (
    <div className="flex min-h-dvh flex-col bg-obsidian text-on-dark">
      <header className="border-b border-line-dark">
        <div className="container-yhc flex h-16 items-center justify-between">
          <Logo tone="light" />
          <span className="text-[13px] text-on-dark-muted">Private consultation room</span>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
