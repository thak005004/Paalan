import Link from 'next/link';
import type { SelectHousehold } from '@/lib/db';

export function DemoBanner({
  household,
  signedIn
}: {
  household: SelectHousehold;
  signedIn: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#efdfb6] bg-paalan-amber-tint px-3 py-2 text-[12px] text-[#7a5d12]">
      <span>
        You&apos;re viewing a <b className="font-bold">sample home</b> in{' '}
        {household.displayName.split(' ')[0]}.
      </span>
      <Link
        href={signedIn ? '/bills/new' : '/login'}
        className="whitespace-nowrap rounded-full bg-paalan-green px-2.5 py-1.5 text-[11px] font-semibold text-white"
      >
        Start yours
      </Link>
    </div>
  );
}
