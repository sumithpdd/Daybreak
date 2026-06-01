"use client";

import { useEffect, useState } from "react";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DateHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const dateLabel = now
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="mt-3">
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        {now ? greeting(now.getHours()) : "Hello"}
        <span className="text-accent">.</span>
      </h1>
      {dateLabel && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-4 py-1.5 shadow-[0_0_28px_-6px_rgba(245,200,80,0.75)]">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-amber-950"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-sm font-bold tracking-wide text-amber-950 sm:text-base">
            {dateLabel}
          </span>
        </div>
      )}
    </div>
  );
}
