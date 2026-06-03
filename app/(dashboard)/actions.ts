'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import {
  recordPaymentIntent,
  sendConfirmLink,
  submitBillFromUpload
} from '@/lib/bills/service';
import { bills, db, householdMembers } from '@/lib/db';

async function findParentConfirmer(householdId: number) {
  const [member] = await db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.role, 'parent')
      )
    )
    .limit(1);
  return member ?? null;
}

export async function sendConfirmLinkAction(
  billId: number
): Promise<{ ok: boolean; link?: string; error?: string }> {
  try {
    const [bill] = await db
      .select()
      .from(bills)
      .where(eq(bills.id, billId))
      .limit(1);
    if (!bill) return { ok: false, error: 'Bill not found' };

    const confirmer = await findParentConfirmer(bill.householdId);
    if (!confirmer) {
      return {
        ok: false,
        error: 'No parent member configured for this household'
      };
    }

    const out = await sendConfirmLink(billId, confirmer.id);
    return { ok: true, link: out.link };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function recordPaymentIntentAction(
  householdId: number
): Promise<{ ok: boolean }> {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  await recordPaymentIntent(householdId, userId, 'plan_bar');
  return { ok: true };
}

export async function addBillAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  billId?: number;
}> {
  try {
    const householdId = Number(formData.get('householdId'));
    const title = String(formData.get('title') ?? '').trim();
    const amount = Number(formData.get('amount'));
    const dueDateStr = String(formData.get('dueDate') ?? '');
    const submittedByMemberId = Number(formData.get('submittedBy'));
    const attachmentUrl =
      String(formData.get('attachmentUrl') ?? '').trim() ||
      `/uploads/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`;

    if (
      !householdId ||
      !title ||
      !amount ||
      !dueDateStr ||
      !submittedByMemberId
    ) {
      return { ok: false, error: 'Missing required fields' };
    }

    const bill = await submitBillFromUpload({
      householdId,
      submittedByMemberId,
      title,
      amountMinor: Math.round(amount * 100),
      currency: 'INR',
      dueDate: new Date(dueDateStr),
      attachmentUrl,
      attachmentKind: 'image'
    });

    revalidatePath('/');
    revalidatePath('/bills');
    return { ok: true, billId: bill.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
