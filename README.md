<p align="center">
  <img src="public/logo.svg" alt="Daybreak" width="280" />
</p>

# Daybreak

**Live:** https://daybreak-five.vercel.app

A morning start page that grounds your workday, plus a full Kanban and OKR
workspace behind it. Open it first thing for your date, top three priorities,
a focus quote, and quick launch buttons, then move into your boards and
objectives when you are ready to work.

A personal morning and work dashboard to streamline the start of the day and
manage the work that follows.

## Routes

- `/` Morning dashboard: live date, top three priorities, focus quote
  ("Vision without execution is hallucination"), and launch buttons for Gmail,
  Slack, and Google Sheets.
- `/board` Kanban boards: drag-and-drop tasks across columns, with tags,
  assignments, due dates, time tracking, checklists, and rich-text descriptions.
- `/okrs` OKR management: objectives and key results with progress tracking,
  categories, statuses, and a list or Kanban view.

## Features

- Morning dashboard with local-first priorities (localStorage) and offline PWA
- Kanban board with drag-and-drop (`@dnd-kit`), multiple boards and columns
- OKR tracking with key results, progress bars, and status badges
- Tasks linked to OKRs and key results, with checklists and time tracking
- Rich-text task descriptions (TinyMCE), sanitised with DOMPurify
- Real-time Firestore data with Redux Toolkit + RTK Query
- Google sign-in via Firebase Authentication
- Responsive, mobile-friendly Tailwind CSS UI
- Full TypeScript

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Redux Toolkit +
RTK Query, Firebase (Auth + Firestore), `@dnd-kit`, TinyMCE, Montserrat.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # paste your Firebase web config
npm run dev
```

Then open http://localhost:3000. In the Firebase console enable Google sign-in
(Authentication > Sign-in method) and create a Firestore database. Deploy the
rules in `firestore.prod.rules`.

## Authentication

Daybreak uses Firebase Authentication (Google). A small compatibility layer in
`src/lib/session.tsx` exposes the same `useSession` / `getSession` / `signIn` /
`signOut` API the original code used, so the data layer stays simple. Your
email is the owner key for boards and OKRs.

## Seeding your data

`data-migration/` contains scripts to seed OKRs and tasks. They use the
Firebase Admin SDK and require a service account key, which is a secret and is
git-ignored. See `data-migration/README-COMPREHENSIVE-SEED.md`.

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
node data-migration/seed-okrs-with-tasks.js you@example.com
```

Note: the seed script clears existing OKRs for that user before reseeding.

## Security

- Never commit `.env.local` or any `serviceAccountKey*.json`. Both are
  git-ignored. Only `.env.local.example` (empty placeholders) is tracked.
- Firestore is locked down by `firestore.prod.rules`: users only read and write
  their own OKRs, and only board owners can write their boards.

## Documentation

Deep-dive docs are in `docs/`, including `ARCHITECTURE.md`, `DATA_MODEL.md`,
`AUTHENTICATION.md`, `CRUD_OPERATIONS.md`, `DRAG_AND_DROP.md`, the OKR guides,
and `JUNIOR_DEVELOPER_GUIDE.md` for a friendly onboarding overview.

## Color scheme (morning page)

Deep navy base (#070b14), bright azure accent (#2d9cef), light-blue highlight
(#5cb8ff), textured background, bold Montserrat typography.
