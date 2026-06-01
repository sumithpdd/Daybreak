# CRUD Operations Implementation

This guide covers implementing comprehensive CRUD (Create, Read, Update, Delete) operations for both boards and tasks in the My Kanban Task Management App.

## Overview

The application implements complete CRUD functionality using:
- **Redux Toolkit Query (RTK Query)** for data fetching and mutations
- **Firebase Firestore** for data persistence
- **Modal System** for user interactions
- **Form Validation** for data integrity
- **Real-time Updates** for live synchronization

## Database Operations Setup

### RTK Query API Slice Configuration

**Key Features**:
- **Data Fetching**: `fetchDataFromDb` query retrieves user-specific board data
- **Data Updates**: `updateBoardToDb` mutation persists changes to Firestore
- **Real-time Sync**: Automatic data refetching after mutations using `invalidatesTags`
- **Error Handling**: Comprehensive error handling for database operations
- **User-Specific Operations**: All operations scoped to authenticated user's data
- **Optimistic Updates**: UI updates immediately while database operations happen in background
- **Automatic Caching**: RTK Query handles data caching and synchronization
- **Type Safety**: Full TypeScript support for all database operations

## Board Management Operations

### Create Board

**Trigger**: "+ Create New Board" button in sidebar
**Modal**: AddAndEditBoardModal with "Add New Board" variant
**Validation**: Board name and column names validation
**Process**: Creates new board with specified columns and adds to user's data

**Implementation Flow**:
1. User clicks "Create New Board" button
2. Modal opens with empty form fields
3. User enters board name and column names
4. Form validation ensures required fields are filled
5. New board data is added to existing boards array
6. Database is updated via RTK Query mutation
7. UI automatically refreshes with new board

### Read Boards

**Automatic Loading**: Boards load automatically when user signs in
**Real-time Updates**: Board list updates immediately after changes
**Active Board**: Current board name displayed in navbar and sidebar

**Implementation Flow**:
1. User authenticates with Google
2. RTK Query automatically fetches user's board data
3. Boards are displayed in sidebar with count
4. First board is set as active by default
5. User can navigate between boards
6. Active board name updates in navbar

### Update Board

**Trigger**: "Edit Board" option in dropdown menu
**Modal**: AddAndEditBoardModal with "Edit Board" variant
**Pre-populated Data**: Existing board name and columns loaded for editing
**Process**: Updates board name and columns, maintains task data

**Implementation Flow**:
1. User clicks "Edit Board" from dropdown
2. Modal opens with current board data pre-populated
3. User modifies board name and/or columns
4. Form validation ensures data integrity
5. Updated board data replaces existing board
6. Database is updated via RTK Query mutation
7. UI automatically refreshes with updated data

### Delete Board

**Trigger**: "Delete Board" option in dropdown menu
**Modal**: Confirmation modal with board name display
**Implementation**: Removes board from user's data structure
**Process**: Updates board list and refreshes UI
**Safety**: Confirmation mechanism to prevent accidental deletion

**Implementation Flow**:
1. User clicks "Delete Board" from dropdown
2. Confirmation modal opens with board name
3. User confirms deletion
4. Board is removed from boards array
5. Database is updated via RTK Query mutation
6. UI automatically refreshes with updated board list
7. If deleted board was active, first remaining board becomes active

## Task Management Operations

### Create Task

**Trigger**: "+ Add New Task" button in navbar
**Modal**: AddAndEditTaskModal with "Add New Task" variant
**Validation**: Task title and status validation against existing columns
**Process**: Adds new task to specified column

**Implementation Flow**:
1. User clicks "Add New Task" button
2. Modal opens with empty form fields
3. User enters task title and selects status (column)
4. Form validation ensures title exists and status is valid
5. New task is added to specified column's tasks array
6. Database is updated via RTK Query mutation
7. UI automatically refreshes with new task

### Read Tasks

**Dynamic Loading**: Tasks load based on active board selection
**Column Organization**: Tasks grouped by columns with counts displayed
**Real-time Updates**: Task list updates immediately after changes

**Implementation Flow**:
1. User selects a board from sidebar
2. Board data is filtered to show active board
3. Tasks are organized by columns
4. Column headers show task counts
5. Tasks are displayed as cards with edit/delete actions
6. Empty columns show dashed border placeholder

