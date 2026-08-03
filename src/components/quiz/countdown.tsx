"use client";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function remaining(target: string) {
  return Math.max(
    0,
    Math.ceil((new Date(target).getTime() - Date.now()) / 1000),
  );
}
function format(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function Countdown({
  target,
  label,
  compact = false,
}: {
  target: string;
  label: string;
  compact?: boolean;
}) {
  const [seconds, setSeconds] = useState(() => remaining(target));
  useEffect(() => {
    const id = window.setInterval(() => setSeconds(remaining(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 rounded-lg bg-[#e2a54d] px-3 py-2 text-[#104366]"
          : "rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm"
      }
    >
      <Timer size={compact ? 18 : 24} />
      <div>
        <p className="text-[.65rem] font-bold uppercase tracking-[.16em] opacity-80">
          {label}
        </p>
        <p
          className={
            compact
              ? "font-black tabular-nums"
              : "mt-1 text-3xl font-black tabular-nums"
          }
        >
          {seconds === 0 ? "Now live" : format(seconds)}
        </p>
      </div>
    </div>
  );
}
