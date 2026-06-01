# Application Journey: End-to-End User Experience

This document explains how users interact with MyKanban from start to finish, including all features and flows.

---

## 🎬 Table of Contents

1. [User Journey Overview](#user-journey-overview)
2. [First-Time User Experience](#first-time-user-experience)
3. [Kanban Board Journey](#kanban-board-journey)
4. [OKR Management Journey](#okr-management-journey)
5. [Task-OKR Integration Journey](#task-okr-integration-journey)
6. [Technical Flow Behind the Scenes](#technical-flow-behind-the-scenes)

---

## 🗺️ User Journey Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MyKanban App                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Landing Page (/)  →  Sign In  →  Dashboard                     │
│                                      │                            │
│                           ┌──────────┴───────────┐              │
│                           │                      │              │
│                    📋 Boards View         🎯 OKRs View         │
│                           │                      │              │
│              ┌────────────┼────────────┐         │              │
│              │            │            │         │              │
│          Create      View/Edit      Delete   Manage OKRs       │
│           Board        Tasks        Board    & Track Progress  │
│              │            │            │         │              │
│              │            │            │         │              │
│              └────────────┴────────────┘         │              │
│                           │                      │              │
│                           │                      │              │
│                    Drag & Drop              Link Tasks         │
│                    Time Tracking            to Objectives      │
│                    Checklists                                   │
│                    Tags & Assignments                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 First-Time User Experience

### Step 1: Landing Page

**What the user sees**:
- Clean homepage with navigation bar
- "Sign In with Google" button
- Application logo and branding

**Behind the scenes**:
```typescript
// middleware.ts checks if user is authenticated
// If not → redirects to sign-in page
// NextAuth.js handles the authentication flow
```

### Step 2: Google Sign-In

**User action**: Clicks "Sign In with Google"

**What happens**:
1. Browser redirects to Google OAuth page
2. User selects Google account and grants permissions
3. Google redirects back to app with authorization code
4. NextAuth exchanges code for user session token
5. App creates session cookie

**Technical flow**:
```
User → NextAuth → Google OAuth → Authorization Code 
     → NextAuth validates → Creates session → Stores cookie
     → Checks Firestore for user document
     → Creates user if doesn't exist
     → Redirects to dashboard
```

**Database update**:
```javascript
// Firestore: users collection
{
  id: "auto-generated-id",
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://google-profile-pic-url",
  isApproved: false,  // ← Admin must set to true
  createdAt: "2025-11-03T10:00:00Z",
  updatedAt: "2025-11-03T10:00:00Z"
}
```

### Step 3: Approval Gate

**First time**: User sees message: "Account pending approval"

**Admin action required**: 
1. Go to Firebase Console → Firestore
2. Find user document
3. Set `isApproved: true`
4. User refreshes → Can now access app

**Why?**: This prevents unauthorized access in production.

### Step 4: Dashboard View

**Once approved**, user sees:
- **Navbar**: Logo, "Boards" button, "OKRs" button, profile picture
- **Sidebar**: List of their boards (initially empty)
- **Main area**: Welcome message or empty state
- **Actions**: "+ Add Board" button

---

## 📋 Kanban Board Journey

### 1. Creating First Board

**User clicks**: "+ Add Board" button

**Modal appears** with:
- Board name input (required)
- Description textarea (optional)
- "Create Board" button

**User enters**:
- Name: "Q1 2025 Sprint"
- Description: "Tasks for Q1 development sprint"
- Clicks "Create Board"

**What happens**:
```
1. Form validation (name is required)
2. useCreateBoardMutation() called
3. Creates Firestore document:
   {
     id: "board-123",
     ownerId: "user@example.com",
     name: "Q1 2025 Sprint",
     description: "Tasks for Q1 development sprint",
     columns: [
       {
         id: "col-1",
         name: "To Do",
         tasks: []
       },
       {
         id: "col-2",
         name: "In Progress",
         tasks: []
       },
       {
         id: "col-3",
         name: "Done",
         tasks: []
       }
     ],
     createdAt: "2025-11-03T10:05:00Z",
     updatedAt: "2025-11-03T10:05:00Z"
   }
4. RTK Query invalidates 'Boards' cache
5. Sidebar refetches and shows new board
6. Board auto-selected and displays
```

### 2. Adding Tasks

**User clicks**: "+ Add Task" button in "To Do" column

**Modal opens** with form:
- **Title** (required): "Implement user authentication"
- **Description** (rich text): "Add Google OAuth with NextAuth..."
- **Status** (dropdown): "To Do"
- **Tags** (multi-select): "Backend", "Security"
- **Assigned to** (multi-select): "John Doe"
- **Due date** (calendar): "2025-11-15"
- **Time estimate**: "8 hours"
- **Checklist**: 
  - "Set up Google OAuth credentials"
  - "Install NextAuth package"
  - "Configure middleware"

**User clicks**: "Create Task"

**Result**:
```
Task appears in "To Do" column:
┌─────────────────────────────────────┐
│ Implement user authentication       │
│ ─────────────────────────────────── │
│ 🏷️ Backend  Security               │
│ 👤 John Doe                         │
│ 📅 Due: Nov 15                      │
│ ⏱️ 8h estimated                     │
│ ✓ 0/3 checklist items               │
└─────────────────────────────────────┘
```

### 3. Drag and Drop Workflow

**User workflow**:
1. Starts working on task → **Drags from "To Do" to "In Progress"**
2. Completes task → **Drags from "In Progress" to "Done"**

**What happens on drag**:
```typescript
// When user starts dragging
onDragStart: Task card follows cursor, column highlights

// While dragging over column
onDragOver: Column changes background (visual feedback)

// When dropped
onDragEnd:
  1. Update task's column in Firestore
  2. Update task's status
  3. If dropped in "Done" → set completedDate
  4. Recalculate task order
  5. RTK Query refetches board
  6. UI updates instantly (optimistic update)
```

**Visual feedback**:
```
To Do Column           In Progress Column        Done Column
┌─────────┐            ┌─────────┐            ┌─────────┐
│         │            │ [Task]  │            │         │
│         │  ────────> │  ↓↓↓    │            │         │
│         │            │ Hover!  │            │         │
│         │            └─────────┘            │         │
└─────────┘                                   └─────────┘
```

### 4. Editing Tasks

**User double-clicks** task card

**Modal opens** pre-filled with:
- All existing task data
- Edit mode enabled
- "Update Task" button (instead of "Create")

**User can**:
- Change any field
- Add/remove checklist items
- Check off completed items
- Update time spent
- Modify assignments

**Checklist interaction**:
```
┌──────────────────────────────────────┐
│ Checklist (2/3 completed)            │
├──────────────────────────────────────┤
│ ☑ Set up Google OAuth credentials    │
│ ☑ Install NextAuth package           │
│ ☐ Configure middleware                │
│ [+] Add item                          │
└──────────────────────────────────────┘
```

**User presses Enter** in checklist → New item added instantly

### 5. Time Tracking

**As user works**:
1. Opens task
2. Updates "Time spent" field: "3 hours"
3. Saves task

**Visual indicator**:
```
⏱️ 3h / 8h (37.5%)
[████░░░░░░░░░░░░] Progress bar
```

**When task is complete**:
```
⏱️ 9h / 8h (112.5%) ⚠️ Over estimate
[████████████████████] Red progress bar
```

### 6. Filtering and Search

**User types** in search box: "authentication"

**Results**:
- Only tasks with "authentication" in title/description show
- Other tasks temporarily hidden
- Clear search → All tasks reappear

**Filter by tag**:
```
All Tags ▾  →  [Backend] [Frontend] [Security] [Bug]
               └── User clicks "Backend" → Only Backend tasks show
```

---

## 🎯 OKR Management Journey

### 1. Navigating to OKRs

**User clicks**: "🎯 OKRs" button in navbar

**Page loads** showing:
- Header: "Track My Objectives"
- Filter tabs: All | Individual | In Progress | Completed | Archived | Organizational
- View toggles: Grid | List | Kanban
- Search bar
- "+ Add Objective" button
- OKR cards (if any exist)

### 2. Creating First OKR

**User clicks**: "+ Add Objective" button

**Modal opens** with three tabs:

**Tab 1: Objective Details**
```
Objective *: 
[Improve team productivity and collaboration_______]

Key Results (2-4 required):
1. [Reduce average task completion time by 25%__]
   Target: [25% reduction___]  Current: [10%___]
   ☐ Completed

2. [Achieve 90% sprint goal completion rate___]
   Target: [90%___]  Current: [75%___]
   ☐ Completed

[+ Add Key Result]

Status: [In Progress ▾]
Category: [☑ Team Management] [☑ Q4 2024]
```

**Tab 2: Additional Details**
```
Progress: [45]% ──────────────●──────── 100%

Start Date: [2025-10-01 📅]
End Date:   [2025-12-31 📅]

Notes:
[Focus on streamlining our sprint process and
improving team communication. Weekly check-ins
every Monday.]

☐ Mark as archived
☐ Mark as organizational
```

**Tab 3: History**
```
Created: Nov 3, 2025 at 10:15 AM
Updated: Nov 3, 2025 at 10:15 AM
Created by: John Doe
```

**User clicks**: "Create" button

**Result**: OKR card appears in grid:

```
┌─────────────────────────────────────────────┐
│ Improve team productivity and collaboration │
│ ─────────────────────────────────────────── │
│ Status: In Progress  Progress: 45%          │
│ [████████████░░░░░░░░░░░░]                 │
│                                              │
│ 📊 Key Results: 0 / 2 completed             │
│ 📅 Oct 1, 2025 → Dec 31, 2025              │
│ 🏷️ Team Management, Q4 2024                │
│                                              │
│ [Edit] [Delete] [+ Add Task]                │
└─────────────────────────────────────────────┘
```

### 3. Tracking Progress

**Weekly update flow**:

1. **User clicks** on OKR card to edit
2. Updates "Current" values on key results:
   ```
   Key Result 1:
   Target: 25% reduction
   Current: 10% → 18% (updated)
   ```
3. Updates progress slider: 45% → 60%
4. Adds notes: "Great progress this week. Team velocity improved."
5. **Clicks** "Update"

**Visual update**:
```
Progress bar animates from 45% to 60%
[████████████████░░░░░░░░░░░] 
45% ────────────────────> 60%
```

### 4. Marking Key Results Complete

**When target is achieved**:
1. Edit OKR
2. Check ☑ "Completed" next to key result
3. System updates count: "1 / 2 completed"
4. Progress automatically increases

### 5. Kanban View for OKRs

**User clicks**: "Kanban" view toggle

**Layout changes**:
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Not Started  │ In Progress  │  Completed   │ Needs Review │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │ [OKR Card 1] │              │              │
│ [OKR Card 2] │ [OKR Card 3] │ [OKR Card 4] │              │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**User drags** OKR from "In Progress" to "Completed"

**Auto-updates**:
- Status → "Completed"
- Progress → 100%
- Completion date set

---

## 🔗 Task-OKR Integration Journey

### 1. Creating Task from OKR

**User clicks**: "+ Add Task" button on OKR card

**Modal opens** pre-filled with:
- OKR context (read-only display)
- Key results dropdown (select which one this task supports)

**Form**:
```
Creating task for: Improve team productivity...

Which Key Result does this task support? *
[▾ Reduce average task completion time by 25%]

Task Details:
Title *: [Implement automated testing pipeline_]
Board *: [▾ Q1 2025 Sprint___]
Column *: [▾ To Do___]
Start Date: [2025-11-03 📅]
Due Date: [2025-11-15 📅]
Time Estimate: [16_] hours

[Create Task]
```

**User clicks**: "Create Task"

**What happens**:
```
1. Task created in specified board
2. Task includes hidden fields:
   - okrId: "okr-123"
   - keyResultId: "kr-1"
3. Task appears in board
4. Future: Progress on task contributes to OKR progress
```

### 2. Viewing Task-OKR Connection

**In task details** (when editing):
```
┌────────────────────────────────────────┐
│ 🔗 Linked to OKR                       │
│ ─────────────────────────────────────  │
│ Objective:                              │
│ "Improve team productivity..."          │
│                                          │
│ Key Result:                             │
│ "Reduce task completion time by 25%"    │
│                                          │
│ [View OKR] [Unlink]                     │
└────────────────────────────────────────┘
```

### 3. Progress Roll-up (Future Feature)

**Vision**:
```
OKR: Improve team productivity (60%)
│
├── Key Result 1: Reduce completion time by 25%
│   ├── Task A: Implement automated testing (75% done)
│   ├── Task B: Set up CI/CD pipeline (50% done)
│   └── Average: 62.5% → Contributes to Key Result
│
└── Key Result 2: 90% sprint goal completion
    ├── Task C: Improve sprint planning (100% done)
    └── Task D: Weekly retrospectives (80% done)
    └── Average: 90% → Key Result achieved! ✓
```

---

## ⚙️ Technical Flow Behind the Scenes

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Action                               │
│                   (Click "Create Task" button)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     React Component                              │
│   - Validates form data                                          │
│   - Calls useCreateTaskMutation() hook                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RTK Query (apiSlice.ts)                    │
│   - createTask mutation executes                                 │
│   - Prepares data for Firestore                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase SDK                                  │
│   - Converts to Firestore format                                │
│   - Sends HTTPS request to Firebase                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Firebase Cloud                                 │
│   - Validates authentication                                     │
│   - Checks security rules                                        │
│   - Writes to Firestore database                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Response                                    │
│   - Success: Returns task with ID                               │
│   - RTK Query invalidates 'Boards' cache tag                   │
│   - All components using useFetchBoardsQuery() refetch         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI Updates                                  │
│   - Modal closes                                                 │
│   - Task appears in board                                        │
│   - Success message shown                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
Every request includes:
┌──────────────────────────────────────┐
│ Request Headers:                      │
│ ─────────────────────────────────── │
│ Authorization: Bearer <session-token>│
│ Cookie: next-auth.session-token=xxx  │
└──────────────────────────────────────┘

Firebase checks:
1. Is token valid? (Not expired)
2. Does user exist? (In auth system)
3. Does security rule allow? (Firestore rules)
4. Is user owner of resource? (ownerId check)

If all pass → Request succeeds
If any fails → 403 Permission Denied
```

### Real-time Updates (Future Enhancement)

```
Current: Manual refresh via cache invalidation
Future: Real-time listeners

Setup:
const boardsRef = collection(db, 'boards');
onSnapshot(boardsRef, (snapshot) => {
  // Automatic UI update when board changes
  // Even if changed by another user/device
});

Use case:
- User 1 creates task
- User 2's screen updates automatically
- Collaborative editing possible
```

---

## 🎉 Summary

The MyKanban application provides:

1. **Seamless authentication** via Google OAuth
2. **Intuitive board management** with drag-and-drop
3. **Comprehensive task tracking** with time, checklists, tags
4. **Strategic OKR planning** with progress monitoring
5. **Task-objective alignment** connecting execution to goals

**Every interaction** follows a consistent pattern:
```
User Action → Component State → API Call → Database → Cache Invalidation → UI Update
```

This creates a **smooth, responsive experience** while maintaining **data integrity** and **real-time synchronization**.

---

**Next**: See [JUNIOR_DEV_GUIDE.md](./JUNIOR_DEV_GUIDE.md) for hands-on setup and development workflow.

