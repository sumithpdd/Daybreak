// Daybreak home-page logo: a small sunrise mark plus the wordmark.

export function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Daybreak">
      <defs>
        <linearGradient id="logo-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="0.5" stopColor="#5cb8ff" />
          <stop offset="1" stopColor="#2d9cef" />
        </linearGradient>
      </defs>
      <g stroke="#ffd27a" strokeWidth="2.4" strokeLinecap="round">
        <line x1="24" y1="8" x2="24" y2="3" />
        <line x1="34.5" y1="12" x2="38" y2="8.5" />
        <line x1="13.5" y1="12" x2="10" y2="8.5" />
      </g>
      <g stroke="#5cb8ff" strokeWidth="2.4" strokeLinecap="round">
        <line x1="39" y1="22" x2="44" y2="21" />
        <line x1="9" y1="22" x2="4" y2="21" />
      </g>
      <circle cx="24" cy="24" r="9.5" fill="url(#logo-sun)" />
      <rect x="7" y="32" width="34" height="3" rx="1.5" fill="#5cb8ff" />
      <rect x="14" y="38" width="20" height="2.4" rx="1.2" fill="#2d9cef" opacity="0.6" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <SunMark className="h-10 w-10 drop-shadow-[0_0_12px_rgba(45,156,239,0.5)]" />
      <div className="leading-none">
        <span className="text-2xl font-extrabold tracking-tight text-text-primary">
          Day<span className="bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">break</span>
        </span>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted">
          Ground your day
        </p>
      </div>
    </div>
  );
}
