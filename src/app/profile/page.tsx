"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGetCurrentUserQuery, useUpdateUserMutation } from "@/redux/services/apiSlice";
import { useSession } from "@/lib/session";
import Logo from "../components/morning/Logo";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-sm text-accent-light"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-accent-light/70 hover:text-white"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={placeholder ?? "Add something (press Enter)"}
        className="mt-2 w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    city: "",
    country: "",
    experienceLevel: "Beginner" as (typeof LEVELS)[number],
    skills: [] as string[],
    expertise: [] as string[],
    interests: [] as string[],
    linkedin: "",
    github: "",
    website: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? user.name ?? "",
      bio: user.bio ?? "",
      city: user.city ?? "",
      country: user.country ?? "",
      experienceLevel: user.experienceLevel ?? "Beginner",
      skills: user.skills ?? [],
      expertise: user.expertise ?? [],
      interests: user.interests ?? [],
      linkedin: user.linkedin ?? "",
      github: user.github ?? "",
      website: user.website ?? "",
    });
  }, [user]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    await updateUser({ userId: user.id, userData: { ...form, email: user.email } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="morning-bg min-h-screen w-full">
      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="rounded-full border border-border bg-surface/70 px-4 py-1.5 text-sm font-semibold text-text-primary transition hover:border-accent/60"
          >
            ← Back
          </Link>
        </div>

        {!session ? (
          <p className="text-text-muted">Sign in from the morning page to manage your profile.</p>
        ) : isLoading ? (
          <p className="text-text-muted">Loading your profile…</p>
        ) : (
          <div className="space-y-6">
            {/* Identity */}
            <section className="rounded-3xl border border-border bg-surface/70 p-6 shadow-card sm:p-7">
              <div className="mb-5 flex items-center gap-4">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="h-14 w-14 rounded-full" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
                    {(form.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-text-primary">{form.displayName || "Your name"}</p>
                  <p className="text-sm text-text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Display Name">
                  <input className={inputClass} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="How your name appears" />
                </Field>
                <Field label="Bio">
                  <textarea className={`${inputClass} min-h-24 resize-y`} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A short summary about you" />
                </Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="City">
                    <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
                  </Field>
                  <Field label="Country">
                    <input className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Country" />
                  </Field>
                </div>
                <Field label="Experience Level">
                  <div className="flex gap-2">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => set("experienceLevel", lvl)}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          form.experienceLevel === lvl
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-surface-2/60 text-text-muted hover:border-accent/50"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </section>

            {/* Skills & expertise */}
            <section className="space-y-5 rounded-3xl border border-border bg-surface/70 p-6 shadow-card sm:p-7">
              <h2 className="text-lg font-bold text-text-primary">Skills &amp; Expertise</h2>
              <TagInput label="Skills" values={form.skills} onChange={(v) => set("skills", v)} placeholder="e.g. TypeScript, React (press Enter)" />
              <TagInput label="Domain Expertise" values={form.expertise} onChange={(v) => set("expertise", v)} placeholder="e.g. AI, Cloud, Sales (press Enter)" />
              <TagInput label="Interests" values={form.interests} onChange={(v) => set("interests", v)} placeholder="e.g. Mentoring, Design (press Enter)" />
            </section>

            {/* Links */}
            <section className="space-y-5 rounded-3xl border border-border bg-surface/70 p-6 shadow-card sm:p-7">
              <h2 className="text-lg font-bold text-text-primary">Links</h2>
              <Field label="LinkedIn">
                <input className={inputClass} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://www.linkedin.com/in/…" />
              </Field>
              <Field label="GitHub">
                <input className={inputClass} value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/…" />
              </Field>
              <Field label="Personal Website">
                <input className={inputClass} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
              </Field>
            </section>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-light disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save Profile"}
              </button>
              {saved && <span className="text-sm font-semibold text-accent-light">Saved ✓</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