### Update Task

**Trigger**: Edit icon on individual task cards
**Modal**: AddAndEditTaskModal with "Edit Task" variant
**Pre-populated Data**: Existing task title and status loaded for editing
**Column Movement**: Changing task status moves it between columns
**Process**: Updates task properties and handles column transitions

**Implementation Flow**:
1. User clicks edit icon on task card
2. Modal opens with current task data pre-populated
3. User modifies task title and/or status
4. Form validation ensures data integrity
5. If status changed, task is moved between columns
6. Database is updated via RTK Query mutation
7. UI automatically refreshes with updated task

### Delete Task

**Trigger**: Delete icon on individual task cards
**Modal**: Confirmation modal with task title display
**Implementation**: Removes task from its current column
**Process**: Updates board data and refreshes UI
**Safety**: Confirmation prevents accidental deletion

**Implementation Flow**:
1. User clicks delete icon on task card
2. Confirmation modal opens with task title
3. User confirms deletion
4. Task is removed from its column's tasks array
5. Database is updated via RTK Query mutation
6. UI automatically refreshes with updated task list

## Modal System Architecture

### Shared Modal Components

- **Modal**: Base modal component with overlay and positioning
- **ModalBody**: Content wrapper with consistent styling
- **AddAndEditBoardModal**: Handles both board creation and editing
- **AddAndEditTaskModal**: Handles both task creation and editing
- **DeleteBoardAndTaskModal**: Handles both board and task deletion with confirmation

### State Management

- **Redux Integration**: Modal state managed through Redux store
- **Variant System**: Single modal handles multiple use cases through variants
- **Form Validation**: Client-side validation with error messaging
- **Loading States**: Loading indicators during database operations

### User Experience Features

- **Form Validation**: Real-time validation with error messages
- **Auto-clear Errors**: Error messages automatically clear after 3 seconds
- **Loading States**: Visual feedback during database operations
- **Responsive Design**: Modals adapt to different screen sizes

## Data Flow Architecture

### State Management Flow

1. **User Action**: User clicks button or icon to trigger operation
2. **Redux Dispatch**: Action dispatched to update modal state
3. **Modal Display**: Modal opens with appropriate variant and data
4. **Form Interaction**: User fills form and submits
5. **Validation**: Client-side validation ensures data integrity
6. **Database Update**: RTK Query mutation updates Firestore
7. **Cache Invalidation**: Data cache invalidated to trigger refetch
8. **UI Update**: Interface updates with new data automatically

### Error Handling Strategy

- **Client-side Validation**: Immediate feedback for form errors
- **Database Error Handling**: Graceful handling of network and database errors
- **User Feedback**: Clear error messages and loading states
- **Recovery Mechanisms**: Retry capabilities and fallback options

## Form Validation Implementation

### Board Validation

```typescript
// Board name validation
if (boardData?.name === "") {
  setIsBoardNameEmpty(true);
}

// Column name validation
const emptyColumnStringChecker = boardData?.columns.some(
  (column) => column.name === ""
);

if (emptyColumnStringChecker) {
  const emptyColumn = boardData?.columns.findIndex(
    (column) => column.name == ""
  );
  setEmptyColumnIndex(emptyColumn);
}
```

### Task Validation

```typescript
// Task title validation
if (!title) {
  setIsTaskTitleEmpty(true);
}

// Task status validation
if (!status) {
  setIsTaskStatusEmpty(true);
}

// Status existence validation
const doesStatusExists = columnNames?.some(
  (column) => column === taskData?.status
);

if (!doesStatusExists) {
  setStatusExists(false);
}
```

