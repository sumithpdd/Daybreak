"use client";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BoardTasks from "../components/BoardTasks";
import AddAndEditBoardModal from "../components/AddAndEditBoardModal";
import AddAndEditTaskModal from "../components/AddAndEditTaskModal";
import DeleteBoardAndTaskModal from "../components/DeleteBoardAndTaskModal";
import TagManagementModal from "../components/TagManagementModal";
import { useAppSelector } from "@/redux/hooks";
import { getTagManagementModalValue } from "@/redux/features/appSlice";

export default function BoardPage() {
  const isTagManagementModalOpen = useAppSelector(getTagManagementModalValue);

  return (
    <div className="app-dark flex h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <BoardTasks />
        <AddAndEditBoardModal />
        <AddAndEditTaskModal />
        <DeleteBoardAndTaskModal />
        <TagManagementModal isOpen={isTagManagementModalOpen} />
      </main>
    </div>
  );
}
