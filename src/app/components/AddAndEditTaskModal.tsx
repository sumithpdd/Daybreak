"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody } from "./Modal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAddAndEditTaskModalValue,
  getAddAndEditTaskModalVariantValue,
  getAddAndEditTaskModalTitle,
  closeAddAndEditTaskModal,
  getCurrentBoardName,
  getAddAndEditTaskModalIndex,
  getAddAndEditTaskModalName,
} from "@/redux/features/appSlice";
import {
  useFetchBoardsQuery,
  useUpdateBoardMutation,
  useFetchUsersQuery,
  useFetchTagsQuery,
} from "@/redux/services/apiSlice";
import { id } from '../utils/id'
import type { ITask, IUser, ITag, IChecklistItem } from "@/redux/services/apiSlice";
import RichTextEditor from './RichTextEditor';
import Checklist from './Checklist';

// Define types for the tasks data in the modal (using string arrays for IDs)
interface ITaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[]; // Array of tag IDs
  assignedTo: string[]; // Array of user IDs
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  timeSpent: number; // in minutes
  timeEstimate?: number; // in minutes
  checklistItems?: IChecklistItem[]; // Array of checklist items
  notes?: string;
  updatedBy?: string;
}

// These will be populated from the API

// initial task data for the add task modal
let initialTaskData: ITaskData = {
  id: id(),
  title: "",
  description: "",
  status: "",
  tags: [],
  assignedTo: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  timeSpent: 0,
  timeEstimate: undefined,
  checklistItems: [],
  notes: "",
};

