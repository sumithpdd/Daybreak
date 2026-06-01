# UI Components Implementation

This guide covers building the core UI components for the My Kanban Task Management App, including the navbar, sidebar, board components, and modal system.

## Component Architecture Overview

**Layout Hierarchy**:
```
RootLayout
├── Providers (Redux)
├── Navbar (Global)
└── Page Content
    ├── Sidebar
    └── BoardTasks
```

**Key Design Decisions**:

1. **Client vs Server Components**:
   - **Navbar**: `'use client'` for state management
   - **Other Components**: Server components for better performance
   - **Layout**: Server component with client providers

2. **Styling Approach**:
   - **Tailwind CSS**: Utility-first styling
   - **Responsive Design**: Mobile-first approach
   - **Consistent Spacing**: Using Tailwind's spacing scale

3. **State Management**:
   - **Local State**: `useState` for component-specific state
   - **Global State**: Redux for application-wide state
   - **Props**: Type-safe component communication

## Core Components

### 1. Navbar Component (`src/app/components/Navbar.tsx`)

The main navigation bar with app branding, current board name, and action buttons.

```typescript
'use client'

import Dropdown from "./Dropdown";
import { useState, useEffect } from 'react'
import { setCurrentBoardName, getCurrentBoardName, openAddAndEditTaskModal } from '@/redux/features/appSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useFetchDataFromDbQuery } from "@/redux/services/apiSlice";

export default function Navbar() {
  const [show, setShow] = useState<boolean>(false);
  const { data } = useFetchDataFromDbQuery();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      const activeBoard = data[0].boards[0];
      dispatch(setCurrentBoardName(activeBoard.name));
    }
  }, [data]);

  const currentBoardName = useAppSelector(getCurrentBoardName);

  return (
    <nav className="bg-white border flex h-24">
      <div className="flex-none w-[18.75rem] border-r-2 flex items-center pl-[2.12rem]">
        <p className="font-bold text-3xl">Kanban App</p>
      </div>

      <div className="flex justify-between w-full items-center pr-[2.12rem]">
        <p className="text-black text-2xl font-bold pl-6">{currentBoardName}</p>

        <div className="flex items-center space-x-3">
          <button
            type='button'
            onClick={() => dispatch(openAddAndEditTaskModal({variant: 'Add New Task'}))}
            className="bg-blue-500 text-black px-4 py-2 flex rounded-3xl items-center space-x-2">
            <p>+ Add New Task</p>
          </button>
          <div className="relative flex items-center">
            <button onClick={() => setShow(!show)} className="text-3xl mb-4">
              ...
            </button>
            <Dropdown show={show} />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Key Features**:
- ✅ App branding and title
- ✅ Current board name display
- ✅ Add new task button
- ✅ Board options dropdown
- ✅ Responsive design
- ✅ Redux integration for state management

### 2. Dropdown Component (`src/app/components/Dropdown.tsx`)

A dropdown menu for board options (Edit Board, Delete Board).

```typescript
import { useAppDispatch } from '@/redux/hooks'
import { openAddAndEditBoardModal, openDeleteBoardAndTaskModal } from '@/redux/features/appSlice';

interface IDropdown {
  show: boolean
}

export default function Dropdown({ show }: IDropdown) {
  const dispatch = useAppDispatch()

  return (
    <div
      className={`${
        show ? "block" : "hidden"
      } w-48 absolute top-full bg-white
       border shadow-lg right-0 py-2 rounded-2xl`}
    >
      <div className="hover:bg-gray-300">
        <button
          onClick={() => dispatch(openAddAndEditBoardModal('Edit Board'))}
          className="text-sm px-4 py-2">Edit Board</button>
      </div>
      <div className="hover:bg-gray-300">
        <button
          onClick={() => dispatch(openDeleteBoardAndTaskModal({variant: "Delete this board?"}))}
          className="text-sm px-4 py-2">
          Delete Board
        </button>
      </div>
    </div>
  );
}
```

**Features**:
- ✅ Conditional rendering based on `show` prop
- ✅ Absolute positioning relative to parent
- ✅ Hover effects for better UX
- ✅ TypeScript interface for type safety
- ✅ Redux integration for modal triggers

### 3. Sidebar Component (`src/app/components/Sidebar.tsx`)

The application sidebar displaying board list and navigation.

```typescript
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { useFetchDataFromDbQuery } from "@/redux/services/apiSlice";
import { setCurrentBoardName, openAddAndEditBoardModal } from "@/redux/features/appSlice";

