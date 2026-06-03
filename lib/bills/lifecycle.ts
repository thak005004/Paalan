import { and, countDistinct, eq, gte, lt, sql } from 'drizzle-orm';
import { db, bills, attachments, confirmations } from '@/lib/db';

// ---------------------------------------------------------------------------
// Pure bill lifecycle state machine (D1, D14).
// ---------------------------------------------------------------------------

export type BillStatus = 'due' | 'submitted' | 'confirmed' | 'overdue';
export type BillEvent = 'proof_attached' | 'confirmed' | 'due_date_passed';

export class IllegalTransitionError extends Error {
  constructor(
    public readonly current: BillStatus,
    public readonly event: BillEvent
  ) {
    super(`Illegal bill transition: cannot apply "${event}" to a "${current}" bill.`);
    this.name = 'IllegalTransitionError';
  }
}

// Legal transitions. `confirmed` is terminal (no outgoing events). A submitted
// bill that passes its due date stays submitted — proof exists, it's only
// awaiting confirmation, so it never becomes overdue.
const TRANSITIONS: Record<BillStatus, Partial<Record<BillEvent, BillStatus>>> = {
  due: {
    proof_attached: 'submitted',
    due_date_passed: 'overdue'
  },
  submitted: {
    confirmed: 'confirmed',
    due_date_passed: 'submitted'
  },
  overdue: {
    proof_attached: 'submitted'
  },
  confirmed: {}
};

/**
 * Apply a lifecycle event to the current status. Throws
 * {@link IllegalTransitionError} for any transition not in the table above.
 */
export function nextStatus(current: BillStatus, event: BillEvent): BillStatus {
  const next = TRANSITIONS[current][event];
  if (!next) {
    throw new IllegalTransitionError(current, event);
  }
  return next;
}

export type DerivableBill = {
  status: BillStatus;
  dueDate: string | Date | null;
  attachmentCount: number;
};

/**
 * Compute a bill's effective status from its raw fields. `confirmed` is
 * terminal; any bill with proof is `submitted` (and so never overdue); an
 * unproven bill is `overdue` once its due date has passed, otherwise `due`.
 */
export function deriveStatus(bill: DerivableBill, now: Date = new Date()): BillStatus {
  if (bill.status === 'confirmed') return 'confirmed';

  if (bill.attachmentCount > 0) return 'submitted';

  if (bill.dueDate) {
    const due = bill.dueDate instanceof Date ? bill.dueDate : new Date(bill.dueDate);
    if (due.getTime() < now.getTime()) return 'overdue';
  }

  return 'due';
}

// ---------------------------------------------------------------------------
// Closed trust loops metric (D16): distinct bills that reached `confirmed`
// with >= 1 attachment, whose confirmation falls within [monthStart, monthEnd).
// ---------------------------------------------------------------------------

export async function getClosedTrustLoops({
  householdId,
  monthStart,
  monthEnd
}: {
  householdId: string;
  monthStart: Date;
  monthEnd: Date;
}): Promise<number> {
  // The window field is the latest confirmation time per bill. (The schema has
  // no bills.updatedAt; a confirmed bill always carries a confirmation, so the
  // "fall back to updatedAt" case from the spec cannot arise here.)
  const latest = db
    .select({
      billId: confirmations.billId,
      confirmedAt: sql<string>`max(${confirmations.at})`.as('confirmed_at')
    })
    .from(confirmations)
    .groupBy(confirmations.billId)
    .as('latest');

  // Bounds are passed as ISO strings: the aliased `confirmed_at` carries no
  // type OID, so postgres-js can't serialize a raw Date here — Postgres casts
  // the string literals to timestamp.
  const [row] = await db
    .select({ value: countDistinct(bills.id) })
    .from(bills)
    .innerJoin(latest, eq(latest.billId, bills.id))
    .innerJoin(attachments, eq(attachments.billId, bills.id))
    .where(
      and(
        eq(bills.householdId, householdId),
        eq(bills.status, 'confirmed'),
        gte(latest.confirmedAt, monthStart.toISOString()),
        lt(latest.confirmedAt, monthEnd.toISOString())
      )
    );

  return row?.value ?? 0;
}
