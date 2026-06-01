// Priorities data layer.
//
// Local-first: priorities always live in localStorage so the page works
// offline and with no Firebase project. When a signed-in user is present and
// Firebase is configured, the same list is mirrored to Firestore.

export type Priority = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "daybreak.priorities";

export const DUMMY_PRIORITIES: Priority[] = [
  { id: "p1", text: "Finish Claude Code course", done: false },
  { id: "p2", text: "Work tasks and email from 9 - 11", done: false },
  { id: "p3", text: "Prep client demo and send follow-ups", done: false },
];

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadLocal(): Priority[] {
  if (typeof window === "undefined") return DUMMY_PRIORITIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DUMMY_PRIORITIES;
    const parsed = JSON.parse(raw) as Priority[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DUMMY_PRIORITIES;
    return parsed;
  } catch {
    return DUMMY_PRIORITIES;
  }
}

export function saveLocal(items: Priority[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota or privacy-mode write failures.
  }
}
