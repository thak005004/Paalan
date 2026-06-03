import { Cormorant_Garamond } from 'next/font/google';
import { getHomeHousehold, getMonthlyClosedLoops } from '@/lib/home-data';
import DashboardClient, { type DashboardData } from '@/components/dashboard-client';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'] });

// ₹ primary + rounded USD conversion (marketing-grade, ~₹83/$).
function money(minorUnits: number) {
  const rupees = Math.round(minorUnits / 100);
  const usd = Math.round(rupees / 83);
  return { rupee: '₹' + rupees.toLocaleString('en-IN'), usd: `(~$${usd})` };
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default async function AppDashboardPage() {
  const household = await getHomeHousehold();

  if (!household) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-ink">No demo household found.</p>
      </main>
    );
  }

  const parentName = household.parentName ?? 'your parent';
  const childName =
    household.members.find((m) => m.role === 'child')?.displayName ?? 'there';

  const bills = household.bills;
  const confirmed = bills.filter((b) => b.status === 'confirmed');
  const pending = bills.filter((b) => b.status === 'submitted');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const closedLoops = await getMonthlyClosedLoops(household, monthStart, monthEnd);

  const dueBills = bills.filter((b) => b.status !== 'confirmed');
  const dueDates = dueBills
    .filter((b) => b.dueDate)
    .map((b) => new Date(b.dueDate as string))
    .sort((a, z) => a.getTime() - z.getTime());
  let dueWhen = 'soon';
  if (dueDates.length) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((dueDates[0].getTime() - startOfToday.getTime()) / 86_400_000);
    dueWhen = days <= 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`;
  }

  const data: DashboardData = {
    childName,
    parentName,
    householdName: household.displayName,
    paidVerified: confirmed.length,
    dueCount: dueBills.length,
    dueWhen,
    closedLoops,
    confirmed: confirmed.map((b) => {
      const latest = [...b.confirmations].sort(
        (a, z) => new Date(z.at).getTime() - new Date(a.at).getTime()
      )[0];
      return {
        id: b.id,
        title: b.title,
        amount: money(b.amount),
        thumb: b.attachments[0]?.url ?? null,
        confirmedByLabel: latest
          ? `confirmed by ${latest.confirmedBy} · ${timeAgo(new Date(latest.at))}`
          : 'confirmed'
      };
    }),
    pending: pending.map((b) => ({
      id: b.id,
      title: b.title,
      amount: money(b.amount),
      submittedLabel: `submitted by ${b.submittedBy ?? '—'} · ${timeAgo(new Date(b.createdAt))}`
    }))
  };

  return <DashboardClient data={data} serifClass={serif.className} />;
}
