export default function Quote({ text }: { text: string }) {
  return (
    <div className="relative">
      {/* Pulsing glow blob sitting behind the card. */}
      <div className="animate-blob pointer-events-none absolute -inset-4 rounded-[2rem] bg-accent/25 blur-3xl" />

      <section className="quote-ring animate-quote-glow relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 px-7 py-10 sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <span className="font-serif text-7xl leading-none text-accent/40">&ldquo;</span>
        <blockquote className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl">
          {text}
        </blockquote>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-accent-light">
          Today&apos;s focus
        </p>
      </section>
    </div>
  );
}
