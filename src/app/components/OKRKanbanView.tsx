"use client";
import { useState } from "react";
import { useFetchOKRsQuery, useUpdateOKRMutation, type IOKR } from "@/redux/services/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { setOKRModalOpen, setOKRToEdit } from "@/redux/features/appSlice";

type OKRStatus = "Not Started" | "In Progress" | "Completed" | "Needs Revision";

export default function OKRKanbanView() {
  const { data: okrs = [], isLoading } = useFetchOKRsQuery();
  const [updateOKR] = useUpdateOKRMutation();
  const dispatch = useAppDispatch();
  const [draggedOKR, setDraggedOKR] = useState<IOKR | null>(null);

  // Filter only non-archived OKRs for kanban
  const activeOKRs = okrs.filter((okr) => !okr.archived);

  const columns: OKRStatus[] = ["Not Started", "In Progress", "Completed", "Needs Revision"];

  const getOKRsByStatus = (status: OKRStatus) => {
    return activeOKRs.filter((okr) => okr.status === status);
  };

  const handleDragStart = (e: React.DragEvent, okr: IOKR) => {
    setDraggedOKR(okr);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: OKRStatus) => {
    e.preventDefault();
    if (!draggedOKR || draggedOKR.status === newStatus) {
      setDraggedOKR(null);
      return;
    }

    // Update OKR status
    await updateOKR({
      okrId: draggedOKR.id,
      okrData: {
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : newStatus === "Not Started" ? 0 : draggedOKR.progress,
      },
    });

    setDraggedOKR(null);
  };

  const handleEditOKR = (okr: IOKR) => {
    dispatch(setOKRToEdit(okr));
    dispatch(setOKRModalOpen(true));
  };

  const getStatusColor = (status: OKRStatus) => {
    const colors: Record<OKRStatus, string> = {
      "Not Started": "bg-gray-100 border-gray-300",
      "In Progress": "bg-blue-50 border-blue-300",
      "Completed": "bg-green-50 border-green-300",
      "Needs Revision": "bg-orange-50 border-orange-300",
    };
    return colors[status];
  };

  const getStatusIcon = (status: OKRStatus) => {
    const icons: Record<OKRStatus, string> = {
      "Not Started": "⭕",
      "In Progress": "🔄",
      "Completed": "✅",
      "Needs Revision": "⚠️",
    };
    return icons[status];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading OKR Kanban...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-x-auto bg-gray-50 p-6">
      <div className="min-w-max">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">OKR Kanban Board</h1>
          <div className="text-sm text-gray-600">
            Total Active OKRs: {activeOKRs.length}
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="flex gap-4">
          {columns.map((status) => {
            const columnOKRs = getOKRsByStatus(status);
            return (
              <div
                key={status}
                className={`flex-1 min-w-[300px] rounded-lg border-2 ${getStatusColor(status)} p-4`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(status)}</span>
                    <h2 className="font-semibold text-gray-800">{status}</h2>
                  </div>
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                    {columnOKRs.length}
                  </span>
                </div>

                {/* OKR Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {columnOKRs.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      No OKRs in {status}
                    </div>
                  ) : (
                    columnOKRs.map((okr) => (
                      <div
                        key={okr.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, okr)}
                        onClick={() => handleEditOKR(okr)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-move"
                      >
                        {/* Objective Title */}
                        <h3 className="font-medium text-gray-800 mb-3 line-clamp-2 text-sm">
                          {okr.objective}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{okr.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                okr.progress >= 75
                                  ? "bg-green-500"
                                  : okr.progress >= 50
                                  ? "bg-blue-500"
                                  : okr.progress >= 25
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${okr.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Key Results Count */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <span>📋</span>
                          <span>
                            {okr.keyResults.filter((kr) => kr.completed).length} / {okr.keyResults.length} Key Results
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <span>📅</span>
                          <span>
                            {formatDate(okr.startDate)} → {formatDate(okr.endDate)}
                          </span>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {okr.category.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {cat.split(" ")[0]}
                            </span>
                          ))}
                          {okr.category.length > 2 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              +{okr.category.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Organizational Badge */}
                        {okr.isOrganizational && (
                          <div className="mt-2">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              🏢 Organizational
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>💡 Tip:</strong> Drag and drop OKR cards between columns to update their status.
            Click on any card to edit details.
          </p>
        </div>
      </div>
    </div>
  );
}

