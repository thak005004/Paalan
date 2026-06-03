'use server';

import { revalidatePath } from 'next/cache';
import { confirmBillByToken } from '@/lib/bills/service';
import { verifyConfirmToken } from '@/lib/confirm/token';

export async function confirmTokenAction(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const result = await confirmBillByToken(token, verifyConfirmToken);
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.reason === 'invalid-token'
          ? 'This link is no longer valid.'
          : result.reason === 'bill-not-found'
            ? "We couldn't find this bill."
            : 'You cannot confirm this bill.'
    };
  }
  revalidatePath('/');
  revalidatePath('/bills');
  return { ok: true };
}
