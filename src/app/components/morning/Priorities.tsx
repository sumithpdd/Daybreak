"use client";

import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  DUMMY_PRIORITIES,
  loadLocal,
  newId,
  saveLocal,
  type Priority,
} from "@/lib/priorities";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export default function Priorities() {
  const { user } = useAuth();
  const [items, setItems] = useState<Priority[]>(DUMMY_PRIORITIES);
  const [draft, setDraft] = useState("");
  const hydrated = useRef(false);

  // Load from localStorage on first mount.
  useEffect(() => {
    setItems(loadLocal());
    hydrated.current = true;
  }, []);

  // Persist locally on every change (after hydration).
  useEffect(() => {
    if (hydrated.current) saveLocal(items);
  }, [items]);

  // When signed in with Firebase configured, subscribe to the cloud copy.
  useEffect(() => {
    if (!db || !user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data && Array.isArray(data.priorities)) {
        setItems(data.priorities as Priority[]);
      }
    });
    return () => unsub();
  }, [user]);

  const persistCloud = (next: Priority[]) => {
    if (!db || !user) return;
    // Include email so the write satisfies the tightened user-doc rules.
    void setDoc(
      doc(db, "users", user.uid),
      { email: user.email, priorities: next },
      { merge: true }
    );
  };

  const update = (next: Priority[]) => {
    setItems(next);
    persistCloud(next);
  };

  const toggle = (id: string) =>
    update(items.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));

  const remove = (id: string) => update(items.filter((p) => p.id !== id));

  const edit = (id: string, text: string) =>
    update(items.map((p) => (p.id === id ? { ...p, text } : p)));

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    update([...items, { id: newId(), text, done: false }]);
    setDraft("");
  };

  const reset = () => update(DUMMY_PRIORITIES.map((p) => ({ ...p, id: newId() })));

  return (
    <section className="h-full rounded-3xl border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Top priorities</h2>
        <button
          onClick={reset}
          className="text-xs font-semibold uppercase tracking-wider text-text-muted transition hover:text-accent-light"
        >
          Reset day
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {items.map((p) => (
          <li
            key={p.id}
            className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface-2/60 px-3 py-2.5 transition hover:border-accent/50"
          >
            <button
              onClick={() => toggle(p.id)}
              aria-label={p.done ? "Mark not done" : "Mark done"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                p.done
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-transparent"
              }`}
            >
              {p.done && (
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z" />
                </svg>
              )}
            </button>
            <input
              value={p.text}
              onChange={(e) => edit(p.id, e.target.value)}
              className={`w-full bg-transparent text-sm font-medium outline-none sm:text-base ${
                p.done ? "text-text-muted line-through" : "text-text-primary"
              }`}
            />
            <button
              onClick={() => remove(p.id)}
              aria-label="Remove priority"
              className="shrink-0 text-text-muted opacity-0 transition hover:text-accent-light group-hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a priority and press Enter"
          className="w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2.5 text-sm outline-none transition placeholder:text-text-muted focus:border-accent"
        />
        <button
          onClick={add}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-light"
        >
          Add
        </button>
      </div>
    </section>
  );
}
