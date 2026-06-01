"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BoardTasks from "../components/BoardTasks";
import TasksView from "../components/TasksView";
import AddAndEditBoardModal from "../components/AddAndEditBoardModal";
import AddAndEditTaskModal from "../components/AddAndEditTaskModal";
import DeleteBoardAndTaskModal from "../components/DeleteBoardAndTaskModal";
import TagManagementModal from "../components/TagManagementModal";
import { useAppSelector } from "@/redux/hooks";
import { getTagManagementModalValue } from "@/redux/features/appSlice";

type View = "board" | "list" | "grid";
const VIEWS: { id: View; label: string }[] = [
  { id: "board", label: "▦ Board" },
  { id: "list", label: "☰ List" },
  { id: "grid", label: "▤ Grid" },
];

export default function BoardPage() {
  const isTagManagementModalOpen = useAppSelector(getTagManagementModalValue);
  const [view, setView] = useState<View>("board");

  return (
    <div className="app-dark flex h-screen flex-col">
      <Navbar />
      <div className="flex items-center gap-1 border-b border-gray-200 px-6 py-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === v.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        {view === "board" ? (
          <BoardTasks />
        ) : (
          <div className="flex-1 overflow-auto p-6">
            <TasksView mode={view} />
          </div>
        )}
        <AddAndEditBoardModal />
        <AddAndEditTaskModal />
        <DeleteBoardAndTaskModal />
        <TagManagementModal isOpen={isTagManagementModalOpen} />
      </main>
    </div>
  );
}
