"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useFetchBoardsQuery, type ITask } from "@/redux/services/apiSlice";

type DayTask = ITask & { boardName: string; columnName: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function statusColor(columnName: string): string {
  const n = columnName.toLowerCase();
  if (n.includes("done") || n.includes("complete")) return "bg-green-500";
  if (n.includes("progress")) return "bg-blue-500";
  return "bg-gray-400";
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: boards = [], isLoading } = useFetchBoardsQuery();
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  // Map of YYYY-MM-DD -> tasks due that day.
  const tasksByDate = useMemo(() => {
    const map: Record<string, DayTask[]> = {};
    for (const board of boards) {
      for (const column of board.columns || []) {
        for (const task of column.tasks || []) {
          if (!task.dueDate) continue;
          const key = task.dueDate.slice(0, 10);
          (map[key] ||= []).push({ ...task, boardName: board.name, columnName: column.name });
        }
      }
    }
    return map;
  }, [boards]);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dateKey = (day: number) =>
    `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const move = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  return (
    <div className="flex h-screen flex-col bg-white text-black">
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {MONTHS[view.month]} {view.year}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView({ year: today.getFullYear(), month: today.getMonth() })}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Today
              </button>
              <button onClick={() => move(-1)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">‹ Prev</button>
              <button onClick={() => move(1)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Next ›</button>
            </div>
          </div>

          {isLoading && <p className="text-gray-500">Loading tasks…</p>}

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200">
            {WEEKDAYS.map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold uppercase text-gray-500">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const key = day ? dateKey(day) : `blank-${i}`;
              const dayTasks = day ? tasksByDate[dateKey(day)] || [] : [];
              const isToday = day && dateKey(day) === todayKey;
              return (
                <div key={key} className={`min-h-28 bg-white p-1.5 ${day ? "" : "bg-gray-50"}`}>
                  {day && (
                    <>
                      <div className={`mb-1 text-right text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                        {isToday ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">{day}</span>
                        ) : (
                          day
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 4).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => router.push("/board")}
                            title={`${t.title} · ${t.boardName} / ${t.columnName}`}
                            className="flex w-full items-center gap-1 truncate rounded bg-gray-50 px-1.5 py-1 text-left text-[11px] text-gray-700 hover:bg-gray-100"
                          >
                            <span className={`h-2 w-2 shrink-0 rounded-full ${statusColor(t.columnName)}`} />
                            <span className="truncate">{t.title}</span>
                          </button>
                        ))}
                        {dayTasks.length > 4 && (
                          <div className="px-1 text-[11px] text-gray-400">+{dayTasks.length - 4} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
