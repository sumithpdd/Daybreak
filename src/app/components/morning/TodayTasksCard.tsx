"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFetchBoardsQuery, type ITask } from "@/redux/services/apiSlice";
import { useSession } from "@/lib/session";

type FlatTask = ITask & { boardName: string; columnName: string };

function isDone(t: FlatTask): boolean {
  const s = (t.status || t.columnName || "").toLowerCase();
  return !!t.completedDate || s.includes("done") || s.includes("complete");
}

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return d;
  }
}

function TaskRow({ t, accent }: { t: FlatTask; accent?: "red" }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-2/50 px-3 py-2 text-sm">
      <span className="truncate text-text-primary">
        {t.type === "trip" ? "✈️ " : ""}
        {t.title}
      </span>
      <span className="ml-auto shrink-0 text-xs text-text-muted">{t.boardName}</span>
      {t.dueDate && (
        <span className={`shrink-0 text-xs ${accent === "red" ? "text-red-400" : "text-accent-light"}`}>
          {fmt(t.dueDate)}
        </span>
      )}
    </li>
  );
}

export default function TodayTasksCard() {
  const { data: session } = useSession();
  const { data: boards = [], isLoading } = useFetchBoardsQuery();

  const { today, overdue, incompleteCount } = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const all: FlatTask[] = [];
    for (const b of boards) {
      for (const c of b.columns || []) {
        for (const task of c.tasks || []) {
          all.push({ ...task, boardName: b.name, columnName: c.name });
        }
      }
    }
    const open = all.filter((t) => !isDone(t));
    const today = open
      .filter((t) => (t.dueDate || "").slice(0, 10) === todayKey)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    const overdue = open
      .filter((t) => t.dueDate && t.dueDate.slice(0, 10) < todayKey)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
    return { today, overdue, incompleteCount: open.length };
  }, [boards]);

  return (
    <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Today &amp; incomplete</h2>
        <Link href="/board" className="text-xs font-semibold uppercase tracking-wider text-text-muted transition hover:text-accent-light">
          Open board →
        </Link>
      </div>

      {!session ? (
        <p className="mt-4 text-sm text-text-muted">Sign in to see your tasks.</p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-text-muted">Loading tasks…</p>
      ) : (
        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-light">
              Due today ({today.length})
            </p>
            {today.length === 0 ? (
              <p className="text-sm text-text-muted">Nothing due today.</p>
            ) : (
              <ul className="flex flex-col gap-2">{today.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
            )}
          </div>

          {overdue.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400">
                Overdue ({overdue.length})
              </p>
              <ul className="flex flex-col gap-2">
                {overdue.slice(0, 6).map((t) => <TaskRow key={t.id} t={t} accent="red" />)}
              </ul>
            </div>
          )}

          <p className="text-xs text-text-muted">{incompleteCount} incomplete task{incompleteCount === 1 ? "" : "s"} in total.</p>
        </div>
      )}
    </section>
  );
}
