# Drag and Drop Implementation

This guide covers implementing drag and drop functionality using `@dnd-kit` for the My Kanban Task Management App.

## Why @dnd-kit?

We use `@dnd-kit` instead of the deprecated `react-beautiful-dnd` for several reasons:

- **Active Maintenance**: `@dnd-kit` is actively maintained and regularly updated
- **Modern Architecture**: Built with modern React patterns and hooks
- **Better Performance**: Optimized for better performance and accessibility
- **TypeScript Support**: Excellent TypeScript support out of the box
- **Flexibility**: More flexible and customizable than alternatives
- **Accessibility**: Built-in accessibility features and keyboard navigation
- **StrictMode Compatible**: Works seamlessly with React StrictMode

## Installation

Install the required `@dnd-kit` packages:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Core Concepts

### @dnd-kit Architecture

- **DndContext**: The main context provider that manages drag and drop state
- **SortableContext**: Provides sorting functionality for lists
- **useSortable**: Hook for making individual items sortable
- **DragOverlay**: Provides visual feedback during drag operations
- **Sensors**: Configure how drag operations are initiated

## Implementation

### 1. Import Required Components

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
```

### 2. Create Sortable Task Component

```typescript
function SortableTask({ task, taskIndex, columnName }: { 
  task: ITask; 
  taskIndex: number; 
  columnName: string 
}) {
  const dispatch = useAppDispatch();
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-6 rounded-md mt-6 flex items-center justify-between border cursor-grab active:cursor-grabbing"
    >
      <p>{task.title}</p>
      <div className="flex items-center space-x-1">
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
          className="text-lg cursor-pointer"
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
          className="text-lg cursor-pointer text-red-500"
        />
      </div>
    </div>
  );
}
```

### 3. Create Droppable Column Component

```typescript
function DroppableColumn({ column }: { column: Column }) {
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
      <p className="text-black">{`${name} (${tasks ? tasks?.length : 0})`}</p>
      
      <SortableContext
        items={tasks?.map(task => task.id) || []}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px]">
          {tasks &&
            (tasks.length > 0 ? (
              tasks.map((task, taskIndex) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  taskIndex={taskIndex}
                  columnName={column.name}
                />
              ))
            ) : (
              <div className="mt-6 h-full rounded-md border-dashed border-4 border-white" />
            ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

### 4. Configure Sensors

```typescript
// Configure sensors for drag and drop
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Require 8px movement before drag starts
    },
  })
);
```

### 5. Implement Drag Handlers

```typescript
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
  
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  // Find the source and destination columns
  const sourceColumn = columns.find(col => 
    col.tasks?.some(task => task.id === activeId)
  );
  const destinationColumn = columns.find(col => col.id === overId);

  if (!sourceColumn || !destinationColumn) return;

  const sourceIndex = sourceColumn.tasks?.findIndex(task => task.id === activeId) ?? -1;
  
  if (sourceIndex === -1) return;

  // Get the task being moved
  const task = sourceColumn.tasks![sourceIndex];

  // If moving within the same column
  if (sourceColumn.id === destinationColumn.id) {
    const newColumns = columns.map(col => {
      if (col.id === sourceColumn.id) {
        const newTasks = [...(col.tasks || [])];
        newTasks.splice(sourceIndex, 1);
        newTasks.splice(sourceIndex, 0, task);
        return { ...col, tasks: newTasks };
      }
      return col;
    });
    setColumns(newColumns);
  } else {
    // Moving between different columns
    const newColumns = columns.map(col => {
      if (col.id === sourceColumn.id) {
        // Remove from source column
        const newTasks = [...(col.tasks || [])];
        newTasks.splice(sourceIndex, 1);
        return { ...col, tasks: newTasks };
      } else if (col.id === destinationColumn.id) {
        // Add to destination column
        const newTasks = [...(col.tasks || [])];
        newTasks.push({ ...task, status: col.name });
        return { ...col, tasks: newTasks };
      }
      return col;
    });
    setColumns(newColumns);
  }

  setActiveTask(null);
};
```

### 6. Update Database on Changes

```typescript
// Update database when columns change
useEffect(() => {
  if (!initialRender.current) {
    try {
      if (data) {
        const [boards] = data;
        const boardsCopy = [...boards.boards];
        const activeBoardIndex = boardsCopy.findIndex(
          (board: { name: string }) => board.name === activeBoard
        );
        const updatedBoard = {
          ...boards.boards[activeBoardIndex],
          columns,
        };
        boardsCopy[activeBoardIndex] = updatedBoard;
        updateBoardToDb(boardsCopy);
      }
    } catch (error) {
      console.error("Error updating board:", error);
    }
  } else {
    initialRender.current = false;
  }
}, [columns, data, activeBoard, updateBoardToDb]);
```

### 7. Wrap Components with DndContext

```typescript
return (
  <DndContext
    sensors={sensors}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
  >
    <div className="flex space-x-6">
      {columns.map((column) => (
        <DroppableColumn key={column.id} column={column} />
      ))}
    </div>
    
    <DragOverlay>
      {activeTask ? (
        <div className="bg-white p-6 rounded-md flex items-center justify-between border shadow-lg opacity-90">
          <p>{activeTask.title}</p>
        </div>
      ) : null}
    </DragOverlay>
  </DndContext>
);
```

## Key Features

### Visual Feedback

- **Drag Overlay**: Shows a preview of the dragged item
- **Opacity Changes**: Dragged items become semi-transparent
- **Cursor Changes**: Visual cursor feedback (grab/grabbing)
- **Smooth Animations**: CSS transitions for smooth movement

### Interaction Handling

- **Event Propagation**: Prevents conflicts with edit/delete buttons
- **Activation Distance**: Requires 8px movement before drag starts
- **Drop Zones**: Each column acts as a valid drop zone
- **Invalid Drops**: Gracefully handles invalid drop attempts

### Data Management

- **Real-time Updates**: Changes are immediately reflected in UI
- **Database Sync**: Changes are automatically saved to Firestore
- **Optimistic Updates**: UI updates before database confirmation
- **Error Handling**: Graceful error handling for failed operations

## Configuration Options

### Sensor Configuration

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Minimum distance to start drag
    },
  })
);
```

### Sorting Strategy

```typescript
<SortableContext
  items={tasks?.map(task => task.id) || []}
  strategy={verticalListSortingStrategy} // Vertical list sorting
