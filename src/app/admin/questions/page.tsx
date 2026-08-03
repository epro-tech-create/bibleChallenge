import type { Challenge, Question, Round } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { createQuestion, updateQuestion } from "@/app/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Plus, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

const types = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_IN_THE_BLANK",
  "SHORT_ANSWER",
  "VERSE_COMPLETION",
  "ORAL",
] as const;
const difficulties = ["EASY", "MEDIUM", "HARD", "TIE_BREAKER"] as const;

function QuestionFields({
  challenges,
  rounds,
  question,
}: {
  challenges: Challenge[];
  rounds: Round[];
  question?: Question;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-bold">
        Challenge
        <select
          required
          name="challengeId"
          defaultValue={question?.challengeId}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        >
          {challenges.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.title}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Round
        <select
          name="roundId"
          defaultValue={question?.roundId ?? ""}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        >
          <option value="">Unassigned</option>
          {rounds.map((round) => (
            <option key={round.id} value={round.id}>
              {round.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Bible book
        <input
          required
          name="bibleBook"
          defaultValue={question?.bibleBook ?? "Daniel"}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        />
      </label>
      <label className="text-xs font-bold">
        Chapter
        <input
          required
          name="chapter"
          type="number"
          min="1"
          defaultValue={question?.chapter ?? 1}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        />
      </label>
      <label className="sm:col-span-2 text-xs font-bold">
        Question
        <textarea
          required
          name="questionText"
          defaultValue={question?.questionText}
          className="mt-1 min-h-20 w-full rounded-lg border p-2 text-sm"
        />
      </label>
      <label className="text-xs font-bold">
        Type
        <select
          name="questionType"
          defaultValue={question?.questionType ?? "MULTIPLE_CHOICE"}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold">
        Difficulty
        <select
          name="difficulty"
          defaultValue={question?.difficulty ?? "MEDIUM"}
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        >
          {difficulties.map((level) => (
            <option key={level} value={level}>
              {level.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2 text-xs font-bold">
        Correct answer
        <textarea
          required
          name="correctAnswer"
          defaultValue={question?.correctAnswer}
          className="mt-1 min-h-16 w-full rounded-lg border p-2 text-sm"
        />
      </label>
      <label className="text-xs font-bold">
        Verse reference
        <input
          name="verseReference"
          defaultValue={question?.verseReference ?? ""}
          placeholder="Daniel 1:8"
          className="mt-1 w-full rounded-lg border p-2 text-sm"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-bold">
          Marks
          <input
            required
            name="marks"
            type="number"
            step="0.5"
            min="0.5"
            defaultValue={question?.marks ?? 5}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />
        </label>
        <label className="text-xs font-bold">
          Time (sec)
          <input
            required
            name="timeLimit"
            type="number"
            min="5"
            defaultValue={question?.timeLimit ?? 45}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />
        </label>
      </div>
    </div>
  );
}

export default async function Questions() {
  await requireRole("ADMIN");
  const [questions, challenges, rounds] = await Promise.all([
    db.question.findMany({
      take: 50,
      orderBy: { chapter: "asc" },
      include: { round: true },
    }),
    db.challenge.findMany({ orderBy: { challengeDate: "desc" } }),
    db.round.findMany({
      orderBy: [{ challengeId: "asc" }, { roundNumber: "asc" }],
    }),
  ]);
  return (
    <DashboardShell title="Question Bank" role="ADMIN">
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#104366] p-6 text-white shadow-lg shadow-[#104366]/15 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e2a54d]">
              Scripture preparation
            </p>
            <h2 className="mt-2 text-2xl font-black">Build a confident question bank</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Add, review, and refine every question before the challenge begins.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <strong className="block text-lg">{questions.length}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Questions</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <strong className="block text-lg">{rounds.length}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Rounds</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <strong className="block text-lg">{challenges.length}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Challenges</span>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <section className="card overflow-hidden">
          <div className="flex items-start gap-3 border-b border-[#ead4ae] bg-[#fffaf0] p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#104366] text-[#e2a54d]">
              <ScrollText size={19} />
            </span>
            <div>
              <h2 className="font-black text-violet-950">Bible questions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Create questions, then expand any entry to edit it.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => (
              <details key={question.id} className="group transition hover:bg-[#fffaf0]/60">
                <summary className="cursor-pointer list-none">
                  <div className="flex gap-4 p-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f1f6] text-sm font-black text-[#104366]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <p className="font-bold text-violet-950">{question.questionText}</p>
                        <span className={`status status-${question.status}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {question.bibleBook} {question.chapter} · {question.round?.name ?? "Unassigned"} · {question.marks} marks · {question.timeLimit}s
                      </p>
                      <p className="mt-2 text-xs font-bold text-[#104366] group-open:hidden">
                        Open editor
                      </p>
                    </div>
                  </div>
                </summary>
                <form action={updateQuestion} className="border-t border-[#ead4ae] bg-white p-5">
                  <input type="hidden" name="questionId" value={question.id} />
                  <QuestionFields
                    challenges={challenges}
                    rounds={rounds}
                    question={question}
                  />
                  <button className="btn btn-primary mt-4">
                    Save question changes
                  </button>
                </form>
              </details>
            ))}
          </div>
        </section>
        <form action={createQuestion} className="card h-fit space-y-4 p-5 xl:sticky xl:top-6">
          <div className="flex items-center gap-3 border-b border-[#ead4ae] pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9edd9] text-[#104366]">
              <Plus size={19} />
            </span>
            <div>
              <p className="eyebrow">Question bank</p>
              <h2 className="mt-1 font-bold text-violet-950">Add question</h2>
            </div>
          </div>
          {challenges.length ? (
            <>
              <QuestionFields challenges={challenges} rounds={rounds} />
              <button className="btn btn-primary w-full">Add question</button>
            </>
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Create a challenge before adding questions.
            </p>
          )}
        </form>
      </div>
    </DashboardShell>
  );
}
