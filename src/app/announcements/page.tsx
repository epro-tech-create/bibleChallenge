import { db } from "@/lib/db";
import { PublicNav } from "@/components/layout/public-nav";
export const dynamic = "force-dynamic";
export default async function Announcements() {
  const items = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: true },
  });
  return (
    <>
      <PublicNav />
      <main className="shell py-12">
        <p className="eyebrow">Fellowship news</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950">
          Announcements
        </h1>
        <div className="mt-8 grid max-w-3xl gap-4">
          {items.map((a) => (
            <article key={a.id} className="card p-6">
              <p className="font-bold text-violet-950">{a.title}</p>
              <p className="mt-2 leading-7 text-slate-600">{a.message}</p>
              <p className="mt-4 text-xs font-bold text-slate-400">
                Posted by {a.createdBy.fullName}
              </p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
