"use client";

// Firebase-backed drop-in replacement for the bits of NextAuth the ported
// kanban code used: SessionProvider, useSession, getSession, signIn, signOut.
// The session shape mirrors NextAuth so call sites need no changes beyond
// their import path.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export type Session = {
  user: { email: string; name?: string | null; image?: string | null };
} | null;

export type SessionStatus = "authenticated" | "loading" | "unauthenticated";

function toSession(user: User | null): Session {
  if (!user?.email) return null;
  return {
    user: { email: user.email, name: user.displayName, image: user.photoURL },
  };
}

const SessionContext = createContext<{ data: Session; status: SessionStatus }>({
  data: null,
  status: "loading",
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Session>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      const s = toSession(u);
      setData(s);
      setStatus(s ? "authenticated" : "unauthenticated");
    });
  }, []);

  const value = useMemo(() => ({ data, status }), [data, status]);
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

// Promise-based session for non-React code (RTK Query queryFns). Resolves once
// Firebase has determined the current user.
export function getSession(): Promise<Session> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(toSession(auth.currentUser));
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(toSession(u));
    });
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  await fbSignOut(auth);
}
