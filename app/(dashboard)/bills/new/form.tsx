'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addBillAction } from '@/app/(dashboard)/actions';
import type { SelectHouseholdMember } from '@/lib/db';

export function AddBillForm({
  householdId,
  members,
  dueDefault
}: {
  householdId: number;
  members: SelectHouseholdMember[];
  dueDefault: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('householdId', String(householdId));
    startTransition(async () => {
      const res = await addBillAction(fd);
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(res.error ?? 'Could not record bill.');
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-xl border border-paalan-cream-border-soft bg-white p-4"
    >
      <Field label="Bill">
        <input
          name="title"
          required
          placeholder="Electricity"
          className="input"
        />
      </Field>

      <Field label="Amount (₹)">
        <input
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          placeholder="1240"
          className="input"
        />
      </Field>

      <Field label="Due date">
        <input
          name="dueDate"
          type="date"
          required
          defaultValue={dueDefault}
          className="input"
        />
      </Field>

      <Field label="Submitted by">
        <select name="submittedBy" required className="input">
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.role})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Receipt URL (optional)">
        <input
          name="attachmentUrl"
          placeholder="/uploads/receipt.jpg"
          className="input"
        />
        <p className="mt-1 text-[11px] text-paalan-muted">
          v1 records the URL only — uploads sit behind the IngestionProvider
          interface, so WhatsApp drops in later with no change here.
        </p>
      </Field>

      {error && (
        <p className="rounded-md bg-paalan-rose/10 px-3 py-2 text-xs text-paalan-rose">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-paalan-green px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? 'Recording…' : 'Record bill'}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.55rem 0.7rem;
          border-radius: 0.5rem;
          border: 1px solid #efe7d8;
          background: #fbf7f0;
          font-size: 14px;
          color: #1b1a17;
        }
        .input:focus {
          outline: 2px solid #0e7a5f;
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-paalan-muted-2">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
