import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
export const dynamic = "force-dynamic";
export default async function AdminLeaderboard() {
  await requireRole("ADMIN");
  const challenge = await db.challenge.findFirst({
    orderBy: { challengeDate: "desc" },
  });
  const rows = challenge
    ? await db.challengeFamily.findMany({
        where: { challengeId: challenge.id },
        orderBy: { totalScore: "desc" },
        include: { family: true },
      })
    : [];
  return (
    <DashboardShell title="Leaderboard Management" role="ADMIN">
      <div className="max-w-3xl">
        <Leaderboard
          title={`${challenge?.title ?? "Challenge"} standings`}
          rows={rows.map((r, i) => ({
            position: i + 1,
            score: r.totalScore,
            family: r.family,
            qualified: r.qualificationStatus === "QUALIFIED",
          }))}
        />
        <p className="mt-4 text-sm text-slate-500">
          Scores recalculate after every auto-marked or manually marked answer
          and score adjustment.
        </p>
      </div>
    </DashboardShell>
  );
}
