export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-violet-950">{value}</p>
      <p className="mt-1 text-xs text-emerald-700">{detail}</p>
    </article>
  );
}
