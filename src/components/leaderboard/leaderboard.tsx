type Row = {
  position?: number | null;
  score: number;
  family: { name: string };
  participants?: number;
  qualified?: boolean;
};
export function Leaderboard({
  rows,
  title = "Hall of Champions",
}: {
  rows: Row[];
  title?: string;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-4">
        <h2 className="font-bold text-violet-950">{title}</h2>
        <span className="text-xs font-bold text-amber-700">LIVE</span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.length ? (
          rows.map((row, i) => (
            <div
              key={row.family.name}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-4"
            >
              <strong className={i < 3 ? "text-amber-600" : "text-slate-400"}>
                #{row.position ?? i + 1}
              </strong>
              <div>
                <p className="font-semibold">{row.family.name}</p>
                <p className="text-xs text-slate-500">
                  {row.participants ?? 0} challengers{" "}
                  {row.qualified ? "· Qualified" : ""}
                </p>
              </div>
              <strong className="text-violet-800">
                {row.score.toFixed(1)}
              </strong>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-slate-500">
            Scores will appear once the challenge begins.
          </p>
        )}
      </div>
    </section>
  );
}
