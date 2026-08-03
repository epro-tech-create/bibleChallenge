import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Users } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const challenges = await db.challenge.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { challengeDate: "asc" },
  });

  return (
    <>
      <PublicNav />
      <main className="shell py-12 sm:py-16">
        <p className="eyebrow">Read. Compete. Grow.</p>
        <h1 className="mt-2 text-4xl font-black text-violet-950 sm:text-5xl">
          Bible challenges
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Explore Scripture challenges, prepare with your family, and follow
          each competition from registration through the final round.
        </p>

        {challenges.length ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {challenges.map((challenge) => (
              <article key={challenge.id} className="card flex flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-violet-100 p-3 text-violet-800">
                    <BookOpen size={24} />
                  </div>
                  <span className={`status status-${challenge.status}`}>
                    {challenge.status.replaceAll("_", " ")}
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-black text-violet-950">
                  {challenge.title}
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  {challenge.description}
                </p>
                <dl className="mt-6 grid gap-4 border-y border-violet-100 py-5 text-sm sm:grid-cols-2">
                  <div className="flex gap-3">
                    <BookOpen className="shrink-0 text-amber-700" size={18} />
                    <div>
                      <dt className="font-semibold text-slate-500">Reading</dt>
                      <dd className="font-bold text-violet-950">
                        {challenge.bibleBook} {challenge.startChapter}-{challenge.endChapter}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Users className="shrink-0 text-amber-700" size={18} />
                    <div>
                      <dt className="font-semibold text-slate-500">Family entry</dt>
                      <dd className="font-bold text-violet-950">
                        {challenge.participantsPerFamily} challengers
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:col-span-2">
                    <CalendarDays className="shrink-0 text-amber-700" size={18} />
                    <div>
                      <dt className="font-semibold text-slate-500">Challenge date</dt>
                      <dd className="font-bold text-violet-950">
                        {challenge.challengeDate.toLocaleDateString()}
                      </dd>
                    </div>
                  </div>
                </dl>
                <Link href="/schedule" className="mt-6 inline-flex items-center gap-2 font-bold text-violet-800">
                  View challenge schedule <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="card mt-10 p-8 text-center">
            <h2 className="text-xl font-black text-violet-950">
              Challenges are being prepared
            </h2>
            <p className="mt-2 text-slate-600">
              Please check back soon for the next BibleChallenge.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
