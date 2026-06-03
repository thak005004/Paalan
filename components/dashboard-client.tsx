'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  Receipt,
  Plus,
  User as UserIcon,
  Lock,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

export type Money = { rupee: string; usd: string };
export type ConfirmedItem = {
  id: string;
  title: string;
  amount: Money;
  thumb: string | null;
  confirmedByLabel: string;
};
export type PendingItem = {
  id: string;
  title: string;
  amount: Money;
  submittedLabel: string;
};
export type DashboardData = {
  childName: string;
  parentName: string;
  householdName: string;
  paidVerified: number;
  dueCount: number;
  dueWhen: string;
  closedLoops: number;
  confirmed: ConfirmedItem[];
  pending: PendingItem[];
};

function Amount({ money }: { money: Money }) {
  return (
    <span className="shrink-0 font-semibold text-ink">
      {money.rupee} <span className="text-[0.78em] font-normal text-muted">{money.usd}</span>
    </span>
  );
}

export default function DashboardClient({
  data,
  serifClass
}: {
  data: DashboardData;
  serifClass: string;
}) {
  const [lightbox, setLightbox] = useState<ConfirmedItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const soon = () => setToast('Coming soon');

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream sm:max-w-2xl lg:max-w-7xl">
      {/* Demo banner */}
      <div className="flex items-center justify-between gap-3 bg-pinegreen-deep px-5 py-2.5 text-sm text-white">
        <span>You’re viewing a sample home in Pune</span>
        <a
          href="/"
          className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium transition hover:bg-white/25"
        >
          Start yours
        </a>
      </div>

      {/* Desktop top nav */}
      <header className="hidden items-center justify-between border-b border-cream-border bg-cream-card px-8 py-4 lg:flex">
        <span className={`text-3xl font-semibold text-pinegreen ${serifClass}`}>Paalan</span>
        <nav className="flex items-center gap-1">
          <TopNavItem icon={<Home className="h-5 w-5" />} label="Home" active />
          <TopNavItem icon={<Receipt className="h-5 w-5" />} label="Bills" onClick={soon} />
          <TopNavItem
            icon={
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pinegreen text-white">
                <Plus className="h-4 w-4" />
              </span>
            }
            label="Add"
            onClick={soon}
          />
          <TopNavItem icon={<UserIcon className="h-5 w-5" />} label="You" onClick={soon} />
        </nav>
      </header>

      <main className="flex-1 space-y-6 px-5 pb-28 pt-6 sm:space-y-8 sm:px-6 lg:px-8 lg:pb-12">
        {/* Greeting */}
        <h1 className={`text-2xl font-semibold text-ink ${serifClass}`}>
          Good evening, {data.childName}
        </h1>

        {/* Hero card */}
        <section className="rounded-2xl bg-gradient-to-br from-pinegreen to-pinegreen-deep px-6 py-7 text-white shadow-md">
          <div className={`flex items-center gap-2 text-3xl font-semibold ${serifClass}`}>
            <span>{data.parentName}’s all set</span>
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
          <p className="mt-1.5 text-white/85">Everything’s been handled today</p>
          <div className="mt-5 flex items-center gap-8 border-t border-white/20 pt-4 text-sm">
            <div>
              <div className="text-xl font-semibold">{data.paidVerified}</div>
              <div className="text-white/75">paid &amp; verified</div>
            </div>
            <div>
              <div className="text-xl font-semibold">{data.dueCount}</div>
              <div className="text-white/75">due {data.dueWhen}</div>
            </div>
          </div>
        </section>

        {/* Trust boundary + metric */}
        <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <div className="flex items-start gap-2 rounded-xl border border-cream-border bg-cream-card px-4 py-3 text-sm text-muted lg:items-center">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-pinegreen" />
            <p>
              Paalan records and verifies. It never touches your money or reads medical
              reports.
            </p>
          </div>
          <section className="rounded-2xl border border-cream-border bg-cream-card px-6 py-6 text-center">
            <div className={`text-6xl font-semibold text-pinegreen ${serifClass}`}>
              {data.closedLoops}
            </div>
            <div className="mt-2 text-sm font-medium text-ink">
              trust loops closed for {data.parentName} this month
            </div>
            <div className="mt-1 text-xs text-muted">each one: paid → proof → confirmed</div>
          </section>
        </div>

        {/* Recent proof + Needs a confirm */}
        <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Recent proof
            </h2>
            <div className="space-y-3">
              {data.confirmed.map((bill) => (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => setLightbox(bill)}
                  className="flex w-full items-center gap-3 rounded-xl border border-cream-border bg-cream-card p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-pinegreen/30 hover:shadow-md"
                >
                  {bill.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bill.thumb}
                      alt={`${bill.title} receipt`}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-cream-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-ink">{bill.title}</span>
                      <Amount money={bill.amount} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Check className="h-3.5 w-3.5 shrink-0 text-pinegreen" strokeWidth={3} />
                      <span className="truncate">{bill.confirmedByLabel}</span>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center text-sm font-medium text-pinegreen">
                    View <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Needs a confirm
            </h2>
            <div className="space-y-3">
              {data.pending.length === 0 && (
                <p className="text-sm text-muted">Nothing waiting — all caught up.</p>
              )}
              {data.pending.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber/30 bg-amber/5 p-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-ink">{bill.title}</div>
                    <div className="mt-0.5 text-xs text-muted">{bill.submittedLabel}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Amount money={bill.amount} />
                    <span className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-medium text-amber">
                      awaiting
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Plan / intent bar */}
        <section className="rounded-2xl border border-cream-border bg-cream-card px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Billing unit · {data.householdName}</span>
            <span className="rounded-full bg-pinegreen/10 px-2.5 py-0.5 text-xs font-medium text-pinegreen">
              Free beta
            </span>
          </div>
          <div className="mt-2 text-sm text-ink">
            After beta · ₹499/mo <span className="text-muted">(~$6)</span> per household
          </div>
          <button
            type="button"
            onClick={() => setPaid(true)}
            disabled={paid}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition ${
              paid
                ? 'bg-pinegreen/15 text-pinegreen'
                : 'bg-pinegreen text-white hover:bg-pinegreen-deep'
            }`}
          >
            {paid ? '✓ Thanks — we’ll be in touch!' : 'I’d pay for this'}
          </button>
        </section>
      </main>

      {/* Bottom nav (mobile/tablet) */}
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around border-t border-cream-border bg-cream-card px-2 py-2 sm:max-w-2xl lg:hidden">
        <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
        <NavItem icon={<Receipt className="h-5 w-5" />} label="Bills" onClick={soon} />
        <NavItem
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pinegreen text-white">
              <Plus className="h-5 w-5" />
            </span>
          }
          label="Add"
          onClick={soon}
        />
        <NavItem icon={<UserIcon className="h-5 w-5" />} label="You" onClick={soon} />
      </nav>

      {/* Proof lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-cream-card shadow-xl"
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
            >
              <X className="h-4 w-4" />
            </button>
            {lightbox.thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightbox.thumb}
                alt={`${lightbox.title} receipt`}
                className="max-h-[60vh] w-full object-cover"
              />
            )}
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold text-ink">{lightbox.title}</h3>
                <Amount money={lightbox.amount} />
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-pinegreen">
                <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                <span>{lightbox.confirmedByLabel}</span>
              </div>
              <p className="mt-3 text-xs text-muted">Tap outside or press Esc to close.</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 text-xs transition-colors ${
        active ? 'text-pinegreen' : 'text-muted hover:text-ink'
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
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'text-pinegreen' : 'text-muted hover:text-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
