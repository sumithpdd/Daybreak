"use client";
import { Modal, ModalBody } from "./Modal";
import { useDeleteOKRMutation, type IOKR } from "@/redux/services/apiSlice";

interface DeleteOKRModalProps {
  isOpen: boolean;
  okr: IOKR | null;
  onClose: () => void;
}

export default function DeleteOKRModal({ isOpen, okr, onClose }: DeleteOKRModalProps) {
  const [deleteOKR, { isLoading }] = useDeleteOKRMutation();

  const handleDelete = async () => {
    if (!okr) return;

    try {
      await deleteOKR(okr.id).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to delete OKR:", error);
    }
  };

  if (!okr) return null;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <ModalBody>
        <div className="w-full max-w-md bg-white rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete OKR?</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          {/* OKR Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Objective:</p>
            <p className="text-sm text-gray-900 line-clamp-3">{okr.objective}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <span>📋 {okr.keyResults.length} Key Results</span>
              <span>📊 {okr.progress}% Progress</span>
              <span className={`font-medium ${
                okr.status === "Completed" ? "text-green-600" :
                okr.status === "In Progress" ? "text-blue-600" :
                "text-gray-600"
              }`}>
                {okr.status}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Warning:</p>
                <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                  <li>All key results will be deleted</li>
                  <li>Linked tasks will lose their OKR connection</li>
                  <li>This cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? "Deleting..." : "Delete OKR"}
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}

