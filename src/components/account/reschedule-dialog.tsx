'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * FR-M4-3 reschedule. Demo: explains the options; the self-serve slot change arrives with
 * POST /booking/rebook (Phase 04). Free until `consult.free_reschedule_hours` before start.
 */
export function RescheduleDialog({
  whenLabel,
  freeUntilLabel,
  isFree,
  freeHours,
  whatsappUrl,
}: {
  whenLabel: string;
  freeUntilLabel: string;
  isFree: boolean;
  freeHours: number;
  whatsappUrl: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 px-5">
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change your consultation time</DialogTitle>
          <DialogDescription>Currently booked for {whenLabel}.</DialogDescription>
        </DialogHeader>
        {isFree ? (
          <div className="space-y-3 text-sm text-body">
            <p>
              You can move this consultation <strong className="text-ink">once, free of charge</strong>, until{' '}
              {freeUntilLabel} ({freeHours} hours before it starts). Your payment carries over to the new
              time.
            </p>
            <p className="rounded-md bg-info-bg p-3 text-info">
              Demo: choosing a new slot here arrives with the booking flow. For now, message the care team and
              they will move it for you.
            </p>
          </div>
        ) : (
          <p className="text-sm text-body">
            Your consultation starts in less than {freeHours} hours, so it can no longer be moved online.
            Message the care team — if something has come up, they will do their best to help.
          </p>
        )}
        <DialogFooter>
          <Button asChild className="h-11 w-full px-5 sm:w-auto">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" aria-hidden />
              Message the care team
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
