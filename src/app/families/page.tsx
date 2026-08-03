import { db } from "@/lib/db";
import { PublicNav } from "@/components/layout/public-nav";
import { MapPin, Users } from "lucide-react";
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
      <main className="shell py-12 sm:py-16">
        <p className="eyebrow">Together we grow</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950">
          Participating families
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Meet the fellowship families learning, serving, and preparing for the
          next BibleChallenge together.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {families.length ? (
            families.map((f) => (
              <article key={f.id} className="card group overflow-hidden p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#104366] font-black text-[#e2a54d]">
                    {f.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-[#f9edd9] px-3 py-1 text-xs font-bold text-[#104366]">
                    DITSCF
                  </span>
                </div>
                <p className="mt-6 text-xl font-black text-violet-950">{f.name}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} /> {f.location}
                </p>
                <p className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-bold text-amber-700">
                  <Users size={16} /> {f._count.members} fellowship members
                </p>
              </article>
            ))
          ) : (
            <p className="card p-8 text-center text-slate-600 sm:col-span-2 lg:col-span-3">
              Participating families will appear here when registration opens.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
