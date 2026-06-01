"use client";

import { useAuth } from "@/lib/useAuth";

export default function AuthBar({ online }: { online: boolean }) {
  const { user, loading, configured, signIn, signOut } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
          online
            ? "border-accent/40 text-accent-light"
            : "border-border text-text-muted"
        }`}
        title={online ? "Online" : "Offline mode"}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            online ? "bg-accent" : "bg-text-muted"
          }`}
        />
        {online ? "Online" : "Offline"}
      </span>

      {!configured ? (
        <span className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted">
          Local mode
        </span>
      ) : loading ? (
        <span className="text-xs text-text-muted">Checking...</span>
      ) : user ? (
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-semibold transition hover:border-accent/60"
        >
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              className="h-5 w-5 rounded-full"
            />
          )}
          Sign out
        </button>
      ) : (
        <button
          onClick={() => signIn()}
          className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white transition hover:bg-accent-light"
        >
          Sign in
        </button>
      )}
    </div>
  );
}
