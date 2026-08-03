"use client";
import { useEffect, useState } from "react";
import { submitAnswer } from "@/app/actions";
type Question = {
  id: string;
  questionText: string;
  verseReference: string | null;
  timeLimit: number;
  options: { id: string; label: string; optionText: string }[];
};
export function QuizCard({
  question,
  sessionId,
  participantId,
  startedAt,
}: {
  question: Question;
  sessionId: string;
  participantId: string;
  startedAt: string;
}) {
  const [left, setLeft] = useState(question.timeLimit);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const tick = () =>
      setLeft(
        Math.max(
          0,
          Math.ceil(
            (new Date(startedAt).getTime() +
              question.timeLimit * 1000 -
              Date.now()) /
              1000,
          ),
        ),
      );
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [question, startedAt]);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-violet-950 px-5 py-4 text-white">
        <span className="text-sm font-bold">Question active</span>
        <span className="rounded-lg bg-amber-300 px-3 py-1 font-black text-violet-950">
          00:{String(left).padStart(2, "0")}
        </span>
      </div>
      <form
        action={async (data) => {
          await submitAnswer(data);
          setSent(true);
        }}
        className="p-6"
      >
        <input type="hidden" name="quizSessionId" value={sessionId} />
        <input type="hidden" name="questionId" value={question.id} />
        <input type="hidden" name="participantId" value={participantId} />
        <p className="text-xs font-bold text-amber-700">
          {question.verseReference}
        </p>
        <h2 className="mt-2 text-xl font-black text-violet-950">
          {question.questionText}
        </h2>
        {question.options.length ? (
          <div className="mt-6 space-y-2">
            {question.options.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-violet-600 has-checked:bg-violet-50"
              >
                <input
                  disabled={sent || left === 0}
                  required
                  name="selectedOptionId"
                  type="radio"
                  value={o.id}
                />
                <span className="font-bold text-violet-800">{o.label}.</span>
                {o.optionText}
              </label>
            ))}
          </div>
        ) : (
          <textarea
            disabled={sent || left === 0}
            required
            name="answerText"
            className="mt-6 min-h-28 w-full rounded-xl border p-3"
            placeholder="Write your answer..."
          />
        )}
        {sent ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            Answer submitted successfully. Keep watching for the next question.
          </p>
        ) : (
          <button disabled={left === 0} className="btn btn-primary mt-6">
            Submit answer
          </button>
        )}
      </form>
    </div>
  );
}
