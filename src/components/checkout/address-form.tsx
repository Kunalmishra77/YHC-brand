'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EMPTY_ADDRESS, INDIAN_STATES, addressSchema, type AddressInput } from '@/lib/validation/checkout';

/**
 * Delivery address (FR-M2-4, FR-M6-3). Submitted by an outside button via `form={formId}`.
 * TODO(client): pincode → city/state autofill API — see docs/12 (optional).
 */
export function AddressForm({
  formId,
  defaultValues,
  onValid,
  disabled,
}: {
  formId: string;
  defaultValues?: Partial<AddressInput>;
  onValid: (address: AddressInput) => void;
  disabled?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { ...EMPTY_ADDRESS, ...defaultValues },
  });

  const field = (name: keyof AddressInput) => ({
    id: `${formId}-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': `${formId}-${name}-err`,
  });

  return (
    <form id={formId} noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset disabled={disabled} className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        <Row label="Full name" name="fullName" formId={formId} error={errors.fullName?.message} wide>
          <Input
            {...field('fullName')}
            autoComplete="name"
            className="h-12 bg-card text-base"
            {...register('fullName')}
          />
        </Row>
        <Row label="House / flat, street" name="line1" formId={formId} error={errors.line1?.message} wide>
          <Input
            {...field('line1')}
            autoComplete="address-line1"
            className="h-12 bg-card text-base"
            {...register('line1')}
          />
        </Row>
        <Row
          label="Area, landmark (optional)"
          name="line2"
          formId={formId}
          error={errors.line2?.message}
          wide
        >
          <Input
            {...field('line2')}
            autoComplete="address-line2"
            className="h-12 bg-card text-base"
            {...register('line2')}
          />
        </Row>
        <Row label="Pincode" name="pincode" formId={formId} error={errors.pincode?.message}>
          <Input
            {...field('pincode')}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            className="price h-12 bg-card text-base tracking-wider"
            {...register('pincode')}
          />
        </Row>
        <Row label="City" name="city" formId={formId} error={errors.city?.message}>
          <Input
            {...field('city')}
            autoComplete="address-level2"
            className="h-12 bg-card text-base"
            {...register('city')}
          />
        </Row>
        <Row label="State" name="state" formId={formId} error={errors.state?.message} wide>
          <select
            {...field('state')}
            autoComplete="address-level1"
            className={cn(
              'h-12 w-full rounded-md border border-input bg-card px-3 text-base text-ink shadow-xs outline-none',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            )}
            {...register('state')}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Row>
      </fieldset>
    </form>
  );
}

function Row({
  label,
  name,
  formId,
  error,
  wide,
  children,
}: {
  label: string;
  name: string;
  formId: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', wide && 'sm:col-span-2')}>
      <label htmlFor={`${formId}-${name}`} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      <p id={`${formId}-${name}-err`} aria-live="polite" className="min-h-5 text-sm text-danger">
        {error}
      </p>
    </div>
  );
}
