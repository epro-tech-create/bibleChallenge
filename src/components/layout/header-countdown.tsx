"use client";
import { useEffect, useState } from "react";

function getTime(target: string) {
  const difference = new Date(target).getTime() - Date.now();
  const seconds = Number.isFinite(difference)
    ? Math.max(0, Math.floor(difference / 1000))
    : 0;
  return {
    Days: Math.floor(seconds / 86400),
    Hours: Math.floor((seconds % 86400) / 3600),
    Minutes: Math.floor((seconds % 3600) / 60),
    Seconds: seconds % 60,
  };
}
export function HeaderCountdown({ target }: { target: string }) {
  const [time, setTime] = useState(() => getTime(target));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(getTime(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return (
    <div
      className="hidden items-center gap-2 text-[#104366] lg:flex"
      aria-label="Challenge countdown"
    >
      {Object.entries(time).map(([label, value], index) => (
        <div key={label} className="flex items-baseline gap-1">
          {index > 0 && <span className="font-bold text-[#e2a54d]">:</span>}
          <span className="text-lg font-black tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
            {label.slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}
