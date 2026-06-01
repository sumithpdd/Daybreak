# Architecture

This app uses a clean, predictable layering so juniors can find things fast.

## High-level
- UI: Next.js App Router with Client Components in `src/app/components`
- State/UI logic: Redux Toolkit slice in `src/redux/features/appSlice.ts`
- Data access: RTK Query endpoints in `src/redux/services/apiSlice.ts`
- Auth: NextAuth (Google) under `src/app/api/auth/[...nextauth]`
- Persistence: Firebase Firestore (documents/collections)
- Drag & drop: dnd-kit in `BoardTasks.tsx`

## Why this structure?
- Colocate UI with small, focused components (readable JSX + Tailwind)
- Keep side-effects/data access in a single place (RTK Query endpoints)
- Keep global UI state small (current board name, modal states)
- Types live near the API (`ITask`, `IBoard`, etc.) to prevent drift

## Rendering model
- App Router with Client Components for interactive areas (modals, DnD)
- Server/route handlers only for auth (NextAuth) and Next.js internals

## Data flow
1. User authenticates (NextAuth). `useGetCurrentUserQuery` ensures a user doc exists
2. Boards load by `ownerId` via `useFetchBoardsQuery`
3. UI selects an active board via `appSlice`
4. Mutations (add/edit/delete/move) go through RTK Query → Firestore
5. Cards render with sanitized HTML (DOMPurify) and checklist preview

## Key files
- `src/app/components/BoardTasks.tsx`: board UI, DnD logic, overlays
- `src/redux/services/apiSlice.ts`: Firestore contracts + mutations/queries
- `src/redux/features/appSlice.ts`: modal state, active board name, selectors
- `src/app/layout.tsx`: providers (Redux, Auth), top-level chrome

## External docs
- Next.js App Router: https://nextjs.org/docs/app
- Redux Toolkit: https://redux-toolkit.js.org/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- NextAuth: https://authjs.dev/
- Firestore: https://firebase.google.com/docs/firestore
- dnd-kit: https://docs.dndkit.com/
- TinyMCE: https://www.tiny.cloud/docs/
