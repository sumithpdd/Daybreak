# Junior Developer Guide: Getting Started with MyKanban App

Welcome! This guide will help you understand and set up the MyKanban application from scratch. We'll explain everything step by step.

---

## 📚 Table of Contents

1. [What is MyKanban?](#what-is-mykanban)
2. [Tech Stack Explained](#tech-stack-explained)
3. [Project Architecture](#project-architecture)
4. [Setup Guide](#setup-guide)
5. [Understanding the Codebase](#understanding-the-codebase)
6. [Data Flow](#data-flow)
7. [Key Concepts](#key-concepts)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 What is MyKanban?

MyKanban is a **full-stack task management application** with two main features:

1. **Kanban Boards**: Visual boards with drag-and-drop tasks (like Trello)
2. **OKR Management**: Track Objectives and Key Results (goals and outcomes)

**Real-world use case**: A development team can:
- Create boards for different projects
- Track tasks across "To Do", "In Progress", "Done" columns
- Set quarterly OKRs and link tasks to objectives
- Track progress on both tasks and goals

---

## 🛠️ Tech Stack Explained

### Frontend (What users see)
- **Next.js 15**: React framework with App Router (server + client components)
- **React 18**: UI library for building interactive interfaces
- **TypeScript**: JavaScript with type safety (prevents bugs)
- **Tailwind CSS**: Utility-first CSS (fast styling)

### State Management (How data is managed)
- **Redux Toolkit**: Global state container
- **RTK Query**: Data fetching and caching (like a smart API client)

### Backend/Database
- **Firebase Firestore**: NoSQL cloud database (real-time, scalable)
- **NextAuth.js**: Authentication library (handles Google login)
- **Firebase Admin SDK**: Server-side database access (for seed scripts)

### Other Tools
- **@dnd-kit**: Drag-and-drop library
- **Lexical**: Rich text editor
- **DOMPurify**: HTML sanitization (security)

---

## 🏗️ Project Architecture

```
User opens browser → Next.js App → NextAuth (Login) → Redux Store → RTK Query → Firebase
                                                         ↓
                                               React Components
                                                         ↓
                                               User Interface
```

### File Structure

```
mykanban-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/auth/[...nextauth]/  # Authentication endpoints
│   │   ├── components/               # React components
│   │   │   ├── Navbar.tsx           # Top navigation
│   │   │   ├── Sidebar.tsx          # Board selector
│   │   │   ├── BoardTasks.tsx       # Kanban board
│   │   │   ├── OKRBoard.tsx         # OKR management
│   │   │   └── common/              # Reusable components
│   │   ├── okrs/page.tsx            # OKR page route
│   │   ├── page.tsx                 # Home page (boards)
│   │   ├── layout.tsx               # App wrapper
│   │   └── utils/
│   │       └── firebaseConfig.ts    # Firebase setup
│   ├── redux/
│   │   ├── features/
│   │   │   └── appSlice.ts          # UI state (modals, current board)
│   │   ├── services/
│   │   │   └── apiSlice.ts          # API endpoints (CRUD operations)
│   │   └── store.ts                 # Redux configuration
│   └── middleware.ts                 # Route protection
├── docs/                             # Documentation
├── data-migration/                   # Seed scripts
├── .env.local                        # Environment variables (NOT in git)
├── serviceAccountKey.json            # Firebase credentials (NOT in git)
└── package.json                      # Dependencies
```

---

## 🚀 Setup Guide

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Google Account** - For OAuth login
3. **Firebase Account** - [Sign up here](https://firebase.google.com/)

### Step 1: Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd mykanban-app

# Install dependencies
npm install
```

**What this does**: Downloads all required packages (React, Next.js, etc.)

### Step 2: Set Up Firebase

#### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "my-kanban-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

#### 2.2 Enable Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security later)
4. Select a region (closest to you)
5. Click "Enable"

#### 2.3 Get Firebase Config

1. Click the **gear icon** → "Project settings"
2. Scroll down to "Your apps"
3. Click the **web icon** `</>`
4. Register your app (name: "MyKanban Web")
5. Copy the `firebaseConfig` object
6. Keep this tab open (you'll need these values)

#### 2.4 Get Service Account Key

1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Click "Generate key" (downloads JSON file)
4. Save it as `serviceAccountKey.json` in your project root
5. **IMPORTANT**: Never commit this file to git!

### Step 3: Set Up Google OAuth

#### 3.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create one)
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted:
   - User Type: External
   - App name: MyKanban App
   - Support email: Your email
   - Developer contact: Your email
   - Save and continue through all steps
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: MyKanban Web Client
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. **Copy Client ID and Client Secret** (keep them safe!)

### Step 4: Configure Environment Variables

Create `.env.local` in project root:

```bash
# Copy template
cp env-template.txt .env.local
```

Edit `.env.local` with your actual values:

```env
# Google OAuth (from step 3)
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here

# NextAuth (generate a random string)
NEXTAUTH_SECRET=run-node-generate-secret-js
NEXTAUTH_URL=http://localhost:3000

# Firebase (from step 2.3)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Lexical (get free key at tiny.cloud)
```

**Generate NextAuth Secret**:
```bash
node generate-secret.js
```

### Step 5: Deploy Firestore Security Rules

```bash
# For development (allows all operations)
firebase use --add
firebase deploy --only firestore:rules
```

Choose `firestore.dev.rules` for development.

### Step 6: Seed Initial Data

#### 6.1 Set Service Account Environment Variable

**Windows PowerShell**:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
```

**macOS/Linux**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"
```

#### 6.2 Seed Categories (Required)

```bash
node data-migration/seed-categories.js
```

**What this does**: Creates 11 default categories for OKRs.

#### 6.3 Seed Sample Data (Optional)

```bash
node data-migration/seed-okrs-with-tasks.js your-email@example.com
```

**What this does**: Creates 4 sample OKRs and 12 tasks linked to them.

### Step 7: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**First time**: Click "Sign In" and use your Google account.

---

## 📖 Understanding the Codebase

### How Next.js App Router Works

**App Router** (new in Next.js 13+) uses file-based routing:

```
src/app/
├── page.tsx           → Route: /           (Home page)
├── okrs/
│   └── page.tsx       → Route: /okrs       (OKRs page)
├── layout.tsx         → Wraps all pages
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts → API: /api/auth/* (Auth endpoints)
```

**Key Difference from Pages Router**:
- `page.tsx` instead of `index.tsx`
- Server Components by default
- Client Components need `'use client'`

### Server vs Client Components

**Server Components** (default):
- Run on the server
- Can access database directly
- Don't include JavaScript in browser
- Better performance

**Client Components** (`'use client'` at top):
- Run in browser
- Can use hooks (useState, useEffect)
- Can handle user interactions
- Necessary for interactive features

**Example**:
```typescript
// Client Component (has 'use client')
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Redux Toolkit + RTK Query

**Redux Toolkit** simplifies Redux:
- Less boilerplate
- Built-in best practices
- Immutable updates made easy

**RTK Query** handles API calls:
- Automatic caching
- Loading/error states
- Optimistic updates
- Cache invalidation

**Example**:
```typescript
// In apiSlice.ts - Define endpoint
fetchBoards: builder.query<IBoard[], void>({
  async queryFn() {
    // Fetch from Firestore
    const snapshot = await getDocs(collection(db, 'boards'));
    return { data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) };
  },
  providesTags: ['Boards']
}),

// In component - Use hook
const { data: boards, isLoading } = useFetchBoardsQuery();
```

### Firebase Firestore

**NoSQL Database Structure**:
```
firestore (root)
├── users/
│   └── {userId}          # Document
│       ├── email
│       ├── name
│       └── isApproved
├── boards/
│   └── {boardId}         # Document
│       ├── name
│       ├── ownerId
│       └── columns: []   # Array of columns with tasks
├── okrs/
│   └── {okrId}          # Document
│       ├── objective
│       ├── keyResults: []
│       └── ownerId
└── categories/
    └── {categoryId}      # Document
        ├── name
        └── color
```

**Key Concepts**:
- **Collections**: Like tables (e.g., `users`, `boards`)
- **Documents**: Individual records (e.g., one user, one board)
- **Subcollections**: Collections inside documents (we use arrays instead)
- **Real-time**: Can listen for changes automatically

---

## 🔄 Data Flow

### Example: Creating a New Task

```
1. User clicks "Add Task" button
   ↓
2. Component dispatches Redux action: setTaskModalOpen(true)
   ↓
3. Modal component renders with form
   ↓
4. User fills form and clicks "Create"
   ↓
5. Component calls mutation: useCreateTaskMutation()
   ↓
6. apiSlice.ts → createTask mutation runs
   ↓
7. Firestore: Update board document with new task
   ↓
8. RTK Query invalidates 'Boards' cache tag
   ↓
9. All components using useFetchBoardsQuery() automatically refetch
   ↓
10. UI updates with new task
```

### Authentication Flow

```
1. User clicks "Sign In"
   ↓
2. NextAuth redirects to Google OAuth
   ↓
3. User approves access
   ↓
4. Google redirects back with authorization code
   ↓
5. NextAuth exchanges code for user token
   ↓
6. NextAuth creates session
   ↓
7. useGetCurrentUserQuery() checks if user exists in Firestore
   ↓
8. If not, creates user document
   ↓
9. If isApproved === true, user can access app
   ↓
10. App renders with user data
```

---

## 🔑 Key Concepts

### 1. TypeScript Interfaces

Define data shapes to prevent bugs:

```typescript
interface ITask {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedTo: string[];  // Array of user IDs
  dueDate?: string;      // Optional field
}
```

**Why useful**: Your editor will autocomplete fields and catch typos!

### 2. React Hooks

Functions that add features to components:

- `useState`: Store component state
- `useEffect`: Run code when component mounts/updates
- `useMemo`: Cache computed values
- Custom hooks: Like `useFetchBoardsQuery()`

### 3. Tailwind CSS

Utility classes for styling:

```tsx
<div className="flex items-center gap-4 p-6 bg-blue-500 rounded-lg">
  {/* flex: display flex */}
  {/* items-center: align items center */}
  {/* gap-4: gap between items */}
  {/* p-6: padding 1.5rem */}
  {/* bg-blue-500: blue background */}
  {/* rounded-lg: large border radius */}
</div>
```

### 4. Firebase Security Rules

Control who can read/write data:

```javascript
// Allow users to only see their own boards
match /boards/{boardId} {
  allow read: if request.auth != null && 
                 resource.data.ownerId == request.auth.token.email;
  allow write: if request.auth != null && 
                  request.resource.data.ownerId == request.auth.token.email;
}
```

---

## 💼 Common Tasks

### Adding a New Field to Tasks

**Example**: Add a "priority" field

**Step 1**: Update TypeScript interface

```typescript
// src/redux/services/apiSlice.ts
export interface ITask {
  // ... existing fields
  priority?: 'Low' | 'Medium' | 'High';  // Add this
}
```

**Step 2**: Update modal form

```typescript
// src/app/components/AddAndEditTaskModal.tsx
const [priority, setPriority] = useState<string>('Medium');

// Add to JSX:
<select value={priority} onChange={(e) => setPriority(e.target.value)}>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
</select>
```

**Step 3**: Include in create/update mutations

```typescript
// In handleSubmit:
const taskData: ITask = {
  // ... existing fields
  priority: priority as 'Low' | 'Medium' | 'High'
};
```

**Step 4**: Display in UI

```typescript
// src/app/components/BoardTasks.tsx
<span className="text-sm text-gray-600">
  Priority: {task.priority || 'Medium'}
</span>
```

### Creating a New Page

**Example**: Add a "/reports" page

**Step 1**: Create page file

```typescript
// src/app/reports/page.tsx
'use client';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Reports</h1>
      {/* Your content */}
    </div>
  );
}
```

**Step 2**: Add navigation link

```typescript
// src/app/components/Navbar.tsx
<Link href="/reports" className="...">
  📊 Reports
</Link>
```

**Step 3**: Protect route (if needed)

```typescript
// src/middleware.ts
export const config = {
  matcher: ['/', '/okrs', '/reports']  // Add /reports
};
```

### Adding a New API Endpoint

**Example**: Add "duplicate board" feature

```typescript
// src/redux/services/apiSlice.ts

// Add mutation
duplicateBoard: builder.mutation<IBoard, string>({
  async queryFn(boardId) {
    // 1. Get original board
    const boardDoc = await getDoc(doc(db, 'boards', boardId));
    const original = boardDoc.data() as IBoard;
    
    // 2. Create copy
    const newBoard = {
      ...original,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 3. Add to Firestore
    const docRef = await addDoc(collection(db, 'boards'), newBoard);
    
    return { data: { ...newBoard, id: docRef.id } };
  },
  invalidatesTags: ['Boards']  // Refresh boards list
}),

// Export hook
export const { useDuplicateBoardMutation } = api;
```

**Use in component**:

```typescript
const [duplicateBoard] = useDuplicateBoardMutation();

const handleDuplicate = async (boardId: string) => {
  try {
    await duplicateBoard(boardId).unwrap();
    alert('Board duplicated!');
  } catch (error) {
    alert('Error duplicating board');
  }
};
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Cause**: Missing dependencies

**Solution**:
```bash
npm install
```

### Issue: "useSession" hook returns null

**Cause**: Not wrapped in SessionProvider

**Solution**: Check that `layout.tsx` has:
```typescript
<SessionProvider>{children}</SessionProvider>
```

### Issue: Firebase "Permission denied"

**Cause**: Security rules blocking request or user not authenticated

**Solution**:
1. Check you're signed in (top-right corner)
2. Verify security rules in Firebase Console
3. For development, use `firestore.dev.rules` (allows all operations)

### Issue: Environment variables undefined

**Cause**: `.env.local` not loaded or wrong variable names

**Solution**:
1. Verify `.env.local` exists
2. Restart dev server (`npm run dev`)
3. Check variable names start with `NEXT_PUBLIC_` for client-side access

### Issue: "Hydration error"

**Cause**: Server and client render different HTML

**Solution**:
1. Don't use `localStorage` or `window` during initial render
2. Use `useEffect` for client-only code
3. Add `suppressHydrationWarning` if unavoidable

---

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router Tutorial](https://nextjs.org/learn)

### React
- [React Documentation](https://react.dev/)
- [React Hooks Guide](https://react.dev/reference/react)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for React Developers](https://react-typescript-cheatsheet.netlify.app/)

### Redux
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [RTK Query Tutorial](https://redux-toolkit.js.org/tutorials/rtk-query)

### Firebase
- [Firestore Get Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

---

## 🎯 Next Steps

1. **Complete setup** following this guide
2. **Explore the codebase** - Read through key files
3. **Make small changes** - Try adding a new field
4. **Read other docs**:
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
   - [DATA_MODEL.md](./DATA_MODEL.md) - Database schema
   - [OKR_FEATURE.md](./OKR_FEATURE.md) - OKR system explained
5. **Build a feature** - Start with something simple
6. **Ask questions** - Don't hesitate to ask the team!

---

## 🤝 Getting Help

- **Code Issues**: Check browser console (F12) for errors
- **Database Issues**: Check Firebase Console for data
- **Build Errors**: Read error message carefully, Google it
- **Stuck?**: Ask senior developers or check documentation

---

**Welcome to the team! Happy coding! 🚀**

