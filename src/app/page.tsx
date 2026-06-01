import Link from "next/link";
import Dashboard from "./components/morning/Dashboard";

export default function Home() {
  return (
    <div className="morning-bg min-h-screen w-full">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <nav className="mb-6 flex items-center justify-end gap-2">
          <Link
            href="/board"
            className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-sm font-semibold text-text-primary transition hover:border-accent/60"
          >
            📋 Boards
          </Link>
          <Link
            href="/okrs"
            className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-sm font-semibold text-text-primary transition hover:border-accent/60"
          >
            🎯 OKRs
          </Link>
          <Link
            href="/calendar"
            className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-sm font-semibold text-text-primary transition hover:border-accent/60"
          >
            📅 Calendar
          </Link>
        </nav>
        <Dashboard />
      </main>
    </div>
  );
}
