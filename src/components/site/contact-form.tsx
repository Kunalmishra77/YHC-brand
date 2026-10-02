'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number.'),
  email: z.union([z.literal(''), z.email('Enter a valid email address, or leave it blank.')]),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters).')
    .max(1000, 'Please keep it under 1,000 characters.'),
});

type Field = keyof z.infer<typeof schema>;

/**
 * Demo contact form: validates on the client and shows a confirmation. Nothing is sent.
 * Asks people not to share medical details here — those belong in the consultation.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        next[key] ??= issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setErrors({});
    // TODO(client): route to support inbox / CRM once the support channel is confirmed — see docs/12 C
    setSentTo(parsed.data.name.split(' ')[0] ?? parsed.data.name);
  }

  if (sentTo) {
    return (
      <div role="status" className="rounded-xl border border-line bg-success-bg p-6">
        <p className="flex items-center gap-2 font-semibold text-success">
          <CheckCircle2 className="size-5" aria-hidden />
          Thank you, {sentTo}. Your message is with our team.
        </p>
        <p className="mt-2 text-body">
          We reply on WhatsApp or by phone, usually within one working day. Demo: nothing was actually sent.
        </p>
        <Button variant="outline" className="mt-4 h-11 px-5" onClick={() => setSentTo(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  const fieldClass = 'h-12 bg-card text-base';
  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5" aria-describedby="contact-note">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Your name</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          className={fieldClass}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        <FieldError id="contact-name-error" message={errors.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Mobile number</Label>
        <div className="flex">
          <span className="flex h-12 items-center rounded-l-md border border-r-0 border-input bg-mist px-3 text-sm text-ink">
            +91
          </span>
          <Input
            id="contact-phone"
            name="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            className={`${fieldClass} rounded-l-none`}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
          />
        </div>
        <FieldError id="contact-phone-error" message={errors.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">
          Email <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          className={fieldClass}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        <FieldError id="contact-email-error" message={errors.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          className="bg-card text-base"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>
      <p id="contact-note" className="text-sm text-muted-foreground">
        Please don&apos;t include medical details or photos here — share those privately with Dr. Tyagi when
        you book.
      </p>
      <Button type="submit" className="h-12 w-full px-8 text-base sm:w-auto">
        Send message
      </Button>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} aria-live="polite" className="min-h-0 text-sm text-danger empty:hidden">
      {message ?? ''}
    </p>
  );
}
