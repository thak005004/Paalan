export function MetricCard({
  count,
  parentName
}: {
  count: number;
  parentName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#e2d8c2] bg-white p-3">
      <div className="text-[26px] font-extrabold leading-none text-paalan-green">
        {count}
      </div>
      <div className="text-[12px] leading-snug text-paalan-muted-2">
        <b className="font-semibold text-paalan-ink">trust loops closed</b> for{' '}
        {parentName} this month
        <br />
        each one: paid → proof → confirmed
      </div>
    </div>
  );
}
