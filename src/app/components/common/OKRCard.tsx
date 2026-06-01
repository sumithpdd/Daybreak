"use client";
import type { IOKR } from "@/redux/services/apiSlice";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

interface OKRCardProps {
  okr: IOKR;
  onEdit: () => void;
  onDelete: () => void;
  onCreateTask?: () => void;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function OKRCard({
  okr,
  onEdit,
  onDelete,
  onCreateTask,
  onClick,
  draggable = false,
  onDragStart,
}: OKRCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const completedKeyResults = okr.keyResults.filter((kr) => kr.completed).length;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition ${
        draggable ? "cursor-move" : "cursor-pointer"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <StatusBadge status={okr.status} size="sm" />
          {okr.isOrganizational && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              🏢 Organizational
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit OKR"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="Delete OKR"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Objective Title */}
      <h3 className="text-base font-semibold text-gray-800 mb-3 line-clamp-2">
        {okr.objective}
      </h3>

      {/* Progress */}
      <div className="mb-4">
        <ProgressBar progress={okr.progress} animated />
      </div>

      {/* Key Results */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>
          <strong>{completedKeyResults}</strong> / {okr.keyResults.length} Key Results
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formatDate(okr.startDate)} → {formatDate(okr.endDate)}
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {okr.category.slice(0, 3).map((cat, idx) => (
          <span
            key={idx}
            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200"
          >
            {cat}
          </span>
        ))}
        {okr.category.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            +{okr.category.length - 3} more
          </span>
        )}
      </div>

      {/* Audit history */}
      <div className="text-[11px] text-gray-400 leading-tight mb-3">
        <div>Owner: {okr.ownerId}</div>
        <div>
          Created {formatDate(okr.createdAt)} · Updated {formatDate(okr.updatedAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded transition"
        >
          Edit Details
        </button>
        {onCreateTask && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateTask();
            }}
            className="flex-1 text-sm font-medium text-green-600 hover:bg-green-50 py-2 rounded transition"
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
}

