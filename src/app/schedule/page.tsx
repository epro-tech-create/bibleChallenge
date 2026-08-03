import { db } from "@/lib/db";
import { PublicNav } from "@/components/layout/public-nav";
export const dynamic = "force-dynamic";
export default async function Schedule() {
  const rounds = await db.round.findMany({
    include: { challenge: true },
    orderBy: { scheduledAt: "asc" },
  });
  return (
    <>
      <PublicNav />
      <main className="shell py-12">
        <p className="eyebrow">Mark your calendar</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950">
          Challenge schedule
        </h1>
        <div className="mt-8 max-w-3xl space-y-3">
          {rounds.map((r) => (
            <article
              key={r.id}
              className="card flex items-center justify-between p-5"
            >
              <div>
                <p className="font-bold text-violet-950">{r.name}</p>
                <p className="text-sm text-slate-500">
                  {r.challenge.title} · {r.numberOfQuestions} questions
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">
                  {r.scheduledAt.toLocaleDateString()}
                </p>
                <span className={`status status-${r.status}`}>{r.status}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
