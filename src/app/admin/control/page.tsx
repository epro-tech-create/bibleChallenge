import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  controlRound,
  resetQuizSession,
  startChallenge,
} from "@/app/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Countdown } from "@/components/quiz/countdown";
export const dynamic = "force-dynamic";
export default async function Control() {
  await requireRole("ADMIN");
  const session = await db.quizSession.findFirst({
    orderBy: { startedAt: "desc" },
    include: {
      round: {
        include: {
          challenge: true,
          questions: {
            where: { status: "READY" },
            orderBy: { chapter: "asc" },
          },
        },
      },
      answers: true,
      currentQuestion: true,
    },
  });
  if (!session)
    return (
      <DashboardShell title="Live Challenge Control" role="ADMIN">
        <p>No quiz session has been prepared.</p>
      </DashboardShell>
    );
  const checked = await db.challengeParticipant.count({
    where: { challengeId: session.round.challengeId, checkedIn: true },
  });
  const questionEndsAt =
    session.currentQuestionStartedAt && session.currentQuestion
      ? new Date(
          session.currentQuestionStartedAt.getTime() +
            session.currentQuestion.timeLimit * 1000,
        ).toISOString()
      : null;
  return (
    <DashboardShell title="Live Challenge Control Center" role="ADMIN">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="card p-6">
          <p className="eyebrow">{session.round.challenge.title}</p>
          <h2 className="mt-1 text-2xl font-black text-violet-950">
            {session.round.name}
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mr-auto">
              <p className="text-sm font-bold text-violet-950">
                Challenge status: {session.round.challenge.status.replaceAll("_", " ")}
              </p>
              <p className="text-xs text-slate-600">
                Starting manually activates the challenge immediately, regardless of its scheduled time.
              </p>
            </div>
            <form action={startChallenge}>
              <input
                type="hidden"
                name="challengeId"
                value={session.round.challengeId}
              />
              <button
                className="btn btn-gold text-sm"
                disabled={session.round.challenge.status === "ACTIVE"}
              >
                {session.round.challenge.status === "ACTIVE"
                  ? "Challenge active"
                  : "Start challenge now"}
              </button>
            </form>
          </div>
          <div className="mt-7 rounded-2xl bg-violet-950 p-6 text-white">
            <p className="text-xs font-bold tracking-widest text-amber-300">
              CURRENT QUESTION
            </p>
            <p className="mt-3 text-xl font-bold">
              {session.currentQuestion?.questionText ??
                "Select a question to open."}
            </p>
            <p className="mt-3 text-sm text-violet-200">
              {session.currentQuestion
                ? `${session.currentQuestion.marks} marks · ${session.currentQuestion.timeLimit} seconds`
                : ""}
            </p>
            {questionEndsAt && (
              <div className="mt-5">
                <Countdown
                  compact
                  label="Question time remaining"
                  target={questionEndsAt}
                />
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <form action={controlRound}>
              <input type="hidden" name="sessionId" value={session.id} />
              <input
                type="hidden"
                name="action"
                value={session.status === "ACTIVE" ? "PAUSE" : "START"}
              />
              <button className="btn btn-primary">
                {session.status === "ACTIVE" ? "Pause round" : "Start round"}
              </button>
            </form>
            <form action={controlRound}>
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="action" value="END" />
              <button className="btn btn-ghost">End round</button>
            </form>
            <form action={resetQuizSession}>
              <input type="hidden" name="sessionId" value={session.id} />
              <button className="btn border border-red-200 bg-red-50 text-red-700">
                Reset test session
              </button>
            </form>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {session.round.questions.map((q, i) => (
              <form key={q.id} action={controlRound}>
                <input type="hidden" name="sessionId" value={session.id} />
                <input type="hidden" name="action" value="OPEN_QUESTION" />
                <input type="hidden" name="questionId" value={q.id} />
                <button
                  className={`w-full rounded-xl border p-3 text-left text-sm font-bold ${session.currentQuestionId === q.id ? "border-violet-600 bg-violet-50" : "border-stone-200"}`}
                >
                  Question {i + 1}: Daniel {q.chapter}
                </button>
              </form>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <section className="card p-5">
            <p className="text-sm font-bold">Round status</p>
            <p className={`mt-2 status status-${session.status}`}>
              {session.status}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Checked in</dt>
                <dd className="font-bold">{checked}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Submissions</dt>
                <dd className="font-bold">{session.answers.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Not answered</dt>
                <dd className="font-bold">
                  {Math.max(0, checked - session.answers.length)}
                </dd>
              </div>
            </dl>
          </section>
          <a href="/leaderboard" className="btn btn-gold w-full">
            Open live leaderboard
          </a>
        </aside>
      </div>
    </DashboardShell>
  );
}
