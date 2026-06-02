'use client';

import { useState, useTransition } from 'react';
import { formatRelative } from '@/lib/format';
import { confirmTokenAction } from './actions';

export function ConfirmCard({
  token,
  amount,
  title,
  submitterLine,
  submittedAt,
  attachmentUrl,
  confirmerName,
  alreadyConfirmed
}: {
  token: string;
  amount: string;
  title: string;
  submitterLine: string;
  submittedAt: Date;
  attachmentUrl: string | null;
  confirmerName: string;
  alreadyConfirmed: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(alreadyConfirmed);
  const [error, setError] = useState<string | null>(null);
  const [proofOpen, setProofOpen] = useState(false);

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await confirmTokenAction(token);
      if (res.ok) {
        setConfirmed(true);
      } else {
        setError(res.error ?? 'Could not confirm — please try again.');
      }
    });
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-paalan-cream-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-paalan-green-tint text-3xl text-paalan-green">
          ✓
        </div>
        <h2 className="text-lg font-bold text-paalan-ink">
          Thank you, {confirmerName}!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-paalan-muted-2">
          Your family member can now see this bill is paid, with the receipt
          attached. Nothing else to do.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-paalan-cream-border bg-white p-5 shadow-sm">
      <p className="text-[13px] text-paalan-muted-2">
        Your family is tracking this bill for you.
      </p>

      <div className="mt-3 rounded-xl border border-paalan-cream-border bg-paalan-cream p-4">
        <div className="text-[19px] font-extrabold text-paalan-ink">
          {title} · {amount}
        </div>
        <div className="mt-1 text-[12.5px] text-paalan-muted-2">
          {submitterLine} · {formatRelative(submittedAt)}
        </div>
        <button
          type="button"
          onClick={() => setProofOpen(true)}
          className="mt-3 flex h-[90px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#bcd6c9] bg-paalan-green-tint text-[13px] text-paalan-green-deep"
        >
          🧾{' '}
          {attachmentUrl
            ? `${attachmentUrl.split('/').pop()} — tap to view`
            : 'No receipt attached'}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-paalan-rose/10 px-3 py-2 text-xs text-paalan-rose">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className="mt-4 w-full rounded-xl bg-paalan-green px-3 py-3.5 text-base font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Confirming…' : 'Yes, this is correct ✓'}
      </button>
      <button
        type="button"
        className="mt-1 w-full py-2 text-[13px] font-semibold text-paalan-rose"
        onClick={() =>
          setError(
            'Tell your family there is an issue — the confirm-deny flow ships in v1.1.'
          )
        }
      >
        Something&apos;s wrong
      </button>

      {proofOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-paalan-ink/70 p-6"
          onClick={() => setProofOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-56 items-center justify-center rounded-lg bg-paalan-green-tint text-5xl text-paalan-green-deep">
              🧾
            </div>
            <div className="mt-3 text-xs text-paalan-muted-2">
              {attachmentUrl?.split('/').pop() ?? 'No receipt'}
            </div>
            <button
              type="button"
              onClick={() => setProofOpen(false)}
              className="mt-3 text-sm font-semibold text-paalan-green"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
