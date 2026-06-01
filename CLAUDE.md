# Daybreak: project guide for Claude Code

Read this first. It captures what the app is, how it is built, and the
conventions to follow when working in this repo.

## What this is

Daybreak is a Next.js app with two halves:

- A calm morning start page (the landing route) to ground the day.
- A full Kanban and OKR workspace ported from a separate project.

Routes:

- `/` morning dashboard: date, top three priorities, focus quote, launch buttons.
- `/board` Kanban: drag-and-drop tasks, tags, checklists, time tracking, rich text.
- `/okrs` OKR management: objectives, key results, progress, categories.
- `/calendar` month grid of tasks by due date.
- `/profile` user profile management (saved to the users collection).

Multi-tenant SaaS: users only access their own boards/OKRs/tasks (enforced by
firestore.prod.rules). Boards support sharing via owners[]/members[]. The
board/OKR/calendar pages and modals use the dark theme via `.app-dark` /
`.dark-scope` scoped overrides in globals.css.

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Redux Toolkit +
RTK Query, Firebase (Auth + Firestore), @dnd-kit, TinyMCE, sharp (icon build).

## Commands

```bash
npm run dev      # start the dev server on http://localhost:3000
npm run build    # production build (run before pushing)
npm run lint     # eslint
npm run icons    # regenerate PNG app icons from public/icon.svg
```

## Architecture notes (important)

- Authentication is Firebase (Google), not NextAuth. The ported kanban code
  calls `useSession` / `getSession` / `signIn` / `signOut`, which are provided
  by a Firebase-backed shim at `src/lib/session.tsx`. Keep that shim's shape.
- Firebase is initialised once in `src/lib/firebase.ts` and re-exported from
  `src/app/utils/firebaseConfig.ts`. Never call `initializeApp` elsewhere.
- The owner key for boards and OKRs is the signed-in user's email.
- The board "approval gate" was removed for single-user use.
- Data layer: `src/redux/services/apiSlice.ts` (RTK Query over Firestore).
- Data model is documented in `docs/DATA_MODEL.md`.

## Styling

- Tailwind v4 with the theme defined in `src/app/globals.css` (`@theme`).
- Morning page uses Montserrat and the dark textured `.morning-bg`.
- Board / OKR / Calendar use Plus Jakarta Sans to match the original app.
- Palette: deep navy `#070b14`, azure `#2d9cef`, light blue `#5cb8ff`, with a
  warm gold `#ffd27a` accent in the logo. Custom kanban colors: main-purple,
  dark-grey, medium-grey, light-grey.
- Do not name a custom Tailwind color after a core utility (e.g. `base`); it
  collides with `text-base`. Use distinct names like `night`.

## Environment and secrets (do not break these)

- `.env.local` holds the Firebase web config. It is git-ignored. Copy from
  `.env.local.example` and paste your own values.
- A Firebase Admin service account key (`*-firebase-adminsdk-*.json` /
  `serviceAccountKey*.json`) is required only for data seeding. It is a secret
  and is git-ignored. Never commit it, never paste its contents into a file.
- This is a public repo: never commit real emails, keys, or the Firebase
  project id. Use placeholders in docs.

## Data seeding

Scripts live in `data-migration/`. They use the Admin SDK and a service account
key via `GOOGLE_APPLICATION_CREDENTIALS`.

```bash
# PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
node data-migration/seed-okrs-with-tasks.js <your-email>   # OKRs + tasks (clears existing OKRs first)
node data-migration/seed-tags.js <your-email>              # tags, then tags every task
```

## Conventions

- Git commits: keep messages concise. Do not add a `Co-Authored-By` trailer.
- Branch off before committing on a shared branch; push only when asked.
- Writing style in docs and UI: plain, no em dashes, no generic AI phrasing.
- Run `npm run build` and a quick route check before pushing.
- Keep `README.md` current when features change.

## Useful slash commands (this repo)

- `/safety-check` scan for secrets and verify ignores before pushing.
- `/seed` seed Firestore data for a user.
- `/verify` build and smoke-test the routes.
- `/update-docs` record the latest request in the project history docs.
