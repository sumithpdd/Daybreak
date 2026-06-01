# Daybreak: A Guide for Junior Developers

Welcome to Daybreak. This guide explains what the app is for, how it is built, and how the pieces fit together. It assumes you are newer to React, Next.js, and Firebase, so it starts from the basics and builds up.

## 1. What this app is for

Many people open their laptop in the morning and feel reactive. Tabs are scattered, there is no clear starting point, and the day runs them instead of the other way around.

Daybreak is a single morning start page that grounds the day before you launch into work. When you open it you see:

- The current date, highlighted so it feels grounded in today
- A focus quote: "Vision without execution is hallucination"
- Your top three priorities for the day
- Launch buttons for the tools you use most (Gmail, Slack, Google Sheets)

The goal is calm and focus, not another busy dashboard.

## 2. The tech stack

| Layer | Technology | Why it is here |
| --- | --- | --- |
| UI library | React | Builds the interface from small reusable components |
| Framework | Next.js (App Router) | Routing, build tooling, and server plus client rendering |
| Language | TypeScript | Types catch mistakes before the app runs |
| Styling | Tailwind CSS | Utility classes for fast, consistent styling |
| Font | Montserrat | Bold, clean typography loaded through next/font |
| Data and auth | Firebase (Auth + Firestore) | Optional sign in and cloud sync across devices |
| Offline | Service worker + Web App Manifest | Makes the app installable and usable offline |
| Local storage | Browser localStorage | Saves priorities instantly with no account needed |

## 3. Core concepts, explained simply

### React components
A component is a function that returns UI. Daybreak is built from small components like `DateHeader`, `Quote`, `Priorities`, and `LaunchButtons`. The `Dashboard` component arranges them on the page.

### Server vs client components (Next.js App Router)
By default Next.js components run on the server, which is fast and good for static content. When a component needs the browser (clicks, state, localStorage, timers) it must start with the line `"use client";`. Notice that `Quote` has no such line because it only displays text, while `Priorities` does because it reacts to user input.

### Hooks
Hooks are React functions that add behaviour to a component.
- `useState` holds data that can change, such as the list of priorities.
- `useEffect` runs code after the component appears, such as loading saved priorities or starting a timer for the clock.
We also wrote a custom hook, `useAuth`, that wraps Firebase sign in so any component can ask "is someone signed in?".

### TypeScript types
A type describes the shape of data. For example a priority is:

```ts
type Priority = { id: string; text: string; done: boolean };
```

If you try to use a priority without a `text`, TypeScript warns you before the app runs.

### Tailwind CSS
Instead of writing separate CSS files, you add small classes directly in the markup, for example `className="rounded-3xl border p-6"`. Custom colours and fonts live in `tailwind.config.ts`.

Watch out for one trap we hit: do not name a custom colour the same as a built in Tailwind utility (we had a colour called `base` that clashed with the `text-base` font size, which made some text the wrong colour). We renamed it to `night`.

## 4. How the project is organised

```
Daybreak/
  app/
    layout.tsx        Root layout, loads Montserrat and global styles
    page.tsx          The home page, renders the Dashboard
    globals.css       Tailwind setup, textured background, animations
  components/
    Dashboard.tsx     Lays out the whole page, tracks online/offline
    DateHeader.tsx    Greeting and the golden date banner
    Quote.tsx         The focus quote with the animated glow
    Priorities.tsx    The editable top three list
    LaunchButtons.tsx Quick links to Gmail, Slack, Google Sheets
    AuthBar.tsx       Sign in / sign out and connection status
    ServiceWorkerRegister.tsx  Registers the offline worker
  lib/
    firebase.ts       Firebase setup, safe when not configured
    useAuth.ts        Custom hook for sign in state
    priorities.ts     Local storage helpers and dummy data
  public/
    sw.js             Service worker for offline caching
    manifest.json     Makes the app installable
    icon.svg          App icon
  docs/
    JUNIOR_DEVELOPER_GUIDE.md   This file
```

## 5. The customer journey flow

This is what happens as a user moves through the app.

1. Open the page
   - Next.js serves the page. The service worker may serve it from cache when offline.
2. See the morning view
   - The date and greeting appear and update on a timer.
   - The focus quote shows with its animated glow.
   - Priorities load from localStorage. On a first visit the three dummy priorities are shown.
3. Work with priorities
   - The user edits text, checks items off, adds new ones, or resets the day.
   - Every change is saved to localStorage straight away, so a refresh keeps the list.
4. Launch a tool
   - Clicking Gmail, Slack, or Google Sheets opens that tool in a new tab.
5. Optional sign in
   - If Firebase is configured, an account button appears.
   - Signing in with Google mirrors the priorities to Firestore under `users/{uid}`.
   - The same list now follows the user across devices, while localStorage still gives instant offline access.
6. Go offline
   - Thanks to the service worker the page still opens and the local list still works. Changes sync back to Firestore when the connection returns.

Local first is the key idea: the app never blocks on the network. The cloud is an enhancement, not a requirement.

## 6. Running the app

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app works straight away in local mode with no Firebase project.

## 7. Firebase setup (optional) and security

Firebase is wired up but turned off until you provide a config.

1. Create a project in the Firebase console.
2. Add a Web app and copy its config.
3. Enable Authentication with the Google provider.
4. Create a Firestore database.
5. Copy `.env.local.example` to `.env.local` and paste your values.
6. Restart `npm run dev`.

### Important security rules for contributors

- Never commit `.env.local`. It is listed in `.gitignore` for a reason. Secrets and project config stay on your machine.
- Only `.env.local.example`, which contains empty placeholders, belongs in the repository.
- Protect your Firestore data with rules so each user can only read and write their own document:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

- Firebase web config values are designed to be visible in the browser, but we still keep them out of this public repository so the project setup stays private. Anyone running the app supplies their own.

## 8. Ideas for your first contributions

- Add a fourth launch button for a tool you use.
- Add a small weather widget to the header.
- Let the user reorder priorities by dragging them.
- Add a gentle "well done" message when all three priorities are checked.

Pick one, create a branch, and open a pull request. Welcome aboard.
