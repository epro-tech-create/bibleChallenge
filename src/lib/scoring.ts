import { db } from "@/lib/db";

export async function recalculateFamilyScore(
  challengeId: string,
  familyId: string,
) {
  const [answers, adjustments] = await Promise.all([
    db.participantAnswer.aggregate({
      _sum: { marksAwarded: true },
      where: { participant: { challengeId, familyId } },
    }),
    db.scoreAdjustment.aggregate({
      _sum: { points: true },
      where: { challengeId, familyId },
    }),
  ]);
  const total =
    (answers._sum.marksAwarded ?? 0) + (adjustments._sum.points ?? 0);
  await db.challengeFamily.update({
    where: { challengeId_familyId: { challengeId, familyId } },
    data: { totalScore: total },
  });
  return total;
}

export async function recalculateLeaderboard(challengeId: string) {
  const rows = await db.challengeFamily.findMany({
    where: { challengeId },
    orderBy: { totalScore: "desc" },
  });
  return Promise.all(
    rows.map((row, index) =>
      db.challengeFamily.update({
        where: { id: row.id },
        data: {
          qualificationStatus: index < 3 ? "QUALIFIED" : "NOT_QUALIFIED",
        },
      }),
    ),
  );
}
