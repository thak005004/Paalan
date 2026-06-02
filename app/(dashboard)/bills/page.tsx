import Link from 'next/link';
import {
  getBillsForHousehold,
  getDemoHousehold
} from '@/lib/bills/queries';
import { formatMoney, formatRelative } from '@/lib/format';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  due: 'Due',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  overdue: 'Overdue'
};

const STATUS_COLOR: Record<string, string> = {
  due: 'text-paalan-muted-2 bg-paalan-cream',
  submitted: 'text-paalan-amber bg-paalan-amber-tint',
  confirmed: 'text-paalan-green bg-paalan-green-tint',
  overdue: 'text-paalan-rose bg-paalan-rose/10'
};

export default async function BillsListPage() {
  const household = await getDemoHousehold();
  if (!household) {
    return (
      <div className="px-5 py-12 text-center text-sm text-paalan-muted-2">
        No household yet. Seed first.
      </div>
    );
  }
  const bills = await getBillsForHousehold(household.id);

  return (
    <div className="space-y-3 px-4">
      <div className="flex items-baseline justify-between px-1">
        <h1 className="text-base font-bold text-paalan-ink">
          {household.parentName}&apos;s bills
        </h1>
        <Link
          href="/bills/new"
          className="text-xs font-semibold text-paalan-green"
        >
          + Add
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-xl border border-paalan-cream-border-soft bg-white p-6 text-center text-sm text-paalan-muted-2">
          No bills yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {bills.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-paalan-cream-border-soft bg-white p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="truncate text-sm font-semibold text-paalan-ink">
                  {b.title}
                </div>
                <div className="text-sm font-semibold text-paalan-ink">
                  {formatMoney(b.amountMinor, b.currency, household.locale)}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[12px]">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                <span className="text-paalan-muted-2">
                  due {formatRelative(b.dueDate)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
