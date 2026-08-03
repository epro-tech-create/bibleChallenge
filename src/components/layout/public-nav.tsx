import Link from "next/link";
import { BookOpen, Trophy } from "lucide-react";
import { HeaderCountdown } from "@/components/layout/header-countdown";

export function PublicNav({ countdownTarget }: { countdownTarget?: string }) {
  return (
    <nav className="border-b border-violet-100 bg-white/90">
      <div className="shell flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-[#104366]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#104366] text-[#e2a54d]">
            <BookOpen size={19} />
          </span>
          <span>BibleChallenge</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/challenges">Challenges</Link>
          <Link href="/families">Families</Link>
          <Link href="/schedule">Schedule</Link>
          <Link href="/announcements">News</Link>
          <Link href="/leaderboard">Hall of Champions</Link>
        </div>
        <div className="flex items-center gap-3">
          {countdownTarget && <HeaderCountdown target={countdownTarget} />}
          <Link href="/login" className="btn btn-primary text-sm">
            <Trophy size={16} />
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
