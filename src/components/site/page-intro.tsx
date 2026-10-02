import { cn } from '@/lib/utils';

/** Opening block for inner marketing pages — editorial, light, one idea. */
export function PageIntro({
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-line', className)}>
      <div className="container-yhc py-12 md:py-20">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className={cn('display max-w-3xl text-3xl', eyebrow ? 'mt-3' : null)}>{title}</h1>
        {lede ? <div className="mt-5 max-w-2xl text-lg text-body">{lede}</div> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