### Auto-clear Error Messages

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setIsBoardNameEmpty(false);
    setEmptyColumnIndex(undefined);
  }, 3000);
  return () => clearTimeout(timeoutId);
}, [emptyColumnIndex, isBoardNameEmpty]);
```

## Performance Optimizations

### Efficient Data Management

- **Selective Updates**: Only affected data is updated in database
- **Optimistic Updates**: UI updates immediately for better user experience
- **Caching Strategy**: RTK Query handles intelligent data caching
- **Minimal Re-renders**: React optimization prevents unnecessary component updates

### Database Optimization

- **Batch Operations**: Multiple changes batched when possible
- **Indexed Queries**: Efficient database queries using proper indexing
- **Real-time Sync**: Automatic synchronization without manual refresh
- **Error Recovery**: Automatic retry mechanisms for failed operations

## Implementation Examples

### Adding a New Board

```typescript
const handleAddNewBoardToDb = (e: React.FormEvent<HTMLButtonElement>) => {
  e.preventDefault();

  const emptyColumnStringChecker = boardData?.columns.some(
    (column) => column.name === ""
  );

  if (boardData?.name === "") {
    setIsBoardNameEmpty(true);
  }

  if (emptyColumnStringChecker) {
    const emptyColumn = boardData?.columns.findIndex(
      (column) => column.name == ""
    );
    setEmptyColumnIndex(emptyColumn);
  }

  if (boardData?.name !== "" && !emptyColumnStringChecker) {
    if (data) {
      let [boards] = data;
      const addBoard = [...boards.boards, boardData];
      boards = addBoard;
      updateBoardToDb(boards);
    }
  }
};
```

### Adding a New Task

```typescript
const handleAddNewTaskToDb = (e: React.FormEvent<HTMLButtonElement>) => {
  e.preventDefault();
  const { title, status } = taskData!;

  if (!title) setIsTaskTitleEmpty(true);
  if (!status) setIsTaskStatusEmpty(true);

  const doesStatusExists = columnNames?.some(
    (column) => column === taskData?.status
  );

  if (!doesStatusExists) {
    setStatusExists(false);
  }

  if (title && status && doesStatusExists) {
    if (data) {
      const [boards] = data;
      const boardsCopy = [...boards.boards];
      const activeBoard = boardsCopy.find(
        (board: { name: string }) => board.name === currentBoardTitle
      );
      const activeBoardIndex = boardsCopy.findIndex(
        (board: { name: string }) => board.name === currentBoardTitle
      );
      const { columns } = activeBoard;
      const getStatusColumn = columns?.find(
        (column: { name: string }) => column.name === status
      );
      const getStatusColumnIndex = columns?.findIndex(
        (column: { name: string }) => column.name === status
      );
      const { tasks } = getStatusColumn;
      const addNewTask = [...tasks, { id: id(), title, status }];
      const updatedStatusColumn = { ...getStatusColumn, tasks: addNewTask };
      const columnsCopy = [...columns];
      columnsCopy[getStatusColumnIndex] = updatedStatusColumn;
      const updatedBoard = {
        ...boards.boards[activeBoardIndex],
        columns: columnsCopy,
      };
      boardsCopy[activeBoardIndex] = updatedBoard;
      updateBoardToDb(boardsCopy);
    }
  }
};
```

## Testing CRUD Operations

### Manual Testing Checklist

**Board Operations**:
- ✅ Create new board with custom columns
- ✅ Edit existing board name and columns
- ✅ Delete board with confirmation
- ✅ Navigate between boards
- ✅ Form validation for empty fields

**Task Operations**:
- ✅ Add new task to any column
- ✅ Edit task title and move between columns
- ✅ Delete task with confirmation
- ✅ Form validation for empty fields
- ✅ Status validation against existing columns

**UI/UX**:
- ✅ Modal opens and closes correctly
- ✅ Form validation shows error messages
- ✅ Loading states during operations
- ✅ Real-time updates after changes
- ✅ Responsive design on different screens

## Troubleshooting

### Common Issues

**Issue**: Modal not opening
- **Solution**: Check Redux state and action dispatchers

**Issue**: Form validation not working
- **Solution**: Verify validation logic and error state management

**Issue**: Data not updating after operations
- **Solution**: Check RTK Query cache invalidation and database operations

**Issue**: Error messages not clearing
- **Solution**: Verify useEffect cleanup and timeout management

## Next Steps

After implementing CRUD operations:

1. **Add Drag & Drop**: Implement react-beautiful-dnd for task movement
2. **Enhance Validation**: Add more sophisticated form validation
3. **Add Advanced Features**: Due dates, priorities, subtasks
4. **Implement Collaboration**: Board sharing and team features
5. **Add Analytics**: Track user interactions and productivity metrics

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