>
```

### Drag Overlay Customization

```typescript
<DragOverlay>
  {activeTask ? (
    <div className="custom-drag-overlay">
      <p>{activeTask.title}</p>
    </div>
  ) : null}
</DragOverlay>
```

## Accessibility Features

### Built-in Accessibility

- **Keyboard Navigation**: Full keyboard support for drag and drop
- **Screen Reader Support**: Proper ARIA attributes and announcements
- **Focus Management**: Maintains focus during drag operations
- **High Contrast**: Works with high contrast themes

### Custom Accessibility Enhancements

```typescript
// Add custom ARIA labels
<div
  {...attributes}
  {...listeners}
  role="button"
  aria-label={`Drag task: ${task.title}`}
  tabIndex={0}
>
```

## Performance Optimizations

### Efficient Re-renders

- **Memoization**: Components are properly memoized
- **Minimal Re-renders**: Only necessary components re-render
- **Optimized Updates**: Efficient state updates during drag operations

### Memory Management

- **Cleanup**: Proper cleanup of event listeners
- **Memory Leaks**: Prevention of memory leaks in drag operations
- **Efficient State**: Minimal state updates for better performance

## Troubleshooting

### Common Issues

**Issue**: Drag not working
- **Solution**: Ensure `DndContext` wraps all draggable components
- **Check**: Verify sensors are properly configured

**Issue**: Drop not working
- **Solution**: Ensure `SortableContext` wraps drop zones
- **Check**: Verify `items` array includes all draggable IDs

**Issue**: Visual feedback not showing
- **Solution**: Check `DragOverlay` implementation
- **Check**: Verify `activeTask` state is properly managed

**Issue**: Database not updating
- **Solution**: Check `useEffect` dependencies
- **Check**: Verify `updateBoardToDb` mutation is working

### Debug Tips

1. **Console Logging**: Add console logs to drag handlers
2. **React DevTools**: Use React DevTools to inspect state
3. **Network Tab**: Check network requests for database updates
4. **Error Boundaries**: Implement error boundaries for better error handling

## Testing

### Manual Testing Checklist

- ✅ Drag tasks within the same column
- ✅ Drag tasks between different columns
- ✅ Visual feedback during drag operations
- ✅ Database updates after drag operations
- ✅ Edit/delete buttons still work after drag
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility

### Automated Testing

```typescript
// Example test for drag and drop
import { render, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';

test('should move task between columns', () => {
  // Test implementation
});
```

## Best Practices

### Code Organization

- **Separate Components**: Keep sortable components separate
- **Custom Hooks**: Extract drag logic into custom hooks
- **Type Safety**: Use TypeScript for all drag operations
- **Error Handling**: Implement comprehensive error handling

### Performance

- **Debouncing**: Debounce database updates if needed
- **Memoization**: Memoize expensive calculations
- **Lazy Loading**: Implement lazy loading for large lists
- **Virtualization**: Consider virtualization for very large lists

### User Experience

- **Visual Feedback**: Provide clear visual feedback
- **Loading States**: Show loading states during operations
- **Error Messages**: Display helpful error messages
- **Accessibility**: Ensure full accessibility compliance

## Migration from react-beautiful-dnd

### Key Differences

1. **API Changes**: Different component names and props
2. **Event Handling**: Different event structure
3. **State Management**: Different state management approach
4. **Styling**: Different styling approach

### Migration Steps

1. **Install @dnd-kit**: Replace react-beautiful-dnd with @dnd-kit
2. **Update Imports**: Change import statements
3. **Refactor Components**: Update component structure
4. **Update Handlers**: Modify drag and drop handlers
5. **Test Functionality**: Ensure all features work correctly

## Next Steps

After implementing drag and drop:

1. **Add Animations**: Implement smooth animations for better UX
2. **Multi-select**: Add multi-select drag functionality
3. **Nested Drag**: Implement nested drag and drop for subtasks
4. **Touch Support**: Enhance touch device support
5. **Performance**: Optimize for large datasets

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
