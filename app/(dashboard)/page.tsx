import Link from 'next/link';
import { auth } from '@/lib/auth';
import {
  getBillsForHousehold,
  getClosedLoopCount,
  getDemoHousehold,
  startOfMonth,
  type BillWithProof
} from '@/lib/bills/queries';
import { formatMoney, formatRelative } from '@/lib/format';
import { Hero } from './components/hero';
import { TrustLine } from './components/trust-line';
import { MetricCard } from './components/metric-card';
import { ProofItem } from './components/proof-item';
import { PendingItem } from './components/pending-item';
import { PlanBar } from './components/plan-bar';
import { DemoBanner } from './components/demo-banner';

export const dynamic = 'force-dynamic';

export default async function PaalanHome() {
  const session = await auth();
  const userName =
    session?.user?.name?.split(' ')[0] ??
    session?.user?.email?.split('@')[0] ??
    'friend';

  const household = await getDemoHousehold();

  if (!household) {
    return (
      <div className="px-5 py-12 text-center text-sm text-paalan-muted-2">
        <p className="mb-3 font-semibold text-paalan-ink">
          No household yet
        </p>
        <p>
          Run <code className="rounded bg-white px-1.5 py-0.5">bun run db:seed</code>{' '}
          to load the sample Pune home.
        </p>
      </div>
    );
  }

  const [bills, closedLoops] = await Promise.all([
    getBillsForHousehold(household.id),
    getClosedLoopCount(household.id, startOfMonth())
  ]);

  const confirmed = bills.filter((b) => b.status === 'confirmed');
  const pending = bills.filter(
    (b) => b.status === 'submitted' || b.status === 'overdue'
  );
  const due = bills.filter((b) => b.status === 'due');
  const upcomingCount = due.length + pending.length;

  return (
    <div className="space-y-4 px-4">
      <DemoBanner household={household} signedIn={!!session?.user} />

      <p className="px-1 text-xs text-paalan-muted">
        Good evening,{' '}
        <span className="font-medium text-paalan-muted-2">{userName}</span>
      </p>

      <Hero
        parentName={household.parentName}
        householdName={household.displayName}
        paidCount={confirmed.length}
        upcomingCount={upcomingCount}
      />

      <TrustLine />

      <MetricCard
        count={closedLoops}
        parentName={household.parentName}
      />

      {confirmed.length > 0 && (
        <section>
          <header className="mb-2 mt-3 flex items-baseline justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-paalan-muted-2">
              Recent proof
            </h2>
            <Link
              href="/bills"
              className="text-xs font-semibold text-paalan-green"
            >
              See all
            </Link>
          </header>
          <div className="space-y-2">
            {confirmed.slice(0, 4).map((bill) => (
              <ProofItem
                key={bill.id}
                bill={bill}
                amount={formatMoney(
                  bill.amountMinor,
                  bill.currency,
                  household.locale
                )}
                confirmerLine={confirmerLine(bill, household.parentName)}
              />
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <header className="mb-2 mt-3 flex items-baseline justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-paalan-muted-2">
              Needs a confirm
            </h2>
          </header>
          <div className="space-y-2">
            {pending.map((bill) => (
              <PendingItem
                key={bill.id}
                bill={bill}
                amount={formatMoney(
                  bill.amountMinor,
                  bill.currency,
                  household.locale
                )}
                parentName={household.parentName}
              />
            ))}
          </div>
        </section>
      )}

      <PlanBar
        householdId={household.id}
        householdName={household.displayName}
        currency={household.currency}
      />
    </div>
  );
}

function confirmerLine(bill: BillWithProof, parentName: string): string {
  const who =
    bill.confirmer?.role === 'parent'
      ? parentName
      : bill.confirmer?.name ?? 'family';
  const role = bill.confirmer?.role === 'helper' ? ' (helper)' : '';
  const when = bill.confirmedAt
    ? ` · ${formatRelative(bill.confirmedAt)}`
    : '';
  return `Confirmed by ${who}${role}${when}`;
}
