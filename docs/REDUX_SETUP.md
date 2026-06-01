# Redux Store Configuration

This guide covers setting up Redux Toolkit with RTK Query for state management in the My Kanban Task Management App.

## Why Redux Toolkit?

Redux Toolkit provides several advantages for state management:

- **Predictable State Updates**: Centralized state management with clear data flow
- **Developer Tools**: Time-travel debugging and state inspection
- **Performance**: Optimized re-renders with selectors
- **TypeScript Support**: Full type safety for state and actions
- **RTK Query**: Built-in data fetching and caching capabilities
- **Boilerplate Reduction**: Less code compared to traditional Redux

## Step-by-Step Setup

### 1. Install Required Packages

```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Create Redux Store Structure

```
src/redux/
├── store.ts
├── hooks.ts
├── provider.tsx
├── rootReducer.ts
├── features/
│   └── appSlice.ts
└── services/
    └── apiSlice.ts
```

### 3. Set up the Store (`src/redux/store.ts`)

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { rootReducer } from "./rootReducer";
import { fireStoreApi } from "./services/apiSlice";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(fireStoreApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 4. Create Root Reducer (`src/redux/rootReducer.ts`)

```typescript
import { combineReducers } from "@reduxjs/toolkit";
import { fireStoreApi } from "./services/apiSlice";
import featuresReducer from "./features/appSlice";

export const rootReducer = combineReducers({
  features: featuresReducer,
  [fireStoreApi.reducerPath]: fireStoreApi.reducer,
});
```

### 5. Create Typed Hooks (`src/redux/hooks.ts`)

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Typed versions of useDispatch and useSelector hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 6. Create Provider Component (`src/redux/provider.tsx`)

```typescript
'use client'
import { store } from "./store";
import { Provider } from "react-redux";

// Custom provider component
export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

**Understanding `'use client'` Directive:**

The `'use client'` directive tells Next.js that this component should run on the client side. Here's why it's needed:

- **Server-Side Rendering (SSR)**: Next.js renders components on the server by default
- **Redux Store**: Redux state management requires browser APIs and client-side JavaScript
- **React Context**: The Provider component needs to run in the browser to manage state
- **Hydration**: Ensures the Redux store is properly initialized on the client

Without `'use client'`, you'd get errors like "useContext can only be called inside a client component."

### 7. Update Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next'
import { Providers } from "@/redux/provider";
import Navbar from './components/Navbar';
import { Plus_Jakarta_Sans } from "next/font/google";
import './globals.css'

const pjs = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: 'My Kanban Task Management App',
  description: 'A full-stack Kanban task management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={pjs.className}>
      <body className='pb-24 h-screen overflow-hidden'>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 8. Update TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Application State Slice (`src/redux/features/appSlice.ts`)

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
  currentBoardName: "",
  // Manage the state for opening and closing the Add and Edit Board modal
  isAddAndEditBoardModal: { isOpen: false, variant: "" },
  isAddAndEditTaskModal: { isOpen: false, variant: "", title: "", index: -1, name: ""},
  isDeleteBoardAndTaskModal: { isOpen: false, variant: "", title:'', status: "", index: -1 },
};

export const features = createSlice({
  name: "features",
  initialState,

  reducers: {
    setCurrentBoardName: (state, action: PayloadAction<string>) => {
      state.currentBoardName = action.payload;
    },
    // Open the Add and Edit Board modal with a specified variant (add or edit)
    openAddAndEditBoardModal: (state, { payload }) => {
      state.isAddAndEditBoardModal.isOpen = true;
      state.isAddAndEditBoardModal.variant = payload;
    },
    // Close the Add and Edit Board modal
    closeAddAndEditBoardModal: (state) => {
      state.isAddAndEditBoardModal.isOpen = false;
      state.isAddAndEditBoardModal.variant = "";
    },
    // Open the Add and Edit task modal with a specified variant (add or edit), title, description, status
    openAddAndEditTaskModal: (state, { payload }) => {
      state.isAddAndEditTaskModal.isOpen = true;
      state.isAddAndEditTaskModal.variant = payload.variant;
      state.isAddAndEditTaskModal.title = payload.title;
      state.isAddAndEditTaskModal.index = payload.index;
      state.isAddAndEditTaskModal.name = payload.name;
    },
    // Close the Add and Edit task modal
    closeAddAndEditTaskModal: (state) => {
      state.isAddAndEditTaskModal.isOpen = false;
      state.isAddAndEditTaskModal.variant = "";
      state.isAddAndEditTaskModal.title = "";
      state.isAddAndEditTaskModal.index = -1;
      state.isAddAndEditTaskModal.name = "";
    },
    // Open the delete board and task modal with a specified variant (delete board or task)
    openDeleteBoardAndTaskModal: (state, { payload }) => {
      state.isDeleteBoardAndTaskModal.isOpen = true;
      state.isDeleteBoardAndTaskModal.variant = payload.variant;
      state.isDeleteBoardAndTaskModal.title = payload.title;
      state.isDeleteBoardAndTaskModal.status = payload.status;
      state.isDeleteBoardAndTaskModal.index = payload.index;
    },
    // Close the delete board and task modal
    closeDeleteBoardAndTaskModal: (state) => {
      state.isDeleteBoardAndTaskModal.isOpen = false;
      state.isDeleteBoardAndTaskModal.variant = "";
      state.isDeleteBoardAndTaskModal.title = "";
      state.isDeleteBoardAndTaskModal.status = "";
      state.isDeleteBoardAndTaskModal.index = -1;
    },
  },
});

