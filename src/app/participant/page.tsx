import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
export const dynamic = "force-dynamic";
export default async function Participant() {
  const user = await requireRole("PARTICIPANT");
  const member = await db.familyMember.findUnique({
    where: { userId: user.user.id },
    include: {
      family: true,
      challengeParticipations: { include: { challenge: true } },
    },
  });
  return (
    <DashboardShell title="Challenger Dashboard" role="PARTICIPANT">
      <section className="card max-w-2xl p-7">
        <p className="eyebrow">Welcome, Challenger</p>
        <h2 className="mt-2 text-3xl font-black text-violet-950">
          {member?.fullName}
        </h2>
        <p className="mt-2 text-slate-600">
          Representing {member?.family.name ?? "your fellowship family"}.
        </p>
        {member?.challengeParticipations[0] ? (
          <div className="mt-6 rounded-xl bg-amber-50 p-5">
            <p className="font-bold">
              {member.challengeParticipations[0].challenge.title}
            </p>
            <p className="mt-1 text-sm">
              Your code:{" "}
              <strong>
                {member.challengeParticipations[0].participantCode}
              </strong>
            </p>
            <a href="/participant/quiz" className="btn btn-primary mt-4">
              Go to waiting room
            </a>
          </div>
        ) : (
          <p className="mt-6 text-sm">
            Your family leader will confirm your challenger selection.
          </p>
        )}
      </section>
    </DashboardShell>
  );
}
