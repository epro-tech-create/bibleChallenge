"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Trophy,
  ScrollText,
  LogOut,
} from "lucide-react";
const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/families", label: "Families", icon: Users },
  { href: "/admin/questions", label: "Question bank", icon: ScrollText },
  { href: "/admin/control", label: "Live control", icon: ScrollText },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
];
const participantLinks = [
  { href: "/participant", label: "My challenge", icon: LayoutDashboard },
  { href: "/participant/quiz", label: "Waiting room", icon: ScrollText },
  { href: "/leaderboard", label: "Family standings", icon: Trophy },
];
export function DashboardShell({
  children,
  title,
  role,
}: {
  children: React.ReactNode;
  title: string;
  role: string;
}) {
  const links = role === "ADMIN" ? adminLinks : participantLinks;
  return (
    <div className="min-h-screen bg-[#fffaf0]">
      <aside className="hidden fixed inset-y-0 w-64 bg-[#104366] p-5 text-blue-100 md:block">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-white"
        >
          <BookOpen className="text-[#e2a54d]" />
          BibleChallenge
        </Link>
        <p className="mt-1 text-xs text-blue-200">
          {role.replaceAll("_", " ")}
        </p>
        <nav className="mt-10 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white/10"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="absolute bottom-6 flex items-center gap-2 text-sm font-bold text-blue-100"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
      <main className="md:ml-64">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
          <div>
            <p className="eyebrow">DITSCF BibleChallenge</p>
            <h1 className="font-black text-[#104366]">{title}</h1>
          </div>
          <Link href="/" className="text-sm font-bold text-[#104366]">
            Public view
          </Link>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
