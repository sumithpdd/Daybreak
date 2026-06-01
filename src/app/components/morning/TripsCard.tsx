"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFetchBoardsQuery, type ITask } from "@/redux/services/apiSlice";
import { useSession } from "@/lib/session";

type TripTask = ITask & { boardName: string };

function formatRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  try {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if (s && e) {
      const sameYear = s.getFullYear() === e.getFullYear();
      const sStr = sameYear ? s.toLocaleDateString(undefined, opts) : s.toLocaleDateString(undefined, { ...opts, year: "numeric" });
      return `${sStr} – ${e.toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
    }
    const d = (s || e) as Date;
    return d.toLocaleDateString(undefined, { ...opts, year: "numeric" });
  } catch {
    return `${start ?? ""} ${end ? "– " + end : ""}`.trim();
  }
}

export default function TripsCard() {
  const { data: session } = useSession();
  const { data: boards = [], isLoading } = useFetchBoardsQuery();

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const trips: TripTask[] = [];
    for (const board of boards) {
      for (const col of board.columns || []) {
        for (const task of col.tasks || []) {
          if (task.type === "trip") trips.push({ ...task, boardName: board.name });
        }
      }
    }
    return trips
      .filter((t) => (t.dueDate || t.startDate || "") >= today || (!t.dueDate && !t.startDate))
      .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
  }, [boards]);

  return (
    <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Upcoming trips</h2>
        <Link href="/board" className="text-xs font-semibold uppercase tracking-wider text-text-muted transition hover:text-accent-light">
          Open board →
        </Link>
      </div>

      {!session ? (
        <p className="mt-4 text-sm text-text-muted">Sign in to see your trips.</p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-text-muted">Loading trips…</p>
      ) : upcoming.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No upcoming trips. Add a task on a board and set its type to Trip.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {upcoming.map((trip) => (
            <li key={trip.id} className="rounded-xl border border-border/70 bg-surface-2/50 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-light">
                  ✈️ Trip
                </span>
                {trip.location && <span className="text-xs text-text-muted">{trip.location}</span>}
                <span className="ml-auto text-[11px] text-text-muted">{trip.boardName}</span>
              </div>
              <p className="mt-1 font-semibold text-text-primary">{trip.title}</p>
              {(trip.startDate || trip.dueDate) && (
                <p className="text-sm text-accent-light">{formatRange(trip.startDate, trip.dueDate)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
