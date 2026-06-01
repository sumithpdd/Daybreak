"use client";
import { useState, useMemo } from "react";
import { useFetchOKRsQuery, type IOKR } from "@/redux/services/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { setOKRModalOpen, setOKRToEdit } from "@/redux/features/appSlice";
import FilterBar, { type FilterOption } from "./common/FilterBar";
import OKRCard from "./common/OKRCard";
import DeleteOKRModal from "./DeleteOKRModal";
import CreateTaskFromOKRModal from "./CreateTaskFromOKRModal";
import OKRKanbanView from "./OKRKanbanView";

type ViewType = "grid" | "list" | "kanban";
type FilterType = "all" | "individual" | "inprogress" | "completed" | "archived" | "organizational";

export default function OKRBoard() {
  const { data: okrs = [], isLoading } = useFetchOKRsQuery();
  const dispatch = useAppDispatch();

  const [viewType, setViewType] = useState<ViewType>("grid");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [okrToDelete, setOKRToDelete] = useState<IOKR | null>(null);
  const [okrForTask, setOKRForTask] = useState<IOKR | null>(null);

  // Filter and search OKRs
  const filteredOKRs = useMemo(() => {
    let filtered = okrs;

    // Apply status filter
    switch (activeFilter) {
      case "individual":
        filtered = filtered.filter((okr) => !okr.archived && !okr.isOrganizational);
        break;
      case "inprogress":
        filtered = filtered.filter((okr) => okr.status === "In Progress" && !okr.archived);
        break;
      case "completed":
        filtered = filtered.filter((okr) => okr.status === "Completed" && !okr.archived);
        break;
      case "archived":
        filtered = filtered.filter((okr) => okr.archived);
        break;
      case "organizational":
        filtered = filtered.filter((okr) => okr.isOrganizational && !okr.archived);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (okr) =>
          okr.objective.toLowerCase().includes(query) ||
          okr.category.some((cat) => cat.toLowerCase().includes(query)) ||
          okr.keyResults.some((kr) => kr.text.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [okrs, activeFilter, searchQuery]);

  // Filter options with counts
  const filterOptions: FilterOption[] = [
    {
      id: "all",
      label: "All OKRs",
      count: okrs.length,
    },
    {
      id: "individual",
      label: "Individual",
      count: okrs.filter((o) => !o.archived && !o.isOrganizational).length,
    },
    {
      id: "inprogress",
      label: "In Progress",
      count: okrs.filter((o) => o.status === "In Progress" && !o.archived).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: okrs.filter((o) => o.status === "Completed" && !o.archived).length,
    },
    {
      id: "archived",
      label: "Archived",
      count: okrs.filter((o) => o.archived).length,
    },
    {
      id: "organizational",
      label: "Organizational",
      count: okrs.filter((o) => o.isOrganizational && !o.archived).length,
    },
  ];

  const handleAddOKR = () => {
    dispatch(setOKRToEdit(null));
    dispatch(setOKRModalOpen(true));
  };

  const handleEditOKR = (okr: IOKR) => {
    dispatch(setOKRToEdit(okr));
    dispatch(setOKRModalOpen(true));
  };

  const handleDeleteOKR = (okr: IOKR) => {
    setOKRToDelete(okr);
  };

  const handleCreateTask = (okr: IOKR) => {
    setOKRForTask(okr);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OKRs...</p>
        </div>
      </div>
    );
  }

  // Show kanban view
  if (viewType === "kanban") {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Track My Objectives</h1>
                <p className="text-gray-600 mt-1">{okrs.length} total objectives</p>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewType("grid")}
                    className="px-4 py-2 rounded-md transition font-medium text-sm text-gray-700 hover:bg-white"
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewType("kanban")}
                    className="px-4 py-2 rounded-md transition font-medium text-sm bg-white text-blue-600 shadow-sm"
                    title="Kanban View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleAddOKR}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Objective
                </button>
              </div>
            </div>
          </div>
        </div>

        <OKRKanbanView />

        {/* Modals */}
        <DeleteOKRModal
          isOpen={!!okrToDelete}
          okr={okrToDelete}
          onClose={() => setOKRToDelete(null)}
        />
        <CreateTaskFromOKRModal
          isOpen={!!okrForTask}
          okr={okrForTask}
          onClose={() => setOKRForTask(null)}
        />
      </div>
    );
  }

  // Grid/List view
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track My Objectives</h1>
              <p className="text-gray-600 mt-1">
                {filteredOKRs.length} of {okrs.length} objectives
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType("grid")}
                  className={`px-4 py-2 rounded-md transition font-medium text-sm ${
                    viewType === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`px-4 py-2 rounded-md transition font-medium text-sm ${
                    viewType === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-white"
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewType("kanban")}
                  className="px-4 py-2 rounded-md transition font-medium text-sm text-gray-700 hover:bg-white"
                  title="Kanban View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddOKR}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Objective
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          options={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={(id) => setActiveFilter(id as FilterType)}
          showSearch
          searchPlaceholder="Search objectives, categories, or key results..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {filteredOKRs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No objectives found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Get started by creating your first objective"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddOKR}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Objective
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4 max-w-4xl mx-auto"
            }
          >
            {filteredOKRs.map((okr) => (
              <OKRCard
                key={okr.id}
                okr={okr}
                onEdit={() => handleEditOKR(okr)}
                onDelete={() => handleDeleteOKR(okr)}
                onCreateTask={() => handleCreateTask(okr)}
                onClick={() => handleEditOKR(okr)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteOKRModal
        isOpen={!!okrToDelete}
        okr={okrToDelete}
        onClose={() => setOKRToDelete(null)}
      />
      <CreateTaskFromOKRModal
        isOpen={!!okrForTask}
        okr={okrForTask}
        onClose={() => setOKRForTask(null)}
      />
    </div>
  );
}

