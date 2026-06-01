"use client";

import { useState } from "react";
import {
  useFetchTripsQuery,
  useCreateTripMutation,
  useDeleteTripMutation,
  type ITrip,
} from "@/redux/services/apiSlice";
import { useSession } from "@/lib/session";

function formatRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const sameYear = s.getFullYear() === e.getFullYear();
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const sStr = s.toLocaleDateString(undefined, opts);
    const eStr = e.toLocaleDateString(undefined, { ...opts, year: "numeric" });
    return sameYear ? `${sStr} – ${eStr}` : `${s.toLocaleDateString(undefined, { ...opts, year: "numeric" })} – ${eStr}`;
  } catch {
    return `${start} – ${end}`;
  }
}

const emptyForm = {
  title: "",
  type: "personal" as "personal" | "work",
  startDate: "",
  endDate: "",
  location: "",
  bookingRef: "",
  details: "",
};

export default function TripsCard() {
  const { data: session } = useSession();
  const { data: trips = [], isLoading } = useFetchTripsQuery();
  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [deleteTrip] = useDeleteTripMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...trips]
    .filter((t) => (t.endDate || t.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) return;
    await createTrip(form);
    setForm(emptyForm);
    setShowForm(false);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent";

  return (
    <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Trips</h2>
        {session && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-xs font-semibold uppercase tracking-wider text-text-muted transition hover:text-accent-light"
          >
            {showForm ? "Cancel" : "+ Add trip"}
          </button>
        )}
      </div>

      {!session ? (
        <p className="mt-4 text-sm text-text-muted">Sign in to see your trips.</p>
      ) : (
        <>
          {showForm && (
            <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface-2/40 p-3">
              <input className={inputClass} placeholder="Trip title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <div className="flex gap-2">
                <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value as "personal" | "work")}>
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                </select>
                <input className={inputClass} placeholder="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div className="flex gap-2">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <input className={inputClass} placeholder="Booking reference (optional)" value={form.bookingRef} onChange={(e) => set("bookingRef", e.target.value)} />
              <textarea className={`${inputClass} min-h-20 resize-y`} placeholder="Flights, hotel, notes…" value={form.details} onChange={(e) => set("details", e.target.value)} />
              <button
                onClick={add}
                disabled={isCreating}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-light disabled:opacity-60"
              >
                {isCreating ? "Saving…" : "Save trip"}
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="mt-4 text-sm text-text-muted">Loading trips…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">No upcoming trips.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {upcoming.map((trip: ITrip) => (
                <li key={trip.id} className="rounded-xl border border-border/70 bg-surface-2/50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            trip.type === "work"
                              ? "bg-amber-300/20 text-amber-200"
                              : "bg-accent/20 text-accent-light"
                          }`}
                        >
                          {trip.type === "work" ? "✈️ Work" : "🌴 Personal"}
                        </span>
                        {trip.location && <span className="text-xs text-text-muted">{trip.location}</span>}
                      </div>
                      <p className="mt-1 font-semibold text-text-primary">{trip.title}</p>
                      <p className="text-sm text-accent-light">{formatRange(trip.startDate, trip.endDate)}</p>
                    </div>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="shrink-0 text-text-muted transition hover:text-red-400"
                      title="Remove trip"
                      aria-label="Remove trip"
                    >
                      ×
                    </button>
                  </div>
                  {trip.bookingRef && (
                    <p className="mt-2 text-xs text-text-muted">Booking: {trip.bookingRef}</p>
                  )}
                  {trip.details && (
                    <p className="mt-1 whitespace-pre-line text-xs text-text-muted">{trip.details}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
