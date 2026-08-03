import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays, Crown, Users } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { db } from "@/lib/db";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
export const dynamic = "force-dynamic";

export default async function Home() {
  const [challenge, families] = await Promise.all([
    db.challenge.findFirst({
      where: { status: { in: ["ACTIVE", "REGISTRATION_OPEN"] } },
      orderBy: { challengeDate: "asc" },
    }),
    db.challengeFamily.findMany({
      take: 5,
      orderBy: { totalScore: "desc" },
      include: { family: true },
    }),
  ]);
  const rows = families.map((f, i) => ({
    position: i + 1,
    score: f.totalScore,
    family: f.family,
  }));
  return (
    <>
      <PublicNav
        countdownTarget={challenge?.challengeDate.toISOString()}
      />
      <main>
        <section className="relative overflow-hidden bg-[#104366] py-14 text-white sm:py-20 lg:py-24">
          <Image
            src="/bible-challenge-hero.jpg"
            alt="DITSCF fellowship members"
            fill
            priority
            sizes="100vw"
            className="scale-x-[-1] object-cover object-[72%_center] opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#104366] via-[#104366]/90 to-[#104366]/25" />
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(#e2a54d_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="shell relative z-10 grid items-center gap-8 lg:gap-14 lg:grid-cols-[1.2fr_.8fr]">
            <div className="max-w-3xl py-2 sm:py-5">
              <p className="eyebrow text-amber-300">
                DITSCF Fellowship presents
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Welcome to DITSCF BibleChallenge
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-violet-100 sm:text-lg sm:leading-8">
                A joyful family-based Scripture competition by DITSCF
                Fellowship. Study together, represent your family, answer
                challenging questions and grow in the Word.
              </p>
              <p className="mt-5 font-bold text-white">Read. Compete. Grow.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/challenges" className="btn btn-gold">
                  Explore the Challenge <ArrowRight size={16} />
                </Link>
                <Link href="/families" className="btn border border-white/30">
                  View Families
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-[#104366]/60 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <Crown className="text-[#e2a54d]" size={38} />
                {challenge && (
                  <span className="rounded-full border border-[#e2a54d]/50 bg-[#e2a54d]/10 px-3 py-1 text-xs font-black text-[#e2a54d]">
                    {challenge.status.replaceAll("_", " ")}
                  </span>
                )}
              </div>
              <p className="mt-5 text-sm font-semibold text-white">
                CURRENT CHALLENGE
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {challenge?.title ?? "Daniel: Courage & Kingdoms"}
              </h2>
              <p className="mt-4 text-white">
                {challenge
                  ? `${challenge.bibleBook} ${challenge.startChapter}–${challenge.endChapter}`
                  : "Daniel Chapters 1–12"}
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                {challenge?.description ??
                  "Study together, represent your family, and grow in the Word."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Starts
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {challenge
                      ? `${challenge.challengeDate.toLocaleDateString()} · 11:45`
                      : "Today · 11:45"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Family entry
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {challenge
                      ? `${challenge.participantsPerFamily} challengers`
                      : "2 challengers"}
                  </p>
                </div>
              </div>
              <Link
                href="/schedule"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#e2a54d]"
              >
                Challenge schedule <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
        <section className="shell grid gap-5 py-10 sm:grid-cols-3 sm:py-14">
          <Feature
            icon={<Users />}
            title="Grow as a family"
            text="Learn Scripture together and represent your fellowship family."
          />
          <Feature
            icon={<BookOpen />}
            title="Test your knowledge"
            text="Face thoughtful Bible challenges one challenge round at a time."
          />
          <Feature
            icon={<CalendarDays />}
            title="Celebrate every step"
            text="Track progress, qualify onward, and crown champions."
          />
        </section>
        <section className="shell grid gap-8 pb-16 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="eyebrow">Your first challenge</p>
            <h2 className="mt-2 text-3xl font-black text-violet-950">
              Daniel: Courage & Kingdoms
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              Twelve chapters of faith, wisdom and courage. Gather your family,
              sharpen your knowledge, and prepare for the Crown Round.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/leaderboard" className="btn btn-primary">
                Live scores
              </Link>
              <Link href="/schedule" className="btn btn-ghost">
                Challenge schedule
              </Link>
            </div>
          </div>
          <Leaderboard rows={rows} />
        </section>
      </main>
    </>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="card flex min-h-52 flex-col p-6 sm:p-7">
      <div className="mb-5 inline-flex w-fit rounded-xl bg-violet-100 p-3 text-violet-800">
        {icon}
      </div>
      <h2 className="font-bold text-violet-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
