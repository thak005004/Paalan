import 'server-only';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import {
  attachments,
  bills,
  confirmations,
  db,
  householdMembers,
  households,
  type SelectAttachment,
  type SelectBill,
  type SelectHouseholdMember,
  type SelectHousehold
} from '@/lib/db';

export type BillWithProof = SelectBill & {
  attachment: SelectAttachment | null;
  submitter: SelectHouseholdMember | null;
  confirmer: SelectHouseholdMember | null;
  confirmedAt: Date | null;
};

export async function getDemoHousehold(): Promise<SelectHousehold | null> {
  const [hh] = await db
    .select()
    .from(households)
    .orderBy(households.id)
    .limit(1);
  return hh ?? null;
}

export async function getHouseholdById(id: number) {
  const [hh] = await db
    .select()
    .from(households)
    .where(eq(households.id, id))
    .limit(1);
  return hh ?? null;
}

export async function getHouseholdMembers(householdId: number) {
  return db
    .select()
    .from(householdMembers)
    .where(eq(householdMembers.householdId, householdId));
}

export async function getBillsForHousehold(
  householdId: number
): Promise<BillWithProof[]> {
  const rows = await db
    .select()
    .from(bills)
    .where(eq(bills.householdId, householdId))
    .orderBy(desc(bills.createdAt));

  if (rows.length === 0) return [];

  const billIds = rows.map((b) => b.id);

  const att = await db
    .select()
    .from(attachments)
    .where(
      sql`${attachments.billId} IN (${sql.join(
        billIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );
  const attByBill = new Map<number, SelectAttachment>();
  for (const a of att) {
    if (!attByBill.has(a.billId)) attByBill.set(a.billId, a);
  }

  const conf = await db
    .select()
    .from(confirmations)
    .where(
      sql`${confirmations.billId} IN (${sql.join(
        billIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );
  const confByBill = new Map<number, (typeof conf)[number]>();
  for (const c of conf) confByBill.set(c.billId, c);

  const members = await getHouseholdMembers(householdId);
  const memberById = new Map(members.map((m) => [m.id, m]));

  return rows.map((b) => ({
    ...b,
    attachment: attByBill.get(b.id) ?? null,
    submitter: b.submittedByMemberId
      ? memberById.get(b.submittedByMemberId) ?? null
      : null,
    confirmer:
      confByBill.get(b.id)?.confirmedByMemberId !== undefined &&
      confByBill.get(b.id)?.confirmedByMemberId !== null
        ? memberById.get(
            confByBill.get(b.id)!.confirmedByMemberId as number
          ) ?? null
        : null
  }));
}

export async function getClosedLoopCount(
  householdId: number,
  since: Date
): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(distinct ${bills.id})` })
    .from(bills)
    .innerJoin(attachments, eq(attachments.billId, bills.id))
    .innerJoin(confirmations, eq(confirmations.billId, bills.id))
    .where(
      and(
        eq(bills.householdId, householdId),
        eq(bills.status, 'confirmed'),
        gte(confirmations.at, since)
      )
    );
  return Number(row?.value ?? 0);
}

export function startOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
