export function Hero({
  parentName,
  householdName,
  paidCount,
  upcomingCount
}: {
  parentName: string;
  householdName: string;
  paidCount: number;
  upcomingCount: number;
}) {
  const allSet = upcomingCount === 0 && paidCount > 0;
  const sub = allSet
    ? `Everything's been handled today.`
    : upcomingCount === 0
      ? `Nothing scheduled today.`
      : `${upcomingCount} bill${upcomingCount === 1 ? '' : 's'} coming up.`;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(150deg,#0e7a5f,#0b5f4a)] p-5 text-white">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.07]" />
      <p className="text-[12.5px] opacity-85">
        {parentName} · {householdName}
      </p>
      <h1 className="mt-1 text-[23px] font-bold tracking-tight">
        {parentName}&apos;s all set ✓
      </h1>
      <p className="mt-1 text-[13px] opacity-90">{sub}</p>

      <div className="relative mt-4 flex gap-5">
        <Stat n={paidCount} label="paid & verified" />
        <Stat n={upcomingCount} label="awaiting confirm" />
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-lg font-bold">{n}</div>
      <div className="text-[11px] opacity-80">{label}</div>
    </div>
  );
}
