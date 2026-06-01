import { useEffect, useState, useRef } from "react";
import { useFetchBoardsQuery, useMoveTaskMutation, useFetchUsersQuery, useFetchTagsQuery, useCreateBoardMutation, useGetCurrentUserQuery, useAddTaskMutation } from "@/redux/services/apiSlice";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getCurrentBoardName, openAddAndEditBoardModal, openAddAndEditTaskModal, openDeleteBoardAndTaskModal, setCurrentBoardName } from "@/redux/features/appSlice";
import { useSession } from '@/lib/session';
import { MdEdit, MdDelete, MdContentCopy } from "react-icons/md";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ITask, IColumn, IBoard, IUser, ITag } from "@/redux/services/apiSlice";
import DOMPurify from 'isomorphic-dompurify';

// Sortable Task Component
function SortableTask({
  task,
  taskIndex,
  columnName,
  users,
  tags,
  boardId,
  columnId,
}: {
  task: ITask;
  taskIndex: number;
  columnName: string;
  users: IUser[];
  tags: ITag[];
  boardId: string;
  columnId: string;
}) {
  const dispatch = useAppDispatch();
  const [addTask] = useAddTaskMutation();

  const cloneTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!boardId) return;
    const { id, createdAt, updatedAt, ...rest } = task;
    void id; void createdAt; void updatedAt;
    await addTask({ boardId, columnId, taskData: { ...rest, title: `Copy of ${task.title}` } });
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Format time helper
  const formatTime = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format time in hours with decimal
  const formatTimeHours = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return '';
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Completion and overdue logic
  const statusLower = (task.status || '').toLowerCase();
  const isCompletedStatus = statusLower.includes('complete') || statusLower === 'done';
  const isCompleted = isCompletedStatus || !!task.completedDate;
  const isOverdue = !!task.dueDate && !isCompleted && new Date(task.dueDate) < new Date();

  // Get task tags
  const taskTags = tags.filter(tag => task.tags.includes(tag.id));
  
  // Get assigned users
  const assignedUsers = users.filter(user => task.assignedTo.includes(user.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-md mt-3 flex flex-col border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onDoubleClick={(e) => {
        e.stopPropagation();
        dispatch(openAddAndEditTaskModal({
          variant: 'Edit Task',
          title: task.title,
          index: taskIndex,
          name: columnName,
        }));
      }}
    >
      {/* Tags */}
      {taskTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Task Title */}
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h3>

      {/* Description (render sanitized HTML) */}
      {task.description && (
        <div
          className="prose prose-sm max-w-none text-gray-700 mb-2 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }}
        />
      )}

      {/* Checklist Progress */}
      {task.checklistItems && task.checklistItems.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Checklist</span>
            <span>
              {task.checklistItems.filter(item => item.completed).length} / {task.checklistItems.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.round((task.checklistItems.filter(item => item.completed).length / task.checklistItems.length) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Start Date */}
      {task.startDate && (
        <div className="text-xs mb-2 text-gray-500">
          🟢 Start: {formatDate(task.startDate)}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`text-xs mb-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          📅 {formatDate(task.dueDate)}
          {isOverdue && ' (Overdue)'}
        </div>
      )}

      {/* Completed Date */}
      {task.completedDate && (
        <div className="text-xs mb-2 text-green-600 font-medium">
          ✅ Completed: {formatDate(task.completedDate)}
        </div>
      )}

      {/* Time Information */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {task.timeEstimate && task.timeEstimate > 0 && (
          <span>⏱️ Est: {formatTimeHours(task.timeEstimate)}</span>
        )}
        {task.timeSpent && task.timeSpent > 0 && (
          <span>⏰ Spent: {formatTimeHours(task.timeSpent)}</span>
        )}
      </div>

      {/* Checklist summary */}
      {task.checklistItems && task.checklistItems.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">
            Checklist: {task.checklistItems.filter(i => i.completed).length}/{task.checklistItems.length}
          </div>
          <ul className="space-y-1">
            {task.checklistItems.slice(0, 3).map(item => (
              <li key={item.id} className="flex items-center text-xs text-gray-600">
                <span className={`inline-block w-3 h-3 mr-2 rounded border ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                <span className={`truncate ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.text}</span>
              </li>
            ))}
            {task.checklistItems.length > 3 && (
              <li className="text-[11px] text-gray-400">+{task.checklistItems.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Assigned Users */}
      {assignedUsers.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {assignedUsers.map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              title={user.name}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="text-[11px] text-gray-400 leading-tight">
          {task.createdBy && (
            <div>
              Created by {task.createdBy}
              {task.createdAt ? ` · ${formatDate(task.createdAt)}` : ""}
            </div>
          )}
          <div>
            Updated{task.updatedBy ? ` by ${task.updatedBy}` : ""} ·{" "}
            {formatDate(task.updatedAt)}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <MdContentCopy
            onClick={cloneTask}
            title="Duplicate task"
            className="text-lg cursor-pointer text-gray-600 hover:text-green-600"
          />
          <MdEdit
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                openAddAndEditTaskModal({
                  variant: "Edit Task",
                  title: task.title,
                  index: taskIndex,
                  name: columnName,
                })
              );
            }}
            className="text-lg cursor-pointer text-gray-600 hover:text-blue-600"
          />
          <MdDelete
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                openDeleteBoardAndTaskModal({
                  variant: "Delete this Task?",
                  title: task.title,
                  status: task.status,
                  index: taskIndex,
                })
              );
            }}
            className="text-lg cursor-pointer text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  users,
  tags,
  boardId,
}: {
  column: IColumn;
  users: IUser[];
  tags: ITag[];
  boardId: string;
}) {
  const { id, name, tasks } = column;
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-[17.5rem] shrink-0 min-h-[200px] ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <p className="text-black">{`${name} (${tasks?.length || 0})`}</p>

      <SortableContext
        items={tasks?.map(task => task.id) || []}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px]">
          {tasks &&
            (tasks.length > 0 ? (
              (() => {
                // Debug: Check for duplicate IDs
                const taskIds = tasks.map(task => task.id);
                const uniqueIds = new Set(taskIds);
                if (taskIds.length !== uniqueIds.size) {
                  console.warn(`⚠️ Duplicate task IDs found in column "${name}":`, taskIds);
                  console.warn('Task IDs:', taskIds);
                  console.warn('Duplicate IDs:', taskIds.filter((id, index) => taskIds.indexOf(id) !== index));
                }
                
                const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
                
                // Additional check for duplicates after sorting
                const sortedTaskIds = sortedTasks.map(task => task.id);
                const sortedUniqueIds = new Set(sortedTaskIds);
                if (sortedTaskIds.length !== sortedUniqueIds.size) {
                  console.error(`❌ CRITICAL: Duplicate IDs found after sorting in column "${name}"`);
                  console.error('Sorted task IDs:', sortedTaskIds);
                }
                
                return sortedTasks.map((task, taskIndex) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    taskIndex={taskIndex}
                    columnName={column.name}
                    users={users}
                    tags={tags}
                    boardId={boardId}
                    columnId={column.id}
                  />
                ));
              })()
            ) : (
              <div className="mt-6 h-full rounded-md border-dashed border-4 border-white" />
            ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function BoardTasks() {
  // Get session to check authentication
  const { data: session, status } = useSession();
  
  // Step 1: Get or create current user
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUserQuery(undefined, {
    skip: status !== 'authenticated'
  });
  
  // Step 2: Get boards, users, and tags (only after user is loaded)
  const { isLoading, data: boards, error } = useFetchBoardsQuery(undefined, {
    skip: status !== 'authenticated' || userLoading
  });
  const { data: users = [] } = useFetchUsersQuery(undefined, {
    skip: status !== 'authenticated'
  });
  const { data: tags = [] } = useFetchTagsQuery(undefined, {
    skip: status !== 'authenticated'
  });
  
  const [moveTask] = useMoveTaskMutation();
  const [createBoard] = useCreateBoardMutation();
  
  // Debug logging with timestamps
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- session status:', status);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- session:', session);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- currentUser:', currentUser);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- userLoading:', userLoading);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- isLoading:', isLoading);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- boards:', boards);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- error:', error);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- users:', users);
    console.log('🔍 BoardTasks -', new Date().toISOString(), '- tags:', tags);
  }
  
  // Additional session debugging
  if (process.env.NODE_ENV !== 'production') console.log('🔍 BoardTasks - session status transitions:', {
    status,
    hasSession: !!session,
    sessionUser: session?.user,
    sessionEmail: session?.user?.email
  });
  
  // Manage column data in columns state
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null);
  
  // Get active board name from the redux store
  const activeBoard = useAppSelector(getCurrentBoardName);
  const dispatch = useAppDispatch();
  
  // Debug Redux state
  if (process.env.NODE_ENV !== 'production') console.log('🔍 BoardTasks -', new Date().toISOString(), '- Redux activeBoard:', activeBoard);

  // Check if it's the first render to avoid sending data to backend on mount
  const initialRender = useRef(true);
  
  // Create a default board if user has no boards
  useEffect(() => {
    if (status === 'authenticated' && boards && boards.length === 0 && !isLoading) {
      if (process.env.NODE_ENV !== 'production') console.log('🚀 Creating default board for new user');
      createBoard({
        name: "My First Board",
        description: "Welcome to your Kanban board!",
        columns: [
          {
            id: `col-${Date.now()}-1`,
            name: "To Do",
            tasks: []
          },
          {
            id: `col-${Date.now()}-2`,
            name: "In Progress", 
            tasks: []
          },
          {
            id: `col-${Date.now()}-3`,
            name: "Done",
            tasks: []
          }
        ],
        ownerId: "" // Will be set automatically by the API
      });
    }
  }, [status, boards, isLoading, createBoard]);

  // Drag and drop state
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Once data fetches successfully, this function in the useEffect runs
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 useEffect - boards:', boards);
      console.log('🔍 useEffect - activeBoard:', activeBoard);
    }
    
    if (boards && boards.length > 0) {
        // Get the data of the active board
      const activeBoardData = boards.find(
        (board: IBoard) => board.name === activeBoard
        );
      
      if (process.env.NODE_ENV !== 'production') console.log('🔍 useEffect - activeBoardData:', activeBoardData);
      
        if (activeBoardData) {
        if (process.env.NODE_ENV !== 'production') console.log('✅ Setting columns:', activeBoardData.columns);
        setCurrentBoard(activeBoardData);
        setColumns(activeBoardData.columns);
      } else {
        if (process.env.NODE_ENV !== 'production') console.log('❌ No active board found, keeping current board if it exists');
        // Only reset to first board if we don't have any current board
        if (!currentBoard && boards.length > 0) {
          const firstBoard = boards[0];
          setCurrentBoard(firstBoard);
          setColumns(firstBoard.columns);
          dispatch(setCurrentBoardName(firstBoard.name));
        }
      }
    }
  }, [boards, activeBoard, dispatch]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks || [])
      .find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !currentBoard) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source column (where the task is currently)
    const sourceColumn = columns.find(col => 
      col.tasks?.some(task => task.id === activeId)
    );

    if (!sourceColumn) return;

    const sourceIndex = sourceColumn.tasks?.findIndex(task => task.id === activeId) ?? -1;
    
    if (sourceIndex === -1) return;

    // Get the task being moved
    const task = sourceColumn.tasks![sourceIndex];

    // Check if we're dropping on a column (moving between columns)
    const destinationColumn = columns.find(col => col.id === overId);
    
    if (destinationColumn) {
      // Moving between different columns
      if (sourceColumn.id === destinationColumn.id) {
        // Same column - this shouldn't happen with our current setup, but handle it
        return;
      } else {
        // Different columns - move task to destination column
        const isLastColumn = destinationColumn === columns[columns.length - 1];
        
        try {
          await moveTask({
            boardId: currentBoard.id,
            sourceColumnId: sourceColumn.id,
            destinationColumnId: destinationColumn.id,
            taskId: task.id,
            newPosition: destinationColumn.tasks.length,
            isLastColumn,
          }).unwrap();
          
          // Update local state
          const newColumns = columns.map(col => {
            if (col.id === sourceColumn.id) {
              // Remove from source column
              const newTasks = [...(col.tasks || [])];
              newTasks.splice(sourceIndex, 1);
              return { ...col, tasks: newTasks };
            } else if (col.id === destinationColumn.id) {
              // Add to destination column
              const newTasks = [...(col.tasks || [])];
              newTasks.push({ 
                ...task, 
                status: col.name,
                updatedAt: new Date().toISOString(),
                completedDate: isLastColumn ? new Date().toISOString() : undefined,
              });
              return { ...col, tasks: newTasks };
            }
            return col;
          });
          setColumns(newColumns);
        } catch (error) {
          console.error("Error moving task:", error);
        }
      }
    } else {
      // We're dropping on another task - find which column it belongs to
      const destinationColumn = columns.find(col => 
        col.tasks?.some(task => task.id === overId)
      );
      
      if (!destinationColumn) return;
      
      const destinationIndex = destinationColumn.tasks?.findIndex(task => task.id === overId) ?? -1;
      
      if (destinationIndex === -1) return;

      if (sourceColumn.id === destinationColumn.id) {
        // Reordering within the same column
        const newColumns = columns.map(col => {
          if (col.id === sourceColumn.id) {
            const newTasks = [...(col.tasks || [])];
            const [movedTask] = newTasks.splice(sourceIndex, 1);
            newTasks.splice(destinationIndex, 0, movedTask);
            return { ...col, tasks: newTasks };
          }
          return col;
        });
        setColumns(newColumns);
      } else {
        // Moving between different columns
        const isLastColumn = destinationColumn === columns[columns.length - 1];
        
        try {
          await moveTask({
            boardId: currentBoard.id,
            sourceColumnId: sourceColumn.id,
            destinationColumnId: destinationColumn.id,
            taskId: task.id,
            newPosition: destinationIndex,
            isLastColumn,
          }).unwrap();
          
          // Update local state
          const newColumns = columns.map(col => {
            if (col.id === sourceColumn.id) {
              // Remove from source column
              const newTasks = [...(col.tasks || [])];
              newTasks.splice(sourceIndex, 1);
              return { ...col, tasks: newTasks };
            } else if (col.id === destinationColumn.id) {
              // Add to destination column at the specified position
              const newTasks = [...(col.tasks || [])];
              newTasks.splice(destinationIndex, 0, { 
                ...task, 
                status: col.name,
                updatedAt: new Date().toISOString(),
                completedDate: isLastColumn ? new Date().toISOString() : undefined,
              });
              return { ...col, tasks: newTasks };
            }
            return col;
          });
          setColumns(newColumns);
        } catch (error) {
          console.error("Error moving task:", error);
        }
      }
    }

    setActiveTask(null);
  };

  // Show loading state if not authenticated or user is loading
  if (status === 'loading' || userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  // Show sign-in prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to My Kanban</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your boards</p>
          <a 
            href="/api/auth/signin" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto w-full p-6 bg-stone-200">
      {/* If data has not been fetched successfully, display a loading state, else display the column of tasks */}
      {isLoading ? (
        <p className="text-3xl w-full text-center font-bold">
          Loading tasks...
        </p>
      ) : (
        <>
          {/* If columns of tasks isn't empty: display the tasks, else display the prompt to add a new column */}
          {columns.length > 0 ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
            <div className="flex space-x-6">
                {columns.map((column) => (
                  <DroppableColumn
                    key={column.id}
                    column={column}
                    users={users}
                    tags={tags}
                    boardId={currentBoard?.id || ''}
                  />
                ))}
              {/* If the number of columns of tasks is less than 7, display an option to add more columns */}
              {columns.length < 7 ? (
                  <div
                    onClick={() =>
                      dispatch(openAddAndEditBoardModal("Edit Board"))
                    }
                    className="rounded-md bg-white w-[17.5rem] mt-12 shrink-0 flex justify-center items-center"
                  >
                  <p className="cursor-pointer font-bold text-black text-2xl">
                    + New Column
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>

              <DragOverlay>
                {activeTask ? (
                  <div className="bg-white p-4 rounded-md flex flex-col border shadow-lg opacity-90">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{activeTask.title}</h3>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <div className="flex flex-col items-center">
                <p className="text-black text-sm">
                  This board is empty. Create a new column to get started.
                </p>
                <div
                  onClick={() =>
                    dispatch(openAddAndEditBoardModal("Edit Board"))
                  }
                  className="rounded-md bg-white w-[17.5rem] mt-12 shrink-0 flex justify-center items-center"
                >
                  <p className="cursor-pointer font-bold text-black text-2xl">
                    + New Column
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}