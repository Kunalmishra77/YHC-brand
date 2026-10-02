'use client';

import { Send } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { sendReorderLinkAction } from '@/app/sales/actions';
import { Button } from '@/components/ui/button';

export function ReorderLinkButton({
  leadId,
  orderCode,
  name,
}: {
  leadId: string;
  orderCode: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      className="h-11"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await sendReorderLinkAction({ leadId, orderCode });
          if (res.ok) toast.success(`Reorder link sent to ${name} on WhatsApp`);
          else toast.error(res.error.message);
        })
      }
    >
      <Send aria-hidden />
      {pending ? 'Sending…' : 'Send reorder link'}
    </Button>
  );
}
