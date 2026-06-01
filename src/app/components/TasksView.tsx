"use client";

import { useFetchBoardsQuery, useFetchTagsQuery, type ITask } from "@/redux/services/apiSlice";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getCurrentBoardName, openAddAndEditTaskModal } from "@/redux/features/appSlice";

type Row = { task: ITask; columnName: string; index: number };

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function TasksView({ mode }: { mode: "list" | "grid" }) {
  const { data: boards = [] } = useFetchBoardsQuery();
  const { data: tags = [] } = useFetchTagsQuery();
  const currentBoardName = useAppSelector(getCurrentBoardName);
  const dispatch = useAppDispatch();

  const board = boards.find((b) => b.name === currentBoardName) || boards[0];

  const rows: Row[] = [];
  (board?.columns || []).forEach((col) =>
    (col.tasks || []).forEach((task, index) => rows.push({ task, columnName: col.name, index }))
  );

  const openEdit = (r: Row) =>
    dispatch(openAddAndEditTaskModal({ variant: "Edit Task", title: r.task.title, index: r.index, name: r.columnName }));

  const tagChips = (ids: string[] = []) =>
    tags
      .filter((t) => ids.includes(t.id))
      .map((t) => (
        <span key={t.id} className="rounded-full px-2 py-0.5 text-[11px] text-white" style={{ backgroundColor: t.color }}>
          {t.name}
        </span>
      ));

  if (!board) return <div className="flex-1 p-6 text-gray-500">No board selected.</div>;

  if (mode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((r) => (
          <button
            key={r.task.id}
            onClick={() => openEdit(r)}
            className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:shadow-md"
          >
            <div className="flex w-full items-center gap-2">
              {r.task.type === "trip" && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">✈️ Trip</span>}
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{r.columnName}</span>
            </div>
            <p className="font-semibold text-gray-900">{r.task.title}</p>
            <div className="flex flex-wrap gap-1">{tagChips(r.task.tags)}</div>
            {r.task.dueDate && <p className="text-xs text-gray-500">📅 {formatDate(r.task.dueDate)}</p>}
            <p className="mt-auto font-mono text-[10px] text-gray-400">{r.task.id}</p>
          </button>
        ))}
        {rows.length === 0 && <p className="text-gray-500">No tasks on this board.</p>}
      </div>
    );
  }

  // list mode
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Type</th>
            <th className="p-3">Due</th>
            <th className="p-3">Tags</th>
            <th className="p-3">ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.task.id} onClick={() => openEdit(r)} className="cursor-pointer border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 font-medium text-gray-900">{r.task.title}</td>
              <td className="p-3 text-gray-600">{r.columnName}</td>
              <td className="p-3">{r.task.type === "trip" ? "✈️ Trip" : "Task"}</td>
              <td className="p-3 text-gray-600">{formatDate(r.task.dueDate)}</td>
              <td className="p-3"><div className="flex flex-wrap gap-1">{tagChips(r.task.tags)}</div></td>
              <td className="p-3 font-mono text-[11px] text-gray-400">{r.task.id}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="p-4 text-gray-500">No tasks on this board.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
