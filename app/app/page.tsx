import { getHomeHousehold, getMonthlyClosedLoops } from '@/lib/home-data';
import {
  Home,
  Receipt,
  Plus,
  User as UserIcon,
  Lock,
  ChevronRight,
  Check
} from 'lucide-react';

function formatINR(minorUnits: number): string {
  return '₹' + Math.round(minorUnits / 100).toLocaleString('en-IN');
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

export default async function HomePage() {
  const household = await getHomeHousehold();

  if (!household) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-ink">No demo household found.</p>
        <p className="mt-2 text-sm text-muted">
          Run <code className="rounded bg-cream-border px-1.5 py-0.5">bun run db:seed</code> to
          create the “Amma · Pune” sample.
        </p>
      </main>
    );
  }

  const parentName = household.parentName ?? 'your parent';
  const child = household.members.find((m) => m.role === 'child');
  const childName = child?.displayName ?? 'there';

  const bills = household.bills;
  const confirmed = bills.filter((b) => b.status === 'confirmed');
  const pending = bills.filter((b) => b.status === 'submitted');

  // Closed trust loops for the current calendar month (D16).
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const closedLoops = await getMonthlyClosedLoops(household, monthStart, monthEnd);

  // "N due in X days": nearest due date among not-yet-confirmed bills.
  const dueBills = bills.filter((b) => b.status !== 'confirmed');
  const dueDates = dueBills
    .filter((b) => b.dueDate)
    .map((b) => new Date(b.dueDate as string))
    .sort((a, z) => a.getTime() - z.getTime());
  let dueLabel = `${dueBills.length} due`;
  if (dueDates.length) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((dueDates[0].getTime() - startOfToday.getTime()) / 86_400_000);
    const when = days <= 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`;
    dueLabel = `${dueBills.length} due ${when}`;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream sm:max-w-2xl lg:max-w-7xl">
      {/* Demo banner */}
      <div className="flex items-center justify-between gap-3 bg-pinegreen-deep px-5 py-2.5 text-sm text-white">
        <span>You’re viewing a sample home in Pune</span>
        <button
          type="button"
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
        >
          Start yours
        </button>
      </div>

      {/* Desktop top nav (replaces the bottom tab bar at lg+) */}
      <header className="hidden items-center justify-between border-b border-cream-border bg-cream-card px-8 py-4 lg:flex">
        <span
          className="text-2xl font-semibold text-pinegreen"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Paalan
        </span>
        <nav className="flex items-center gap-1">
          <TopNavItem icon={<Home className="h-5 w-5" />} label="Home" active />
          <TopNavItem icon={<Receipt className="h-5 w-5" />} label="Bills" />
          <TopNavItem
            icon={
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pinegreen text-white">
                <Plus className="h-4 w-4" />
              </span>
            }
            label="Add"
          />
          <TopNavItem icon={<UserIcon className="h-5 w-5" />} label="You" />
        </nav>
      </header>

      <main className="flex-1 space-y-6 px-5 pb-28 pt-6 sm:space-y-8 sm:px-6 lg:px-8 lg:pb-12">
        {/* Greeting */}
        <h1 className="text-xl font-semibold text-ink">Good evening, {childName}</h1>

        {/* Hero card */}
        <section className="rounded-2xl bg-pinegreen px-6 py-7 text-white shadow-sm">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <span>{parentName}’s all set</span>
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
          <p className="mt-1 text-white/80">Everything’s been handled today</p>
          <div className="mt-5 flex items-center gap-6 border-t border-white/20 pt-4 text-sm">
            <div>
              <div className="text-lg font-semibold">{confirmed.length}</div>
              <div className="text-white/75">paid &amp; verified</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{dueBills.length}</div>
              <div className="text-white/75">{dueLabel.replace(`${dueBills.length} due`, 'due').trim()}</div>
            </div>
          </div>
        </section>

        {/* Trust boundary + metric: stacked on mobile, two cards on desktop */}
        <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Trust boundary line (D17 — exact wording) */}
        <div className="flex items-start gap-2 rounded-xl border border-cream-border bg-cream-card px-4 py-3 text-sm text-muted lg:items-center">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-pinegreen" />
          <p>
            Paalan records and verifies. It never touches your money or reads medical
            reports.
          </p>
        </div>

        {/* Closed trust loops metric */}
        <section className="rounded-2xl border border-cream-border bg-cream-card px-6 py-6 text-center">
          <div className="text-5xl font-bold text-pinegreen">{closedLoops}</div>
          <div className="mt-2 text-sm font-medium text-ink">
            trust loops closed for {parentName} this month
          </div>
          <div className="mt-1 text-xs text-muted">each one: paid → proof → confirmed</div>
        </section>
        </div>

        {/* Recent proof + Needs a confirm: stacked on mobile, 2-col on desktop */}
        <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Recent proof */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Recent proof
          </h2>
          <div className="space-y-3">
            {confirmed.map((bill) => {
              const thumb = bill.attachments[0]?.url;
              const latestConfirm = [...bill.confirmations].sort(
                (a, z) => new Date(z.at).getTime() - new Date(a.at).getTime()
              )[0];
              return (
                <div
                  key={bill.id}
                  className="flex items-center gap-3 rounded-xl border border-cream-border bg-cream-card p-3"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={`${bill.title} receipt`}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-cream-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-ink">{bill.title}</span>
                      <span className="shrink-0 font-semibold text-ink">
                        {formatINR(bill.amount)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Check className="h-3.5 w-3.5 text-pinegreen" strokeWidth={3} />
                      <span className="truncate">
                        confirmed by {latestConfirm?.confirmedBy ?? '—'}
                        {latestConfirm ? ` · ${timeAgo(new Date(latestConfirm.at))}` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex shrink-0 items-center text-sm font-medium text-pinegreen"
                  >
                    View <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Needs a confirm */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Needs a confirm
          </h2>
          <div className="space-y-3">
            {pending.length === 0 && (
              <p className="text-sm text-muted">Nothing waiting — all caught up.</p>
            )}
            {pending.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber/30 bg-amber/5 p-4"
              >
                <div className="min-w-0">
                  <div className="font-medium text-ink">{bill.title}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    submitted by {bill.submittedBy ?? '—'} · {timeAgo(new Date(bill.createdAt))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-ink">{formatINR(bill.amount)}</span>
                  <span className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-medium text-amber">
                    awaiting
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        </div>

        {/* Plan / intent bar (D15/D19) */}
        <section className="rounded-2xl border border-cream-border bg-cream-card px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Billing unit · {household.displayName}</span>
            <span className="rounded-full bg-pinegreen/10 px-2.5 py-0.5 text-xs font-medium text-pinegreen">
              Free beta
            </span>
          </div>
          <div className="mt-2 text-sm text-ink">After beta · ₹499/mo per household</div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-pinegreen py-3 text-sm font-semibold text-white hover:bg-pinegreen-deep"
          >
            I’d pay for this
          </button>
        </section>
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around border-t border-cream-border bg-cream-card px-2 py-2 sm:max-w-2xl lg:hidden">
        <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
        <NavItem icon={<Receipt className="h-5 w-5" />} label="Bills" />
        <NavItem
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pinegreen text-white">
              <Plus className="h-5 w-5" />
            </span>
          }
          label="Add"
        />
        <NavItem icon={<UserIcon className="h-5 w-5" />} label="You" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex flex-1 flex-col items-center gap-1 text-xs ${
        active ? 'text-pinegreen' : 'text-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function TopNavItem({
  icon,
  label,
  active = false
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'text-pinegreen' : 'text-muted hover:text-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
