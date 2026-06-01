type Tool = {
  name: string;
  url: string;
  icon: React.ReactNode;
};

const tools: Tool[] = [
  {
    name: "Gmail",
    url: "https://mail.google.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill="#EA4335" d="M2 6.5 12 13l10-6.5V18a2 2 0 0 1-2 2h-1V9.8l-7 4.55L5 9.8V20H4a2 2 0 0 1-2-2V6.5Z" />
        <path fill="#FBBC05" d="M2 6.5V18a2 2 0 0 0 2 2h1V9.8L2 6.5Z" />
        <path fill="#34A853" d="M22 6.5V18a2 2 0 0 1-2 2h-1V9.8l3-3.3Z" />
        <path fill="#C5221F" d="M2 6.5 12 13l10-6.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v.5Z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    url: "https://app.slack.com/client",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill="#36C5F0" d="M9 12a2 2 0 1 1-2-2h2v2Zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5Z" />
        <path fill="#2EB67D" d="M12 9a2 2 0 1 1 2-2v2h-2Zm0 1a2 2 0 1 1 0 4H7a2 2 0 1 1 0-4h5Z" />
        <path fill="#ECB22E" d="M15 12a2 2 0 1 1 2 2h-2v-2Zm-1 0a2 2 0 1 1-4 0V7a2 2 0 1 1 4 0v5Z" />
        <path fill="#E01E5A" d="M12 15a2 2 0 1 1-2 2v-2h2Zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5Z" />
      </svg>
    ),
  },
  {
    name: "Google Sheets",
    url: "https://sheets.google.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path fill="#0F9D58" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        <path fill="#fff" d="M8 12h8v6H8v-6Zm1.5 1.5v1h2v-1h-2Zm3.5 0v1h2v-1h-2Zm-3.5 2v1h2v-1h-2Zm3.5 0v1h2v-1h-2Z" />
        <path fill="#87CEAC" d="M14 2v4a2 2 0 0 0 2 2h4l-6-6Z" />
      </svg>
    ),
  },
];

export default function LaunchButtons() {
  return (
    <section className="h-full rounded-3xl border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm sm:p-7">
      <h2 className="text-xl font-bold tracking-tight">Launch</h2>
      <div className="mt-5 flex flex-col gap-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3.5 font-semibold transition hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-night/60">
              {tool.icon}
            </span>
            <span className="text-sm sm:text-base">{tool.name}</span>
            <svg
              viewBox="0 0 24 24"
              className="ml-auto h-4 w-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
