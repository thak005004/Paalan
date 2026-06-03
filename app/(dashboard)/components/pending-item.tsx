'use client';

import { useState, useTransition } from 'react';
import type { BillWithProof } from '@/lib/bills/queries';
import { sendConfirmLinkAction } from '@/app/(dashboard)/actions';

export function PendingItem({
  bill,
  amount,
  parentName
}: {
  bill: BillWithProof;
  amount: string;
  parentName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const submitter = bill.submitter?.name ?? 'helper';
  const submitterRole = bill.submitter?.role;
  const submitterLabel =
    submitterRole === 'parent'
      ? parentName
      : submitterRole === 'helper'
        ? `${submitter} (helper)`
        : submitter;

  function onSend() {
    setMsg(null);
    startTransition(async () => {
      const res = await sendConfirmLinkAction(bill.id);
      if (res.ok) {
        setMsg(`Link sent — check the server log for the magic link.`);
      } else {
        setMsg(res.error ?? 'Could not send link.');
      }
    });
  }

  const isOverdue = bill.status === 'overdue';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isOverdue
          ? 'border-paalan-rose/40 bg-paalan-rose/5'
          : 'border-[#efdfb6] bg-[#fffdf7]'
      }`}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[#efdfb6] bg-paalan-amber-tint text-xl">
        📶
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-paalan-ink">
          {bill.title} · {amount}
        </div>
        <div
          className={`mt-0.5 text-xs ${
            isOverdue ? 'text-paalan-rose' : 'text-paalan-amber'
          }`}
        >
          Submitted by {submitterLabel} · awaiting {parentName}
        </div>
        {msg && (
          <div className="mt-1 text-[11px] text-paalan-green">{msg}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onSend}
        disabled={pending}
        className="whitespace-nowrap rounded-full bg-paalan-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send link'}
      </button>
    </div>
  );
}
