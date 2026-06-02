import Link from 'next/link';
import Providers from './providers';
import { auth } from '@/lib/auth';
import { Home, Receipt, Users, Settings, Plus } from 'lucide-react';

export default async function PaalanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userInitial =
    session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase() ??
    'R';

  return (
    <Providers>
      <div className="min-h-screen bg-[linear-gradient(160deg,#f3ede0,#fbf7f0)]">
        <header className="sticky top-0 z-10 border-b border-paalan-cream-border bg-paalan-cream/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-paalan-green text-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2 4 7v6c0 4.5 3.5 8.3 8 9 4.5-.7 8-4.5 8-9V7l-8-5z" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-paalan-ink">
                Paalan
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <Link
                  href="/login"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-paalan-green text-sm font-medium text-white"
                  title={session.user.email ?? ''}
                >
                  {userInitial}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-medium text-paalan-green hover:underline"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-md pb-28 pt-4">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-paalan-cream-border-soft bg-white shadow-[0_-4px_18px_rgba(58,46,24,0.10)]">
          <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2.5">
            <NavItem href="/" label="Home" icon={<Home size={18} />} active />
            <NavItem
              href="/bills"
              label="Bills"
              icon={<Receipt size={18} />}
            />
            <Link
              href="/bills/new"
              className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-paalan-green text-white shadow-[0_4px_12px_rgba(14,122,95,0.35)]"
              aria-label="Add bill"
            >
              <Plus size={22} />
            </Link>
            <NavItem
              href="/household"
              label="Home"
              icon={<Users size={18} />}
            />
            <NavItem
              href="/login"
              label="You"
              icon={<Settings size={18} />}
            />
          </div>
        </nav>
      </div>
    </Providers>
  );
}

function NavItem({
  href,
  label,
  icon,
  active
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] ${
        active
          ? 'font-semibold text-paalan-green'
          : 'text-paalan-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
