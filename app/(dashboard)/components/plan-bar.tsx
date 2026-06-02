'use client';

import { useState, useTransition } from 'react';
import { recordPaymentIntentAction } from '@/app/(dashboard)/actions';

export function PlanBar({
  householdId,
  householdName,
  currency
}: {
  householdId: number;
  householdName: string;
  currency: string;
}) {
  const [pending, startTransition] = useTransition();
  const [recorded, setRecorded] = useState(false);
  const priceLabel = currency === 'INR' ? '₹499/mo' : `${currency} 6/mo`;

  function onTap() {
    if (recorded) return;
    startTransition(async () => {
      await recordPaymentIntentAction(householdId);
      setRecorded(true);
    });
  }

  return (
    <div className="rounded-xl border border-paalan-cream-border-soft bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] text-paalan-muted-2">
          Billing unit ·{' '}
          <b className="font-semibold text-paalan-ink">{householdName}</b>
        </span>
        <span className="text-[12.5px] text-paalan-muted-2">
          <b className="font-semibold text-paalan-ink">Free beta</b>
        </span>
      </div>
      <div className="mt-1.5 text-[12.5px] text-paalan-muted-2">
        After beta ·{' '}
        <b className="font-semibold text-paalan-ink">{priceLabel}</b> per
        household
      </div>
      <button
        type="button"
        onClick={onTap}
        disabled={pending || recorded}
        className={`mt-3 w-full rounded-lg border border-paalan-green px-3 py-2.5 text-[13px] font-semibold transition-colors ${
          recorded
            ? 'bg-paalan-green text-white'
            : 'bg-white text-paalan-green hover:bg-paalan-green-tint'
        }`}
      >
        {recorded
          ? "Thanks — we'll hold your founding price ✓"
          : pending
            ? 'Saving…'
            : "I'd pay for this"}
      </button>
    </div>
  );
}
