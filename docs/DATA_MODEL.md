# Data Model

We use four top-level collections: `users`, `tags`, `boards`, `okrs`.

## users
```
{
  id: string,
  email: string,
  name: string,
  avatar?: string,
  createdAt: string,
  updatedAt: string
}
```

## tags
```
{
  id: string,
  name: string,
  color: string,
  description?: string,
  createdAt: string,
  updatedAt: string
}
```

## boards
```
{
  id: string,
  ownerId: string, // user email
  name: string,
  description?: string,
  columns: Column[],
  createdAt: string,
  updatedAt: string
}
```

### Column
```
{
  id: string,
  name: string,
  tasks: Task[]
}
```

### Task
```
{
  id: string,
  title: string,
  description: string, // HTML
  status: string,      // matches a column name
  order: number,       // 0-based position in column
  tags: string[],      // Tag IDs
  assignedTo: string[],// User IDs
  dueDate?: string,
  startDate?: string,  // Start date for the task
  createdAt: string,
  createdBy?: string,
  updatedAt: string,
  updatedBy?: string,
  completedDate?: string,
  timeSpent: number,   // minutes
  timeEstimate?: number,// minutes
  notes?: string,
  checklistItems?: ChecklistItem[],
  okrId?: string,      // Optional link to an OKR
  keyResultId?: string,// Optional link to a specific key result within an OKR
  progress?: number    // Progress percentage (0-100) for tasks linked to key results
}
```

### ChecklistItem
```
{
  id: string,
  text: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string
}
```

## okrs
```
{
  id: string,
  ownerId: string,      // user email who owns this OKR
  objective: string,    // The objective title
  keyResults: KeyResult[], // 2-4 measurable key results
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision',
  category: string[],   // Array of categories like "General Business OKR FY26", "Required AI OKR FY26"
  progress: number,     // 0-100 percentage
  startDate?: string,
  endDate?: string,
  notes?: string,
  archived: boolean,    // For archived objectives
  isOrganizational: boolean, // For organization objectives
  createdAt: string,
  updatedAt: string
}
```

### KeyResult
```
{
  id: string,
  text: string,
  completed: boolean,
  targetValue?: string, // e.g., "75%", "10 assessments", "2 workshops"
  currentValue?: string, // current progress value
  createdAt: string,
  updatedAt: string
}
```

Notes
- Keep relations by ID (emails or generated IDs)
- Client converts time fields to hours for input; stored as minutes
- `description` is sanitized on render with DOMPurify
- Tasks can optionally link to OKRs and specific key results
- Tasks linked to key results include startDate, dueDate, and progress percentage
- OKRs support progress tracking (0-100%), start/end dates, and categorization
- OKR progress can be auto-calculated based on linked task completion
- Each objective should have 2-4 key results
- OKRs can be viewed in List View or Kanban View (drag-and-drop between statuses)
- Tabs filter OKRs by: Individual, In Progress, Completed, Archived, Organizational
