import { db } from "@/lib/db";
import { PublicNav } from "@/components/layout/public-nav";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
export const dynamic = "force-dynamic";
export default async function PublicLeaderboard() {
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
    <>
      <PublicNav />
      <main className="shell py-12">
        <p className="eyebrow">Live scores</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950">
          Hall of Champions
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          The live family standings refresh automatically as answers are marked.
        </p>
        <div className="mt-8 max-w-3xl">
          <Leaderboard
            rows={rows.map((r, i) => ({
              position: i + 1,
              score: r.totalScore,
              family: r.family,
              qualified: r.qualificationStatus === "QUALIFIED",
            }))}
          />
        </div>
      </main>
    </>
  );
}
