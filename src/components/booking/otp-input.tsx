'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * 6-box OTP input (docs/07 §5). The first box carries `autocomplete="one-time-code"` so Android/iOS
 * autofill and paste fill all six boxes.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  invalid = false,
  disabled = false,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setFrom = (start: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) return;
    const next = (value.slice(0, start) + clean).slice(0, length);
    onChange(next);
    focusAt(next.length);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <div
      className="flex w-full max-w-[21rem] gap-2 sm:gap-3"
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? length : 1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={d}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = e.currentTarget.value;
            if (v.length > 1) setFrom(i, v);
            else if (v === '') onChange(value.slice(0, i) + value.slice(i + 1));
            else setFrom(i, v);
          }}
          onPaste={(e) => {
            e.preventDefault();
            setFrom(0, e.clipboardData.getData('text'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              e.preventDefault();
              onChange(value.slice(0, i - 1));
              focusAt(i - 1);
            } else if (e.key === 'ArrowLeft') focusAt(i - 1);
            else if (e.key === 'ArrowRight') focusAt(i + 1);
          }}
          className={cn(
            'price h-14 w-0 min-w-0 flex-1 rounded-md border bg-card text-center text-xl text-ink shadow-xs outline-none sm:max-w-12',
            'focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/25',
            invalid ? 'border-danger' : 'border-line',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  );
}
