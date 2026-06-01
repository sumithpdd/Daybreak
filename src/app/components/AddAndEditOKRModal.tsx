"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody } from "./Modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getOKRModalValue, getOKRToEdit, setOKRModalOpen } from "@/redux/features/appSlice";
import {
  useCreateOKRMutation,
  useUpdateOKRMutation,
  useDeleteOKRMutation,
  useFetchCategoriesQuery,
  type IOKR,
  type IKeyResult,
} from "@/redux/services/apiSlice";
import { id } from "../utils/id";

// Status options
const STATUSES: Array<IOKR["status"]> = ["Not Started", "In Progress", "Completed", "Needs Revision"];

interface IOKRData {
  objective: string;
  keyResults: IKeyResult[];
  status: IOKR["status"];
  category: string[];
  progress: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  archived: boolean;
  isOrganizational: boolean;
}

const initialOKRData: IOKRData = {
  objective: "",
  keyResults: [],
  status: "Not Started",
  category: [],
  progress: 0,
  startDate: undefined,
  endDate: undefined,
  notes: "",
  archived: false,
  isOrganizational: false,
};

export default function AddAndEditOKRModal() {
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getOKRModalValue);
  const okrToEdit = useAppSelector(getOKRToEdit);
  const isEditMode = !!okrToEdit;

  const [createOKR, { isLoading: isCreating }] = useCreateOKRMutation();
  const [updateOKR, { isLoading: isUpdating }] = useUpdateOKRMutation();
  const [deleteOKR, { isLoading: isDeleting }] = useDeleteOKRMutation();
  
  // Fetch categories from database
  const { data: categoriesData = [], isLoading: isCategoriesLoading } = useFetchCategoriesQuery();
  const availableCategories = categoriesData.map(cat => cat.name);

  const [okrData, setOKRData] = useState<IOKRData>(initialOKRData);
  const [errors, setErrors] = useState<{ objective?: string; keyResults?: string; category?: string }>({});
  const [activeTab, setActiveTab] = useState<"details" | "additional" | "history">("details");

  // Initialize modal data when editing
  useEffect(() => {
    if (isModalOpen) {
      if (okrToEdit) {
        setOKRData({
          objective: okrToEdit.objective,
          keyResults: okrToEdit.keyResults || [],
          status: okrToEdit.status,
          category: okrToEdit.category || [],
          progress: okrToEdit.progress || 0,
          startDate: okrToEdit.startDate,
          endDate: okrToEdit.endDate,
          notes: okrToEdit.notes || "",
          archived: okrToEdit.archived || false,
          isOrganizational: okrToEdit.isOrganizational || false,
        });
      } else {
        setOKRData(initialOKRData);
      }
      setErrors({});
    }
  }, [isModalOpen, okrToEdit]);

  const closeModal = () => {
    dispatch(setOKRModalOpen(false));
    setOKRData(initialOKRData);
    setErrors({});
    setActiveTab("details");
  };

  const handleAddKeyResult = () => {
    const newKeyResult: IKeyResult = {
      id: id(),
      text: "",
      completed: false,
      targetValue: "",
      currentValue: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOKRData({ ...okrData, keyResults: [...okrData.keyResults, newKeyResult] });
  };

  const handleUpdateKeyResult = (index: number, field: keyof IKeyResult, value: string | boolean) => {
    const updatedKeyResults = [...okrData.keyResults];
    updatedKeyResults[index] = {
      ...updatedKeyResults[index],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setOKRData({ ...okrData, keyResults: updatedKeyResults });
  };

  const handleRemoveKeyResult = (index: number) => {
    const updatedKeyResults = okrData.keyResults.filter((_, i) => i !== index);
    setOKRData({ ...okrData, keyResults: updatedKeyResults });
  };

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = okrData.category.includes(category)
      ? okrData.category.filter((c) => c !== category)
      : [...okrData.category, category];
    setOKRData({ ...okrData, category: updatedCategories });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!okrData.objective.trim()) {
      newErrors.objective = "Objective is required";
    }

    if (okrData.keyResults.length < 2) {
      newErrors.keyResults = "At least 2 key results are required";
    } else if (okrData.keyResults.length > 4) {
      newErrors.keyResults = "Maximum 4 key results allowed";
    } else if (okrData.keyResults.some((kr) => !kr.text.trim())) {
      newErrors.keyResults = "All key results must have text";
    }

    if (okrData.category.length === 0) {
      newErrors.category = "At least one category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && okrToEdit) {
        await updateOKR({
          okrId: okrToEdit.id,
          okrData: {
            ...okrData,
            ownerId: okrToEdit.ownerId,
          },
        }).unwrap();
      } else {
        await createOKR({
          ...okrData,
          ownerId: "", // Will be set by the API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Omit<IOKR, "id" | "createdAt" | "updatedAt">).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save OKR:", error);
    }
  };

  const handleDelete = async () => {
    if (!okrToEdit || !confirm("Are you sure you want to delete this OKR?")) return;

    try {
      await deleteOKR(okrToEdit.id).unwrap();
      closeModal();
    } catch (error) {
      console.error("Failed to delete OKR:", error);
    }
  };

  return (
    <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
      <ModalBody>
        <div className="w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">
              {isEditMode ? "Edit Objective" : "Add New Objective"}
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "details"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Objective Details
            </button>
            <button
              onClick={() => setActiveTab("additional")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "additional"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Additional Details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              History
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Objective */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={okrData.objective}
                    onChange={(e) => setOKRData({ ...okrData, objective: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.objective ? "border-red-500" : "border-gray-300"
                    }`}
                    rows={3}
                    placeholder="e.g., Drive Adoption and Renewal Success in the Install Base"
                  />
                  {errors.objective && (
                    <p className="mt-1 text-sm text-red-500">{errors.objective}</p>
                  )}
                </div>

                {/* Key Results */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Results <span className="text-red-500">*</span> (2-4 required)
                    </label>
                    <button
                      onClick={handleAddKeyResult}
                      className="text-blue-600 hover:underline text-sm font-medium"
                      disabled={okrData.keyResults.length >= 4}
                    >
                      + Add Key Result
                    </button>
                  </div>
                  <div className="space-y-3">
                    {okrData.keyResults.map((kr, index) => (
                      <div key={kr.id} className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={kr.completed}
                            onChange={(e) =>
                              handleUpdateKeyResult(index, "completed", e.target.checked)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <textarea
                              value={kr.text}
                              onChange={(e) => handleUpdateKeyResult(index, "text", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              placeholder="e.g., Achieve a personal win rate of 75%+"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={kr.targetValue || ""}
                                onChange={(e) =>
                                  handleUpdateKeyResult(index, "targetValue", e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Target (e.g., 75%)"
                              />
                              <input
                                type="text"
                                value={kr.currentValue || ""}
                                onChange={(e) =>
                                  handleUpdateKeyResult(index, "currentValue", e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Current progress"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveKeyResult(index)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.keyResults && (
                    <p className="mt-1 text-sm text-red-500">{errors.keyResults}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={okrData.status}
                    onChange={(e) =>
                      setOKRData({ ...okrData, status: e.target.value as IOKR["status"] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {isCategoriesLoading ? (
                      <div className="text-gray-500 text-sm">Loading categories...</div>
                    ) : availableCategories.length === 0 ? (
                      <div className="text-gray-500 text-sm">No categories available. Please run the seed-categories script.</div>
                    ) : (
                      availableCategories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={okrData.category.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="space-y-6">
                {/* Progress */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (0-100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={okrData.progress}
                    onChange={(e) =>
                      setOKRData({ ...okrData, progress: Math.min(100, Math.max(0, Number(e.target.value))) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={okrData.startDate || ""}
                    onChange={(e) => setOKRData({ ...okrData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={okrData.endDate || ""}
                    onChange={(e) => setOKRData({ ...okrData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={okrData.notes || ""}
                    onChange={(e) => setOKRData({ ...okrData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Archived */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={okrData.archived}
                      onChange={(e) => setOKRData({ ...okrData, archived: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Mark as Archived</span>
                  </label>
                </div>

                {/* Organizational */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={okrData.isOrganizational}
                      onChange={(e) =>
                        setOKRData({ ...okrData, isOrganizational: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Organization Objective</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="text-center py-12 text-gray-500">
                <p>History tracking coming soon...</p>
                {isEditMode && okrToEdit && (
                  <div className="mt-4 text-sm text-left max-w-md mx-auto">
                    <p className="mb-2">
                      <strong>Created:</strong> {new Date(okrToEdit.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Last Updated:</strong> {new Date(okrToEdit.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div>
              {isEditMode && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isCreating || isUpdating ? "Saving..." : isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}