export default function Sidebar() {
  const [active, setActive] = useState<number>(0);
  const { data } = useFetchDataFromDbQuery();
  const dispatch = useAppDispatch();

  const handleNav = (index: number, name: string) => {
    setActive(index);
    dispatch(setCurrentBoardName(name));
  };

  return (
    <aside className="w-[18.75rem] flex-none dark:bg-dark-grey h-full py-6 pr-6">
      {data && (
        <>
          <p className="text-medium-grey pl-[2.12rem] text-[.95rem] font-semibold uppercase pb-3">
            {`All Boards (${data[0]?.boards.length})`}
          </p>
          {data[0]?.boards.map(
            (board: { [key: string]: any }, index: number) => {
              const { name, id } = board;
              const isActive = index === active;
              return (
                <div
                  key={id}
                  onClick={() => handleNav(index, name)}
                  className={`${
                    isActive ? 'rounded-tr-full rounded-br-full bg-blue-500 text-white' : 'text-black'
                  } cursor-pointer flex items-center
                  space-x-2 pl-[2.12rem] py-3 pb-3`}
                >
                  <p className="text-lg capitalize">{name}</p>
                </div>
              );
            }
          )}
        </>
      )}
      <button
        onClick={() => dispatch(openAddAndEditBoardModal("Add New Board"))}
        className="flex items-center space-x-2 pl-[2.12rem] py-3"
      >
        <p className="text-base font-bold capitalize text-main-purple">
          + Create New Board
        </p>
      </button>
    </aside>
  );
}
```

**Features**:
- ✅ Fixed width layout
- ✅ Board count display
- ✅ Active board highlighting
- ✅ Create new board button
- ✅ Real-time data updates
- ✅ Redux integration for navigation

### 4. Board Tasks Component (`src/app/components/BoardTasks.tsx`)

The main content area displaying tasks organized by columns.

```typescript
import { useEffect, useState } from "react";
import { useFetchDataFromDbQuery } from "@/redux/services/apiSlice";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getCurrentBoardName } from "@/redux/features/appSlice";
import { MdEdit, MdDelete } from "react-icons/md";
import { openAddAndEditBoardModal, openAddAndEditTaskModal, openDeleteBoardAndTaskModal } from "@/redux/features/appSlice";

