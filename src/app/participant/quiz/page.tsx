import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QuizCard } from "@/components/quiz/quiz-card";
export const dynamic = "force-dynamic";
export default async function Quiz() {
  const user = await requireRole("PARTICIPANT");
  const member = await db.familyMember.findUniqueOrThrow({
    where: { userId: user.user.id },
  });
  const participant = await db.challengeParticipant.findFirst({
    where: { familyMemberId: member.id, approvalStatus: "APPROVED" },
  });
  const quiz = participant
    ? await db.quizSession.findFirst({
        where: {
          status: "ACTIVE",
          round: { challengeId: participant.challengeId },
        },
        include: {
          currentQuestion: { include: { options: true } },
          round: { include: { challenge: true } },
        },
      })
    : null;
  return (
    <DashboardShell title="Active Challenge" role="PARTICIPANT">
      {!participant ? (
        <p>You are not selected for an active challenge.</p>
      ) : !quiz ? (
        <section className="card max-w-xl p-7">
          <p className="eyebrow">Waiting room</p>
          <h2 className="mt-2 text-2xl font-black">
            The administrator will open the round shortly.
          </h2>
          <p className="mt-3 text-slate-600">
            Stay connected. This page refreshes every few seconds.
          </p>
        </section>
      ) : quiz.currentQuestion && quiz.currentQuestionStartedAt ? (
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold text-slate-600">
            {quiz.round.challenge.title} · {quiz.round.name}
          </p>
          <QuizCard
            question={quiz.currentQuestion}
            sessionId={quiz.id}
            participantId={participant.id}
            startedAt={quiz.currentQuestionStartedAt.toISOString()}
          />
        </div>
      ) : (
        <p>Waiting for the next question.</p>
      )}
    </DashboardShell>
  );
}