export default function AddOrEditTaskModal() {
  let { data: boards } = useFetchBoardsQuery();
  let { data: users = [] } = useFetchUsersQuery();
  let { data: tags = [] } = useFetchTagsQuery();
  let [updateBoard, { isLoading }] = useUpdateBoardMutation();
  const [taskData, setTaskData] = useState<ITaskData>();
  const [isTaskTitleEmpty, setIsTaskTitleEmpty] = useState<boolean>(false);
  const [isTaskStatusEmpty, setIsTaskStatusEmpty] = useState<boolean>(false);
  const [statusExists, setStatusExists] = useState<boolean>(true);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  // Use data from API instead of hardcoded arrays
  
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(getAddAndEditTaskModalValue);
  const modalVariant = useAppSelector(getAddAndEditTaskModalVariantValue);
  const isVariantAdd = modalVariant === "Add New Task";
  const closeModal = () => dispatch(closeAddAndEditTaskModal());
  const currentBoardTitle = useAppSelector(getCurrentBoardName);
  
  // get task title, index and name from redux store
  const currentTaskTitle = useAppSelector(getAddAndEditTaskModalTitle);
  const currentTaskIndex = useAppSelector(getAddAndEditTaskModalIndex);
  const initialTaskColumn = useAppSelector(getAddAndEditTaskModalName);

  // Effect to set initial data for the modal based on the variant
  useEffect(() => {
    if (boards) {
      const activeBoard = boards.find(
        (board: { name: string }) => board.name === currentBoardTitle
      );
      if (activeBoard) {
        const { columns } = activeBoard;
        const columnNames = columns.map(
          (column: { name: string }) => column.name
        );

        if (columnNames) {
          setColumnNames(columnNames);
        }

        if (isVariantAdd) {
          setTaskData({
            ...initialTaskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          const activeTask = columns
            .flatMap((column: any) => column.tasks || [])
            .find((task: any) => task.title === currentTaskTitle);
          
          if (activeTask) {
            // Ensure all required fields exist with defaults
            setTaskData({
              id: activeTask.id || id(),
              title: activeTask.title || "",
              description: activeTask.description || "",
              status: activeTask.status || "",
              tags: activeTask.tags || [],
              assignedTo: activeTask.assignedTo || [],
              dueDate: activeTask.dueDate || undefined,
              createdAt: activeTask.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(), // Always update this
              timeSpent: activeTask.timeSpent || 0,
              timeEstimate: activeTask.timeEstimate || undefined,
              checklistItems: activeTask.checklistItems || [],
            });
          }
        }
      }
    }
  }, [boards, modalVariant]);

  // Effect to clear error messages after a certain time
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsTaskStatusEmpty(false);
      setIsTaskTitleEmpty(false);
      setStatusExists(true);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [isTaskStatusEmpty, isTaskTitleEmpty, statusExists]);

  // Handler for task title change
  const handleTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (taskData) {
      const newData = { ...taskData, title: e.target.value, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };


  // Handler for task status change
  const handleTaskStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (taskData) {
      const newData = { ...taskData, status: e.target.value, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Handler for due date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (taskData) {
      const newData = { ...taskData, dueDate: e.target.value, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Handler for time estimate change
  const handleTimeEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (taskData) {
      const minutes = parseInt(e.target.value) || 0;
      const newData = { ...taskData, timeEstimate: minutes, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Handler for time spent change
  const handleTimeSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (taskData) {
      const minutes = parseInt(e.target.value) || 0;
      const newData = { ...taskData, timeSpent: minutes, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Handler for tag selection
  const handleTagToggle = (tagId: string) => {
    if (taskData) {
      const isSelected = taskData.tags.includes(tagId);
      const newTags = isSelected 
        ? taskData.tags.filter(t => t !== tagId)
        : [...taskData.tags, tagId];
      
      const newData = { ...taskData, tags: newTags, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Handler for user assignment
  const handleUserToggle = (userId: string) => {
    if (taskData) {
      const isAssigned = taskData.assignedTo.includes(userId);
      const newAssignedTo = isAssigned 
        ? taskData.assignedTo.filter(u => u !== userId)
        : [...taskData.assignedTo, userId];
      
      const newData = { ...taskData, assignedTo: newAssignedTo, updatedAt: new Date().toISOString() };
      setTaskData(newData);
    }
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Helper function to add new task to database
  const handleAddNewTaskToDb = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { title, status } = taskData!;

    if (!title) {
      setIsTaskTitleEmpty(true);
    }

    if (!status) {
      setIsTaskStatusEmpty(true);
    }

    // check if the status input exists among the existing columns
    const doesStatusExists = columnNames?.some(
      (column) => column === taskData?.status
    );

    if (!doesStatusExists) {
      setStatusExists(false);
    }

    // if all conditions are met
    if (title && status && doesStatusExists) {
      if (boards) {
        const activeBoard = boards.find(
          (board: { name: string }) => board.name === currentBoardTitle
        );
        if (activeBoard) {
          const { columns } = activeBoard;
          const getStatusColumn = columns?.find(
            (column: { name: string }) => column.name === status
          );
          const getStatusColumnIndex = columns?.findIndex(
            (column: { name: string }) => column.name === status
          );
          
          if (getStatusColumn) {
            const { tasks } = getStatusColumn;
            const addNewTask = [...(tasks || []), taskData as any];
            const updatedStatusColumn = { ...getStatusColumn, tasks: addNewTask };
            const columnsCopy = [...columns];
            columnsCopy[getStatusColumnIndex] = updatedStatusColumn;
            
            updateBoard({
              boardId: activeBoard.id,
              boardData: { columns: columnsCopy }
            });
            closeModal();
          }
        }
      }
    }
  };

  // Helper function to edit task in database
  const handleEditTaskToDb = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { title, status } = taskData!;
    
    if (!title) {
      setIsTaskTitleEmpty(true);
    }
    if (!status) {
      setIsTaskStatusEmpty(true);
    }
    
    // check if the status input exists among the existing status
    const doesStatusExists = columnNames?.some(
      (column) => column === taskData?.status
    );
    
    if (!doesStatusExists) {
      setStatusExists(false);
    }
    
    if (title && status && doesStatusExists) {
      if (boards) {
        const activeBoard = boards.find(
          (board: { name: string }) => board.name === currentBoardTitle
        );
        if (activeBoard) {
          const { columns } = activeBoard;
          const getStatusColumnIndex = columns?.findIndex(
            (column: { name: string }) => column.name === status
          );

          // Check if the task status to edit is equal to the column.name
          if (status === initialTaskColumn) {
            const updatedStatusColumn = {
              ...columns[getStatusColumnIndex],
              tasks: (columns[getStatusColumnIndex]?.tasks || []).map(
                (task: any, index: number) => {
                  if (index === currentTaskIndex) {
                    return taskData; // Use the full task data
                  }
                  return task;
                }
              ),
            };
            const columnsCopy = [...columns];
            columnsCopy[getStatusColumnIndex] = updatedStatusColumn;
            
            updateBoard({
              boardId: activeBoard.id,
              boardData: { columns: columnsCopy }
            });
            closeModal();
          } else {
            // Find the column with the name in the task status and append the edited task
            const getStatusColumn = columns?.find(
              (column: { name: string }) => column.name === status
            );
            // delete task from previous column
            const getPrevStatusColumn = columns?.find(
              (column: { name: string }) => column.name === initialTaskColumn
            );
            const getPrevStatusColumnIndex = columns?.findIndex(
              (column: { name: string }) => column.name === initialTaskColumn
            );
            //update the previous column of the task
            const updatedPrevStatusColumn = {
              ...getPrevStatusColumn,
              tasks: (getPrevStatusColumn?.tasks || []).filter(
                (_task: any, index: number) => index !== currentTaskIndex
              ),
            };
            // update the new column of the task
            const updatedStatusColumn = {
              ...getStatusColumn,
              tasks: [...(getStatusColumn?.tasks || []), taskData as any], // Use full task data
            };
            const columnsCopy = [...columns];
            columnsCopy[getStatusColumnIndex] = updatedStatusColumn as any;
            columnsCopy[getPrevStatusColumnIndex] = updatedPrevStatusColumn as any;
            
            updateBoard({
              boardId: activeBoard.id,
              boardData: { columns: columnsCopy }
            });
            closeModal();
          }
        }
      }
    }
  };

  return (
    <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
      <ModalBody>
        <p className="font-bold text-lg">{modalVariant}</p>
        <div className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </label>
            <div className="pt-1">
              <input
                id="title"
                className={`${
                  isTaskTitleEmpty ? "border-red-500" : "border-gray-300"
                } border w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter task title"
                value={taskData?.title || ""}
                onChange={handleTaskTitleChange}
              />
            </div>
            {isTaskTitleEmpty && (
              <p className="text-xs text-red-500 mt-1">Task title cannot be empty</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <RichTextEditor
              value={taskData?.description || ""}
              onChange={(content) => {
                if (taskData) {
                  const newData = { ...taskData, description: content, updatedAt: new Date().toISOString() };
                  setTaskData(newData);
                }
              }}
              placeholder="Add a more detailed description..."
            />
          </div>

          {/* Checklist */}
          <Checklist
            items={taskData?.checklistItems || []}
            onItemsChange={(items) => {
              if (taskData) {
                const newData = { ...taskData, checklistItems: items, updatedAt: new Date().toISOString() };
                setTaskData(newData);
              }
            }}
          />

          {/* Due Date (left column only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="pt-1">
                <input
                  id="dueDate"
                  type="date"
                  className="border border-gray-300 w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={taskData?.dueDate || ""}
                  onChange={handleDueDateChange}
                />
              </div>
            </div>
            <div />
          </div>
            </div>

            {/* Right Column - Meta (tags, status, notes, created, time, assign) */}
            <div className="space-y-6">
              {/* Tags Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="pt-1">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = taskData?.tags.includes(tag.id) || false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            isSelected 
                              ? 'text-white' 
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                          style={isSelected ? { backgroundColor: tag.color } : {}}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="text-sm font-medium text-gray-700">Status *</label>
                <div className="pt-1">
                  <select
                    id="status"
                    className={`${isTaskStatusEmpty || !statusExists ? "border-red-500" : "border-gray-300"} border w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={taskData?.status || ""}
                    onChange={handleTaskStatusChange}
                  >
                    <option value="">Select status</option>
                    {columnNames.map((column) => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
                <div className="pt-1">
                  <textarea
                    id="notes"
                    className="border border-gray-300 w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes here..."
                    rows={4}
                    value={taskData?.notes || ""}
                    onChange={(e) => {
                      if (taskData) {
                        const newData = { ...taskData, notes: e.target.value, updatedAt: new Date().toISOString() };
                        setTaskData(newData);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Created On / Updated By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <div className="pt-1">
                    <input type="text" readOnly className="border border-gray-200 bg-gray-50 text-gray-600 w-full p-3 rounded-md text-sm" value={taskData?.createdAt ? new Date(taskData.createdAt).toLocaleString() : ''} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Updated By</label>
                  <div className="pt-1">
                    <input type="text" readOnly className="border border-gray-200 bg-gray-50 text-gray-600 w-full p-3 rounded-md text-sm" value={taskData?.updatedBy || ''} />
                  </div>
                </div>
              </div>

              {/* Time fields on right */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeEstimate" className="text-sm font-medium text-gray-700">Time Estimate (hours)</label>
                  <div className="pt-1">
                    <input id="timeEstimate" type="number" min="0" step="0.25" className="border border-gray-300 w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2.5" value={taskData?.timeEstimate ? (taskData.timeEstimate / 60).toFixed(2) : ""} onChange={(e) => { if (taskData) { const hours = parseFloat(e.target.value) || 0; const minutes = Math.round(hours * 60); const newData = { ...taskData, timeEstimate: minutes, updatedAt: new Date().toISOString() }; setTaskData(newData); } }} />
                    <p className="text-xs text-gray-500 mt-1">Use decimal for minutes (e.g., 2.5 = 2h 30m)</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="timeSpent" className="text-sm font-medium text-gray-700">Time Spent (hours)</label>
                  <div className="pt-1">
                    <input id="timeSpent" type="number" min="0" step="0.25" className="border border-gray-300 w-full p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 1.25" value={taskData?.timeSpent ? (taskData.timeSpent / 60).toFixed(2) : "0.00"} onChange={(e) => { if (taskData) { const hours = parseFloat(e.target.value) || 0; const minutes = Math.round(hours * 60); const newData = { ...taskData, timeSpent: minutes, updatedAt: new Date().toISOString() }; setTaskData(newData); } }} />
                    <p className="text-xs text-gray-500 mt-1">Use decimal for minutes (e.g., 1.25 = 1h 15m)</p>
                  </div>
                </div>
              </div>

              {/* Assigned Users Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <div className="pt-1">
                  <div className="space-y-2">
                    {users.map((user) => {
                      const isAssigned = taskData?.assignedTo.includes(user.id) || false;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isAssigned ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleUserToggle(user.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleUserToggle(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              onClick={(e: React.FormEvent<HTMLButtonElement>) => {
                // function to run depending on the variant of the modals
                isVariantAdd ? handleAddNewTaskToDb(e) : handleEditTaskToDb(e);
              }}
              className="bg-blue-500 hover:bg-blue-600 rounded-md py-3 w-full text-sm font-medium text-white transition-colors"
            >
              {isLoading
                ? "Loading..."
                : `${isVariantAdd ? "Create Task" : "Save Changes"}`}
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}