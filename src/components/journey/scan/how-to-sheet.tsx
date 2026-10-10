'use client';

import { Hand, Ruler, Scissors, Sun } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const TIPS = [
  {
    icon: Sun,
    title: 'Use good light',
    text: 'Face a window or switch on a bright light. Avoid strong shadows on the scalp.',
  },
  {
    icon: Ruler,
    title: 'Hold it 10–15 cm away',
    text: 'Close enough to see single hairs. Wait a second for the picture to turn sharp.',
  },
  {
    icon: Scissors,
    title: 'Part the hair',
    text: 'Use a comb or your fingers so the skin of the scalp shows in the frame.',
  },
  {
    icon: Hand,
    title: 'Hold steady',
    text: 'Rest your elbow, tap the shutter gently and check the photo before you move on.',
  },
] as const;

export function HowToScanList() {
  return (
    <ul className="space-y-4">
      {TIPS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink">
            <Icon className="size-[18px]" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-ink">{title}</span>
            <span className="mt-0.5 block text-sm text-body">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HowToScanSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-line bg-pearl px-1 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink sm:mx-auto sm:max-w-lg"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" aria-hidden />
        <SheetHeader className="px-5 pt-1">
          <SheetTitle className="text-xl font-semibold text-ink">How to scan</SheetTitle>
          <SheetDescription className="text-body">
            Four habits that make each close-up useful to your doctor.
          </SheetDescription>
        </SheetHeader>
        <div className="px-5">
          <HowToScanList />
          <p className="mt-5 rounded-2xl bg-mist/70 px-4 py-3 text-[13px] text-body">
            Demo: your photos stay on this device and are never uploaded.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-obsidian text-[15px] font-semibold text-pearl hover:opacity-95"
          >
            Got it
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
