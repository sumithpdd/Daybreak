# Firebase Firestore Integration

This guide covers setting up Firebase Firestore for real-time data synchronization in the My Kanban Task Management App.

## Why Firebase Firestore?

Firebase Firestore provides several advantages for our Kanban application:

- **Real-time Updates**: Automatic synchronization across all connected clients
- **NoSQL Database**: Flexible document-based data structure perfect for Kanban boards
- **Offline Support**: Built-in offline capabilities with automatic sync when online
- **Scalability**: Handles growing user base and data volume automatically
- **Security**: Built-in security rules and authentication integration
- **Easy Integration**: Simple SDK with excellent Next.js support

## Step-by-Step Setup

### 1. Create Firebase Project

1. **Go to Firebase Console**: Visit [Firebase Console](https://console.firebase.google.com/)
2. **Create Project**: Click "Create a project" or "Add project"
3. **Enter Project Name**: Use a descriptive name (e.g., "mykanban-app")
4. **Follow Setup Wizard**: Complete the project creation process

### 2. Register Your App

1. **Add Web App**: Click the web icon (`</>`) to add a web application
2. **Enter App Nickname**: Use a descriptive name for your app
3. **Copy Configuration**: Save the Firebase configuration object

### 3. Install Firebase Package

```bash
npm install firebase
```

### 4. Configure Firebase (`src/app/utils/firebaseConfig.ts`)

Create the Firebase configuration file:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
```

### 5. Set Up Environment Variables

Add Firebase configuration to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 6. Set Up Firestore Database

1. **Navigate to Firestore**: Go to "Firestore Database" in the Firebase console
2. **Create Database**: Click "Create database"
3. **Choose Mode**: Select "Start in test mode" for development
4. **Select Location**: Choose your preferred database location

### 7. Configure Firestore Rules

For development, update the Firestore rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Security Warning**: These rules allow anyone to read and write to your database. Only use this for development. For production, implement proper security rules based on authentication.

## Data Structure Design

### Database Structure

```
users/
└── {user-email}/
    └── tasks/
        └── {document-id}/
            └── boards: [
                {
                  id: "board-1",
                  name: "Roadmap",
                  columns: [
                    {
                      id: "col-1",
                      name: "Now",
                      tasks: [
                        {
                          id: "task-1",
                          title: "Review feedback",
                          status: "Now"
                        }
                      ]
                    }
                  ]
                }
              ]
```

### Initial Data Setup (`src/app/utils/data.js`)

Create initial dummy data for new users:

```javascript
import { id } from './data';

export const data = {
  boards: [
    {
      id: id(),
      name: "Roadmap",
      columns: [
        {
          id: id(),
          name: "Now",
          tasks: [
            {
              id: id(),
              title: "Review early feedback and plan next steps for roadmap",
              status: "Now",
            },
            {
              id: id(),
              title: "Shopping Saturday",
              status: "Now",
            },
            {
              id: id(),
              title: "Movie Day",
              status: "Now",
            },
          ],
        },
        {
          id: id(),
          name: "Next",
          tasks: [
            {
              id: id(),
              title: "Launch version one",
              status: "Next",
            },
          ],
        },
        {
          id: id(),
          name: "Later",
          tasks: [
            {
              id: id(),
              title: "AI based SF",
              status: "Later",
            },
          ],
        },
        {
          id: id(),
          name: "DONE",
          tasks: [],
        },
      ],
    },
  ],
};

// Utility function to generate unique IDs
export function id() {
  return Math.random().toString(36).substr(2, 9);
}
```

## User-Specific Data Management

### Automatic Data Initialization (`src/app/page.tsx`)

```typescript
"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import { data } from "./utils/data";

export default function Home() {
  const [userDetails, setUserDetails] = useState<{ [key: string]: any }>();

  const getUserSession = async () => {
    const session = await getSession();
    if (session) {
      setUserDetails(session.user);
    }
  };

  const handleAddDoc = async () => {
    if (userDetails) {
      const docRef = collection(db, "users", userDetails.email, "tasks");
      const getDos = await getDocs(docRef);

      if (getDos.docs.length > 0) {
        return; // User already has data
      } else {
        try {
          await addDoc(
            collection(db, "users", userDetails.email, "tasks"),
            data
          );
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    }
  };

  useEffect(() => {
    getUserSession();
  }, []);

  useEffect(() => {
    handleAddDoc();
  }, [userDetails]);

  return (
    <main className="flex h-full">
      {/* Your components */}
    </main>
  );
}
```

## RTK Query Integration

### API Slice Configuration (`src/redux/services/apiSlice.ts`)

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
            const boardId = querySnapshot.docs.map((doc) => doc.id);
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

## Key Features

### Real-time Data Synchronization

- **Automatic Updates**: Changes are immediately reflected across all connected clients
- **Cache Management**: RTK Query handles intelligent caching and invalidation
- **Optimistic Updates**: UI updates immediately while database operations happen in background

### User-Specific Data

- **Isolated Data**: Each user has their own data space using email as identifier
- **Automatic Initialization**: New users automatically receive dummy data
- **Session Integration**: Seamless integration with NextAuth.js authentication

### Error Handling

- **Network Resilience**: Automatic retry mechanisms for failed operations
- **Error Recovery**: Graceful handling of network and database errors
- **User Feedback**: Clear error messages and loading states

## Database Operations

### Reading Data

```typescript
// Using RTK Query hook
const { data, isLoading, error } = useFetchDataFromDbQuery();

// Manual Firestore query
const ref = collection(db, `users/${userEmail}/tasks`);
const querySnapshot = await getDocs(ref);
const userData = querySnapshot.docs.map(doc => doc.data());
```

### Writing Data

```typescript
// Using RTK Query mutation
const [updateBoard] = useUpdateBoardToDbMutation();
await updateBoard(boardData);

// Manual Firestore update
const docRef = doc(db, `users/${userEmail}/tasks/${documentId}`);
await updateDoc(docRef, { boards: boardData });
```

### Adding New Documents

```typescript
// Add new document
const docRef = await addDoc(collection(db, `users/${userEmail}/tasks`), data);

// Add document with custom ID
await setDoc(doc(db, `users/${userEmail}/tasks/${customId}`), data);
```

## Security Considerations

### Development vs Production

**Development Rules** (Current):
```javascript
allow read, write: if true;
```

**Production Rules** (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{document} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
  }
}
```

### Best Practices

1. **Environment Variables**: Never commit Firebase config to version control
2. **Security Rules**: Implement proper authentication-based rules for production
3. **Data Validation**: Validate data on both client and server side
4. **Error Handling**: Implement comprehensive error handling for all operations
5. **Monitoring**: Use Firebase Analytics and Performance Monitoring

## Troubleshooting

### Common Issues

**Issue**: Firebase config not loading
- **Solution**: Ensure all `NEXT_PUBLIC_` environment variables are set correctly

**Issue**: Permission denied errors
- **Solution**: Check Firestore security rules and authentication status

**Issue**: Data not syncing
- **Solution**: Verify network connection and Firebase project configuration

**Issue**: Initial data not loading
- **Solution**: Check if user document exists and authentication is working

### Debug Tips

1. **Firebase Console**: Use the Firebase console to inspect data and rules
2. **Browser DevTools**: Check network requests and console errors
3. **RTK Query DevTools**: Use Redux DevTools to inspect query states
4. **Firebase Emulator**: Use local emulator for development and testing

## Next Steps

After setting up Firebase:

1. **Implement CRUD Operations** using RTK Query mutations
2. **Add Real-time Listeners** for live updates
3. **Implement Security Rules** for production deployment
4. **Add Data Validation** and error handling
5. **Set up Monitoring** and analytics

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