export const {
  setCurrentBoardName,
  openAddAndEditBoardModal,
  closeAddAndEditBoardModal,
  openAddAndEditTaskModal,
  closeAddAndEditTaskModal,
  openDeleteBoardAndTaskModal,
  closeDeleteBoardAndTaskModal,
} = features.actions;

// Selector functions
export const getCurrentBoardName = (state: RootState) => state.features.currentBoardName;
export const getAddAndEditBoardModalValue = (state: RootState) => state.features.isAddAndEditBoardModal.isOpen;
export const getAddAndEditBoardModalVariantValue = (state: RootState) => state.features.isAddAndEditBoardModal.variant;
export const getAddAndEditTaskModalValue = (state: RootState) => state.features.isAddAndEditTaskModal.isOpen;
export const getAddAndEditTaskModalVariantValue = (state: RootState) => state.features.isAddAndEditTaskModal.variant;
export const getAddAndEditTaskModalTitle = (state: RootState) => state.features.isAddAndEditTaskModal.title;
export const getAddAndEditTaskModalIndex = (state: RootState) => state.features.isAddAndEditTaskModal.index;
export const getAddAndEditTaskModalName = (state: RootState) => state.features.isAddAndEditTaskModal.name;
export const getDeleteBoardAndTaskModalValue = (state: RootState) => state.features.isDeleteBoardAndTaskModal.isOpen;
export const getDeleteBoardAndTaskModalVariantValue = (state: RootState) => state.features.isDeleteBoardAndTaskModal.variant;
export const getDeleteBoardAndTaskModalTitle = (state: RootState) => state.features.isDeleteBoardAndTaskModal.title;
export const getDeleteBoardAndTaskModalStatus = (state: RootState) => state.features.isDeleteBoardAndTaskModal.status;
export const getDeleteBoardAndTaskModalIndex = (state: RootState) => state.features.isDeleteBoardAndTaskModal.index;

export default features.reducer;
```

## RTK Query API Slice (`src/redux/services/apiSlice.ts`)

```typescript
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";

export const fireStoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    fetchDataFromDb: builder.query<{ [key: string]: any }[], void>({
      async queryFn() {
        try {
          const session = await getSession();
          if (session?.user) {
            const { user } = session;
            const ref = collection(db, `users/${user.email}/tasks`);
            const querySnapshot = await getDocs(ref);
            return { data: querySnapshot.docs.map((doc) => doc.data()) };
          }
          return { data: [] };
        } catch (e) {
          return { error: e };
        }
      },
      providesTags: ["Tasks"],
    }),
    updateBoardToDb: builder.mutation({
      async queryFn(boardData) {
        try {
          const session = await getSession();
          if (session?.user) {
            const { user } = session;
            const ref = collection(db, `users/${user.email}/tasks`);
            const querySnapshot = await getDocs(ref);
            const boardId = querySnapshot.docs.map((doc) => {
              return doc.id;
            });
            await updateDoc(doc(db, `users/${user.email}/tasks/${boardId[0]}`), {
              boards: boardData,
            });
          }
          return { data: null };
        } catch (e) {
          return { error: e };
        }
      },
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const { useFetchDataFromDbQuery, useUpdateBoardToDbMutation } = fireStoreApi;
```

## Key Benefits of This Setup

- **Type Safety**: Full TypeScript support for all Redux operations
- **Performance**: Optimized re-renders and state updates
- **Developer Experience**: Redux DevTools integration for debugging
- **Scalability**: Easy to add new slices and reducers as the app grows
- **Data Fetching**: RTK Query ready for API integration
- **Modal Management**: Centralized state for all modal operations
- **Real-time Updates**: Automatic cache invalidation and refetching

## Usage Examples

### Using Typed Hooks in Components

```typescript
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentBoardName, getCurrentBoardName } from "@/redux/features/appSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const currentBoard = useAppSelector(getCurrentBoardName);
  
  const handleBoardChange = (name: string) => {
    dispatch(setCurrentBoardName(name));
  };
  
  return <div>Current Board: {currentBoard}</div>;
}
```

### Using RTK Query Hooks

```typescript
import { useFetchDataFromDbQuery, useUpdateBoardToDbMutation } from "@/redux/services/apiSlice";

function DataComponent() {
  const { data, isLoading, error } = useFetchDataFromDbQuery();
  const [updateBoard] = useUpdateBoardToDbMutation();
  
  const handleUpdate = async (boardData: any) => {
    try {
      await updateBoard(boardData).unwrap();
      // Data will automatically refetch due to invalidatesTags
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  
  return <div>{/* Render your data */}</div>;
}
```

## Next Steps

After setting up Redux:

1. **Create UI components** that use Redux state
2. **Set up Firebase** for data persistence
3. **Implement CRUD operations** using RTK Query
4. **Add form validation** and error handling
5. **Test state management** with Redux DevTools

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
