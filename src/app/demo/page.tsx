import { notFound } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { serverEnv } from '@/lib/env.server';
import { resetDemoData, signOutDemo, switchDemoRole } from './actions';

export const metadata = { title: 'Demo — choose a role', robots: { index: false } };

const ROLES = [
  {
    role: 'customer',
    title: 'Customer',
    who: 'Rahul Mehra · day 34 of a 3-month plan',
    see: 'Plan progress, consultations, orders, progress photos, guarantee tracker, reorder.',
  },
  {
    role: 'doctor',
    title: 'Dr. Tyagi',
    who: 'Doctor Portal',
    see: "Today's consultations, calendar, the three-pane consultation workspace, one-click plan recommendation.",
  },
  {
    role: 'sales',
    title: 'Sales executive',
    who: 'Priya Sharma',
    see: 'Pipeline that moves itself, lead timeline, ₹500 PAID alerts, tasks, care view.',
  },
  {
    role: 'admin',
    title: 'Admin',
    who: 'Kavya Iyer · management',
    see: 'Funnel and revenue KPIs, orders, products and plans, templates, settings, jobs, audit log.',
  },
  {
    role: 'ops',
    title: 'Operations',
    who: 'Arjun Mehta',
    see: 'Orders to pack and ship, delivery status, exceptions.',
  },
] as const;

export default async function DemoPage(props: PageProps<'/demo'>) {
  if (!serverEnv.DEMO_MODE) notFound();
  const sp = await props.searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '';
  return (
    <main className="min-h-dvh bg-pearl">
      <div className="container-yhc max-w-3xl py-12 md:py-20">
        <Logo />
        <h1 className="display mt-10 text-3xl">See the platform from each side</h1>
        <p className="mt-3 max-w-xl text-body">
          This is a working prototype on sample data. Nothing here sends messages or takes money. Book a
          consultation on the website as a customer, then switch to Dr. Tyagi or Sales to watch it arrive.
        </p>
        {sp.reset ? <p className="mt-4 text-sm text-success">Sample data was reset.</p> : null}
        <div className="mt-10 divide-y divide-line border-y border-line">
          {ROLES.map((r) => (
            <form
              key={r.role}
              action={switchDemoRole}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center"
            >
              <input type="hidden" name="role" value={r.role} />
              <input type="hidden" name="next" value={next} />
              <div className="flex-1">
                <p className="font-semibold text-ink">
                  {r.title} <span className="font-normal text-muted-foreground">— {r.who}</span>
                </p>
                <p className="mt-1 text-sm text-body">{r.see}</p>
              </div>
              <Button type="submit" variant="outline" className="h-11 border-steel sm:w-36">
                Open as {r.title.split(' ')[0]}
              </Button>
            </form>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="h-11">
            <a href="/">Open the website</a>
          </Button>
          <form action={signOutDemo}>
            <Button type="submit" variant="ghost" className="h-11">
              Sign out
            </Button>
          </form>
          <form action={resetDemoData}>
            <Button type="submit" variant="ghost" className="h-11 text-muted-foreground">
              Reset sample data
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
