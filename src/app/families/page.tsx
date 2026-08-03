import { db } from "@/lib/db";
import { PublicNav } from "@/components/layout/public-nav";
export const dynamic = "force-dynamic";
export default async function Families() {
  const families = await db.family.findMany({
    where: { status: "ACTIVE" },
    include: { _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <PublicNav />
      <main className="shell py-12">
        <p className="eyebrow">Together we grow</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950">
          Participating families
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((f) => (
            <article key={f.id} className="card p-6">
              <p className="text-xl font-black text-violet-950">{f.name}</p>
              <p className="mt-2 text-sm text-slate-500">DITSCF</p>
              <p className="mt-5 text-sm font-bold text-amber-700">
                {f._count.members} fellowship members
              </p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
