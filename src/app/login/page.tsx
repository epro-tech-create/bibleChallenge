import Link from "next/link";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#fffaf0] lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b3653] via-[#104366] to-[#1b6487] text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute bottom-20 left-16 h-40 w-40 rounded-full bg-[#e2a54d]/10 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between px-12 py-10">
          <div className="flex items-center gap-3 text-xl font-black tracking-tight">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e2a54d] text-[#104366]">
              <BookOpen size={23} />
            </span>
            BibleChallenge
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-blue-100">DITSCF</span>
        </div>
        <div className="relative z-10 my-auto px-12 pb-14 pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2a54d]/40 bg-[#e2a54d]/10 px-3 py-1.5 text-xs font-bold text-[#e2a54d]">
            <Sparkles size={14} /> Scripture. Fellowship. Purpose.
          </div>
          <h1 className="mt-7 max-w-xl text-6xl font-black leading-[1.02] tracking-tight">
            Every family has a <span className="text-[#e2a54d]">verse</span> to
            carry.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
            Sign in, stand with your family, and step into a more joyful way to
            study the Word.
          </p>
        </div>
      </section>
      <section className="relative grid place-items-center overflow-hidden bg-[#fffaf0] p-6 sm:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#e2a54d]/10 blur-3xl" />
        <div className="relative z-10 w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#104366] transition hover:gap-2"
          >
            Back to BibleChallenge <ArrowUpRight size={16} />
          </Link>
          <div className="mt-8 rounded-[2rem] border border-[#e2a54d]/25 bg-white p-7 shadow-[0_24px_70px_rgba(16,67,102,.13)] sm:p-9">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#104366] text-[#e2a54d]">
              <BookOpen size={23} />
            </div>
            <p className="eyebrow mt-7">Welcome back</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-[#104366]">
              Sign in to your challenge
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your fellowship account to continue to BibleChallenge.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
            <p className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              Forgot your password?{" "}
              <span className="font-semibold text-[#104366]">
                Contact your administrator.
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