interface ITask {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface Column {
  id: string;
  name: string;
  tasks?: ITask[];
}

export default function BoardTasks() {
  const { isLoading, data } = useFetchDataFromDbQuery();
  const [columns, setColumns] = useState<Column[]>([]);
  const activeBoard = useAppSelector(getCurrentBoardName);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data !== undefined) {
      const [boards] = data;
      if (boards) {
        const activeBoardData = boards.boards.find(
          (board: { name: string }) => board.name === activeBoard
        );
        if (activeBoardData) {
          const { columns } = activeBoardData;
          setColumns(columns);
        }
      }
    }
  }, [data, activeBoard]);

  return (
    <div className="overflow-x-auto overflow-y-auto w-full p-6 bg-stone-200">
      {isLoading ? (
        <p className="text-3xl w-full text-center font-bold">
          Loading tasks...
        </p>
      ) : (
        <>
          {columns.length > 0 ? (
            <div className="flex space-x-6">
              {columns.map((column) => {
                const { id, name, tasks } = column;
                return (
                  <div key={id} className="w-[17.5rem] shrink-0">
                    <p className="text-black">{`${name} (${
                      tasks ? tasks?.length : 0
                    })`}</p>

                    {tasks &&
                      (tasks.length > 0 ? (
                        tasks.map((task, taskIndex) => {
                          const { id, title, status } = task;
                          return (
                            <div
                              key={id}
                              className="bg-white p-6 rounded-md mt-6 flex items-center justify-between border"
                            >
                              <p>{title}</p>
                              <div className="flex items-center space-x-1">
                                <MdEdit
                                  onClick={() =>
                                    dispatch(
                                      openAddAndEditTaskModal({
                                        variant: "Edit Task",
                                        title,
                                        index: taskIndex,
                                        name: column.name
                                      }),
                                    )
                                  }
                                  className="text-lg cursor-pointer"
                                />
                                <MdDelete
                                  onClick={() =>
                                    dispatch(
                                      openDeleteBoardAndTaskModal({
                                        variant: "Delete this Task?",
                                        title,
                                        status,
                                        index: taskIndex,
                                      })
                                    )
                                  }
                                  className="text-lg cursor-pointer text-red-500"
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="mt-6 h-full rounded-md border-dashed border-4 border-white" />
                      ))}
                  </div>
                );
              })}
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
```

**Features**:
- ✅ Scrollable content area
- ✅ Empty state messaging
- ✅ Add new column button
- ✅ Task cards with edit/delete actions
- ✅ Dynamic column task counts
- ✅ Loading states
- ✅ Responsive layout

## Modal System

### Base Modal Component (`src/app/components/Modal.tsx`)

A reusable modal component using react-modal.

```typescript
import ReactModal from "react-modal";

interface ModalProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onRequestClose: () => void;
}

ReactModal.setAppElement("*");

export function Modal({ children, isOpen, onRequestClose }: ModalProps) {
  const modalStyle = {
    overlay: {
      zIndex: "900000",
      backgroundColor: "rgba(0,0,0,0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "0px",
      borderRadius: ".5rem",
      width: "auto",
      backgroundColor: "#fff",
      border: "none",
    },
  };

  return (
    <ReactModal
      onRequestClose={onRequestClose}
      isOpen={isOpen}
      style={modalStyle}
    >
      {children}
    </ReactModal>
  );
}

interface ModalBody {
  children: React.ReactNode;
}

export function ModalBody({ children }: ModalBody) {
  return <form className="w-[21.4rem] md:w-[30rem] p-8">{children}</form>;
}
```

### Modal Components

The application includes three main modal components:

1. **AddAndEditBoardModal**: Handles board creation and editing
2. **AddAndEditTaskModal**: Handles task creation and editing  
3. **DeleteBoardAndTaskModal**: Handles board and task deletion with confirmation

Each modal uses the base `Modal` and `ModalBody` components for consistent styling and behavior.

## Component Integration Status

✅ **UI Components**: All core components implemented and integrated  
✅ **Redux Integration**: Components connected to Redux store  
✅ **Modal System**: Dynamic modals for boards and tasks implemented  
✅ **Firebase Connection**: Real-time data synchronization active  
✅ **Form Validation**: Client-side validation with error handling  
✅ **CRUD Operations**: Complete Create, Read, Update, Delete functionality  

## Styling Guidelines

### Tailwind CSS Classes Used

- **Layout**: `flex`, `grid`, `w-full`, `h-full`
- **Spacing**: `p-6`, `m-4`, `space-x-3`, `gap-4`
- **Colors**: `bg-white`, `text-black`, `border-gray-300`
- **Typography**: `text-lg`, `font-bold`, `text-center`
- **Interactive**: `hover:bg-gray-300`, `cursor-pointer`
- **Responsive**: `md:w-[30rem]`, `sm:p-4`

### Component-Specific Styling

- **Navbar**: Fixed height (`h-24`), border styling
- **Sidebar**: Fixed width (`w-[18.75rem]`), rounded corners for active state
- **Board Area**: Scrollable (`overflow-x-auto overflow-y-auto`), stone background
- **Task Cards**: White background, rounded corners, border styling
- **Modals**: Centered positioning, overlay background, responsive width

## Next Steps

With the UI components in place, you can now:

1. **Add Drag & Drop**: Implement react-beautiful-dnd for task movement
2. **Enhance Styling**: Add animations and improved visual design
3. **Add Advanced Features**: Due dates, priorities, subtasks
4. **Implement Collaboration**: Board sharing and team features
5. **Add Dark Mode**: Theme switching capability

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
