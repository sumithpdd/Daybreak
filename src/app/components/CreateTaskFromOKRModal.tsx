"use client";
import { useState } from "react";
import { Modal, ModalBody } from "./Modal";
import {
  useFetchBoardsQuery,
  useAddTaskMutation,
  type IOKR,
  type IKeyResult,
} from "@/redux/services/apiSlice";
import { id } from "../utils/id";

interface CreateTaskFromOKRModalProps {
  isOpen: boolean;
  okr: IOKR | null;
  onClose: () => void;
}

export default function CreateTaskFromOKRModal({ isOpen, okr, onClose }: CreateTaskFromOKRModalProps) {
  const { data: boards = [] } = useFetchBoardsQuery();
  const [addTask, { isLoading }] = useAddTaskMutation();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    selectedKeyResult: "",
    boardId: "",
    columnId: "",
    dueDate: "",
    startDate: new Date().toISOString().split("T")[0],
    timeEstimate: 0,
  });

  const [errors, setErrors] = useState<{ title?: string; board?: string }>({});

  const handleSubmit = async () => {
    // Validation
    const newErrors: typeof errors = {};
    if (!taskData.title.trim()) newErrors.title = "Task title is required";
    if (!taskData.boardId) newErrors.board = "Please select a board";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!okr || !taskData.boardId || !taskData.columnId) return;

    const selectedBoard = boards.find((b) => b.id === taskData.boardId);
    if (!selectedBoard) return;

    try {
      await addTask({
        boardId: taskData.boardId,
        columnId: taskData.columnId,
        taskData: {
          title: taskData.title,
          description: taskData.description || `<p>Task for OKR: ${okr.objective}</p>`,
          status: selectedBoard.columns.find((c) => c.id === taskData.columnId)?.name || "To Do",
          tags: [],
          assignedTo: [],
          timeSpent: 0,
          timeEstimate: taskData.timeEstimate,
          dueDate: taskData.dueDate || undefined,
          startDate: taskData.startDate,
          okrId: okr.id,
          keyResultId: taskData.selectedKeyResult || undefined,
          progress: 0,
          order: 0, // Will be set by the backend based on column
        },
      }).unwrap();

      // Reset and close
      setTaskData({
        title: "",
        description: "",
        selectedKeyResult: "",
        boardId: "",
        columnId: "",
        dueDate: "",
        startDate: new Date().toISOString().split("T")[0],
        timeEstimate: 0,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const selectedBoard = boards.find((b) => b.id === taskData.boardId);

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <ModalBody>
        <div className="w-full max-w-2xl bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Create Task from OKR</h2>
              {okr && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  For: {okr.objective}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {okr && (
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  placeholder="e.g., Complete AI certification module 1"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Task details..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link to Key Result */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Key Result (Optional)
                </label>
                <select
                  value={taskData.selectedKeyResult}
                  onChange={(e) => setTaskData({ ...taskData, selectedKeyResult: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- No specific key result --</option>
                  {okr.keyResults.map((kr) => (
                    <option key={kr.id} value={kr.id}>
                      {kr.text.substring(0, 80)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Board Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board <span className="text-red-500">*</span>
                </label>
                <select
                  value={taskData.boardId}
                  onChange={(e) => {
                    const board = boards.find((b) => b.id === e.target.value);
                    setTaskData({
                      ...taskData,
                      boardId: e.target.value,
                      columnId: board?.columns[0]?.id || "",
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.board ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a board --</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
                {errors.board && <p className="mt-1 text-sm text-red-500">{errors.board}</p>}
              </div>

              {/* Column Selection */}
              {selectedBoard && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Column <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={taskData.columnId}
                    onChange={(e) => setTaskData({ ...taskData, columnId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedBoard.columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={taskData.startDate}
                    onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Time Estimate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Estimate (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskData.timeEstimate / 60}
                  onChange={(e) =>
                    setTaskData({ ...taskData, timeEstimate: parseFloat(e.target.value) * 60 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}

