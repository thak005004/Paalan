import 'server-only';

import { getDemoHousehold, type DemoHousehold } from '@/lib/demo';

const HOUSEHOLD_NAME = 'Pune household';

// When DATABASE_URL is unset we run in zero-config demo mode (built-in sample
// data). DB modules are imported lazily so demo mode never constructs a Postgres
// client.
const hasDb = !!process.env.DATABASE_URL;

/**
 * The household to render on the home page. Reads from the database when one is
 * configured; otherwise returns the built-in demo household.
 */
export async function getHomeHousehold(): Promise<DemoHousehold | null> {
  if (!hasDb) return getDemoHousehold();

  const { db, households } = await import('@/lib/db');
  const { eq } = await import('drizzle-orm');

  const result = await db.query.households.findFirst({
    where: eq(households.displayName, HOUSEHOLD_NAME),
    with: {
      members: true,
      bills: {
        with: { attachments: true, confirmations: true },
        orderBy: (b, { desc }) => [desc(b.createdAt)]
      }
    }
  });

  return (result ?? null) as DemoHousehold | null;
}

/**
 * Closed trust loops (D16) for the given month window: distinct confirmed bills
 * with >= 1 attachment whose latest confirmation falls inside the window.
 */
export async function getMonthlyClosedLoops(
  household: DemoHousehold,
  monthStart: Date,
  monthEnd: Date
): Promise<number> {
  if (!hasDb) return computeClosedLoops(household, monthStart, monthEnd);

  const { getClosedTrustLoops } = await import('@/lib/bills/lifecycle');
  return getClosedTrustLoops({ householdId: household.id, monthStart, monthEnd });
}

// In-memory equivalent of the SQL metric, for demo mode.
function computeClosedLoops(
  household: DemoHousehold,
  monthStart: Date,
  monthEnd: Date
): number {
  return household.bills.filter((bill) => {
    if (bill.status !== 'confirmed' || bill.attachments.length === 0) return false;
    const latest = [...bill.confirmations].sort(
      (a, z) => new Date(z.at).getTime() - new Date(a.at).getTime()
    )[0];
    if (!latest) return false;
    const t = new Date(latest.at).getTime();
    return t >= monthStart.getTime() && t < monthEnd.getTime();
  }).length;
}
