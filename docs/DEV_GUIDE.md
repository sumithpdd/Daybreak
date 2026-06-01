# Developer Guide

This guide orients new contributors and junior developers.

## Setup
1. Install Node 18+
2. Copy `env-template.txt` → `.env.local` and fill values
3. `npm install`
4. `npm run dev`

Learn more
- Next.js App Router: https://nextjs.org/docs/app
- Redux Toolkit: https://redux-toolkit.js.org/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- NextAuth (Google): https://authjs.dev/
- Firestore: https://firebase.google.com/docs/firestore
- dnd-kit: https://docs.dndkit.com/
- TinyMCE: https://www.tiny.cloud/docs/

## Flow (user → UI → data)
1. User signs in (NextAuth). Session available in client via `useSession`
2. `useGetCurrentUserQuery` ensures `users` entry exists
3. `useFetchBoardsQuery` loads boards for the session email (`ownerId`)
4. `appSlice` tracks current board & modal states
5. CRUD actions call RTK Query mutations (`apiSlice.ts`)
6. Firestore updates; RTK Query invalidates tags; UI refetches

## Key Patterns
- UI state in `appSlice` only (keep it small & serializable)
- All Firestore calls in `apiSlice` (queries/mutations)
- Derive data via hooks (e.g., `useFetchBoardsQuery`)
- IDs for relations (tags/users); avoid embedding full objects
- Sanitize HTML when rendering `description` (DOMPurify)
- DnD updates `order` and sets `completedDate` when moved to last column

## Adding a field to Task
1. Update `ITask` in `apiSlice.ts`
2. Update Add/Edit modal fields
3. Ensure mutations set `updatedAt` and `updatedBy`
4. Render on cards (if needed)

## Debugging Tips
- Wrap debug logs: `if (process.env.NODE_ENV !== 'production') console.log(...)`
- Check Firestore shape with the data-migration/diagnose tool
- Validate `ownerId`/session email when boards are empty

## Scripts
See `data-migration/README.md` for diagnose/fix/populate utilities.

## Code Style
- TypeScript strictness; avoid `any`
- Small components; clear prop types
- No unused imports or dead code
- Prefer early returns over deep nesting

## Approval & Board Access

- Users are created with `isApproved: false` on first login.
- `fetchBoards` returns boards only if the current user is approved.
- Board visibility: user sees boards where they are:
  - `ownerId` (creator), or in `owners[]`, or in `members[]`.
- To approve a user: set `isApproved=true` in the `users` collection for their email.
- To manage access: in the board modal, add comma‑separated emails in Owners/Members.
