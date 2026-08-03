import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  await requireRole("ADMIN");
  const [families, members, challengers, questions, challenge, recent] =
    await Promise.all([
      db.family.count({ where: { status: "ACTIVE" } }),
      db.familyMember.count(),
      db.challengeParticipant.count({ where: { approvalStatus: "APPROVED" } }),
      db.question.count({ where: { status: "READY" } }),
      db.challenge.findFirst({ orderBy: { challengeDate: "desc" } }),
      db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    ]);
  const standings = challenge
    ? await db.challengeFamily.findMany({
        where: { challengeId: challenge.id },
        orderBy: { totalScore: "desc" },
        include: { family: true },
      })
    : [];
  return (
    <DashboardShell title="Admin Challenge Desk" role="ADMIN">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active families"
          value={families}
          detail="DITSCF"
        />
        <StatCard
          label="Registered members"
          value={members}
          detail="Ready to be selected"
        />
        <StatCard
          label="Selected challengers"
          value={challengers}
          detail="Approved for the current challenge"
        />
        <StatCard
          label="Questions prepared"
          value={questions}
          detail="Question bank is growing"
        />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <Leaderboard
          rows={standings.map((s, i) => ({
            position: i + 1,
            score: s.totalScore,
            family: s.family,
          }))}
        />
        <section className="card p-5">
          <p className="eyebrow">Challenge pulse</p>
          <h2 className="mt-1 text-xl font-black text-violet-950">
            {challenge?.title ?? "Create your first challenge"}
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Scripture focus</dt>
              <dd className="font-bold">
                {challenge
                  ? `${challenge.bibleBook} ${challenge.startChapter}–${challenge.endChapter}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-bold text-emerald-700">
                {challenge?.status.replaceAll("_", " ") ?? "DRAFT"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Recent activity</dt>
              <dd className="font-bold">{recent.length} logged events</dd>
            </div>
          </dl>
        </section>
      </div>
    </DashboardShell>
  );
}
