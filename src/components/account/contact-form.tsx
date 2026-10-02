'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { contactSupportAction } from '@/app/account/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const TOPICS = [
  { id: 'order', label: 'An order or delivery' },
  { id: 'consultation', label: 'A consultation' },
  { id: 'routine', label: 'My routine or products' },
  { id: 'payment', label: 'Payment or refund' },
  { id: 'other', label: 'Something else' },
] as const;

type Topic = (typeof TOPICS)[number]['id'];

const isTopic = (v: string): v is Topic => TOPICS.some((t) => t.id === v);

/** FR-M4-8 contact form. Demo: shows the success state; Phase 09 routes it to the care team queue. */
export function ContactForm() {
  const [topic, setTopic] = useState<Topic>('order');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await contactSupportAction({ topic, message });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setReference(res.data.reference);
      setMessage('');
    });
  }

  if (reference) {
    return (
      <div role="status" className="flex flex-col items-start gap-2 rounded-lg bg-success-bg p-4">
        <CheckCircle2 className="size-5 text-success" aria-hidden />
        <p className="font-medium text-ink">Message sent · reference {reference}</p>
        <p className="text-sm text-body">The care team will reply on WhatsApp during business hours.</p>
        <Button variant="outline" className="mt-2 h-11 bg-card px-5" onClick={() => setReference(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="topic">What is it about?</Label>
        <Select value={topic} onValueChange={(v) => isTopic(v) && setTopic(v)}>
          <SelectTrigger id="topic" className="h-11 w-full sm:w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Your message</Label>
        <Textarea
          id="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          aria-invalid={error ? true : undefined}
          placeholder="Include your order number if it is about an order."
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11 px-6" disabled={pending} aria-busy={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
