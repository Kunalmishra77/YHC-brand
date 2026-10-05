import { Loader2 } from 'lucide-react';

export default function StartLoading() {
  return (
    <div
      className="flex min-h-[60dvh] items-center justify-center bg-obsidian text-on-dark-muted"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span className="ml-2 text-sm">Loading your assessment…</span>
    </div>
  );
}
