'use client';

import { useState } from 'react';
import type { BillWithProof } from '@/lib/bills/queries';

const ICONS: Record<string, string> = {
  Electricity: '🧾',
  Water: '💧',
  'Cooking gas': '🍳',
  Broadband: '📶',
  Internet: '📶',
  Rent: '🏠'
};

export function ProofItem({
  bill,
  amount,
  confirmerLine
}: {
  bill: BillWithProof;
  amount: string;
  confirmerLine: string;
}) {
  const [open, setOpen] = useState(false);
  const icon = ICONS[bill.title] ?? '🧾';

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-paalan-cream-border-soft bg-white p-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[#dceae2] bg-paalan-green-tint text-xl"
          aria-label={`View ${bill.title} receipt`}
        >
          {icon}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-paalan-ink">
            {bill.title} · {amount}
          </div>
          <div className="mt-0.5 text-xs text-paalan-green">
            {confirmerLine}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="whitespace-nowrap text-xs font-semibold text-paalan-green"
        >
          View ›
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-paalan-ink/70 p-6"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-52 items-center justify-center rounded-lg bg-paalan-green-tint text-5xl text-paalan-green-deep">
              {icon}
            </div>
            <div className="mt-3 text-xs text-paalan-muted-2">
              {bill.title} · {amount}
              {bill.attachment?.url && (
                <div className="mt-1 truncate text-[11px] text-paalan-muted">
                  {bill.attachment.url.split('/').pop()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 text-sm font-semibold text-paalan-green"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
