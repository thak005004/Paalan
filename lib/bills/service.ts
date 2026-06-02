import 'server-only';
import { and, eq } from 'drizzle-orm';
import {
  attachments,
  bills,
  confirmations,
  db,
  householdMembers,
  paymentIntents
} from '@/lib/db';
import { assertTransition, type BillStatus } from '@/lib/bills/lifecycle';
import {
  getIngestionProvider,
  type RawIngestionInput
} from '@/lib/ingestion/provider';
import { signConfirmToken } from '@/lib/confirm/token';
import { getNotifier } from '@/lib/notify/notifier';

function formatAmount(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  if (currency === 'INR') return `₹${major.toLocaleString('en-IN')}`;
  return `${currency} ${major.toLocaleString()}`;
}

export async function submitBillFromUpload(
  input: Omit<RawIngestionInput, 'source'>
) {
  const provider = getIngestionProvider('upload-link');
  const draft = await provider.ingest({ ...input, source: 'upload-link' });

  const [bill] = await db
    .insert(bills)
    .values({
      householdId: draft.householdId,
      title: draft.title,
      category: 'utility',
      amountMinor: draft.amountMinor,
      currency: draft.currency,
      dueDate: draft.dueDate,
      status: 'submitted',
      submittedByMemberId: draft.submittedByMemberId,
      submittedAt: new Date()
    })
    .returning();

  await db.insert(attachments).values({
    billId: bill.id,
    url: draft.attachmentUrl,
    kind: draft.attachmentKind,
    uploadedByMemberId: draft.submittedByMemberId
  });

  return bill;
}

function getBaseUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  );
}

export async function sendConfirmLink(
  billId: number,
  confirmerMemberId: number
) {
  const [bill] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, billId))
    .limit(1);
  if (!bill) throw new Error('Bill not found');

  const [member] = await db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.id, confirmerMemberId),
        eq(householdMembers.householdId, bill.householdId)
      )
    )
    .limit(1);
  if (!member) throw new Error('Confirmer is not in this household');
  if (!member.phone) {
    throw new Error('Confirmer has no phone number on file');
  }

  const token = signConfirmToken(bill.id, member.id);
  const link = `${getBaseUrl()}/confirm/${encodeURIComponent(token)}`;

  const notifier = getNotifier('sms');
  await notifier.send({
    to: member.phone,
    channel: 'sms',
    body: `Paalan: please confirm the ${bill.title} bill of ${formatAmount(
      bill.amountMinor,
      bill.currency
    )}.`,
    link
  });

  return { link, deliveredTo: member.phone };
}

export async function confirmBillByToken(
  token: string,
  verify: (t: string) => { billId: number; memberId: number } | null
) {
  const payload = verify(token);
  if (!payload) return { ok: false as const, reason: 'invalid-token' };

  const [bill] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, payload.billId))
    .limit(1);
  if (!bill) return { ok: false as const, reason: 'bill-not-found' };

  const [member] = await db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.id, payload.memberId),
        eq(householdMembers.householdId, bill.householdId)
      )
    )
    .limit(1);
  if (!member) return { ok: false as const, reason: 'member-not-in-household' };

  if (bill.status === 'confirmed') {
    return { ok: true as const, bill, alreadyConfirmed: true };
  }

  assertTransition(bill.status as BillStatus, 'confirmed');

  const now = new Date();
  await db
    .update(bills)
    .set({ status: 'confirmed', confirmedAt: now })
    .where(eq(bills.id, bill.id));

  await db.insert(confirmations).values({
    billId: bill.id,
    confirmedByMemberId: member.id,
    role: member.role,
    at: now
  });

  return { ok: true as const, bill: { ...bill, status: 'confirmed' as const } };
}

export async function recordPaymentIntent(
  householdId: number | null,
  userId: number | null,
  source: string = 'plan_bar'
) {
  await db.insert(paymentIntents).values({
    householdId: householdId ?? null,
    userId: userId ?? null,
    source
  });
}
