import { redirect } from 'next/navigation';
import {
  getDemoHousehold,
  getHouseholdMembers
} from '@/lib/bills/queries';
import { AddBillForm } from './form';

export const dynamic = 'force-dynamic';

export default async function NewBillPage() {
  const household = await getDemoHousehold();
  if (!household) {
    redirect('/');
  }
  const members = await getHouseholdMembers(household.id);

  const today = new Date();
  const dueDefault = new Date(today);
  dueDefault.setDate(today.getDate() + 7);

  return (
    <div className="space-y-4 px-4">
      <header className="px-1">
        <h1 className="text-base font-bold text-paalan-ink">
          Record a bill
        </h1>
        <p className="mt-1 text-xs text-paalan-muted-2">
          Attach a receipt or photo so {household.parentName} can confirm in
          one tap. Paalan never moves money — it just records and verifies.
        </p>
      </header>
      <AddBillForm
        householdId={household.id}
        members={members}
        dueDefault={dueDefault.toISOString().slice(0, 10)}
      />
    </div>
  );
}
