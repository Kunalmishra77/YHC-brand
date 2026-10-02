import { Plus } from 'lucide-react';
import type { Faq } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/** Guarantee FAQs are hidden while the guarantee is switched off. */
export function visibleFaqs(faqs: Faq[], guaranteeOn: boolean): Faq[] {
  return guaranteeOn ? faqs : faqs.filter((f) => f.category !== 'guarantee');
}

/** Accessible accordion on native <details>; works without JavaScript. */
export function FaqList({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {faqs.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <Plus
              className="size-5 shrink-0 text-steel transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
              aria-hidden
            />
          </summary>
          <p className="max-w-prose pb-5 text-body">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
