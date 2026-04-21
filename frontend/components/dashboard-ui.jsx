"use client";

const STATUS_META = {
  todo: {
    label: "To do",
    chipClass: "border-gray-300 bg-white text-black",
  },
  in_progress: {
    label: "In progress",
    chipClass: "border-black bg-gray-100 text-black font-bold",
  },
  done: {
    label: "Done",
    chipClass: "border-black bg-black text-white",
  },
};

const METRIC_TONES = {
  mint: "bg-white border-black text-black",
  navy: "bg-gray-100 border-black text-black",
  peach: "bg-white border-gray-300 text-gray-800",
};

export function formatDisplayDate(value, fallback = "No date set") {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function getStatusMeta(status) {
  return STATUS_META[status] ?? {
    label: "Unknown",
    chipClass: "border-gray-200 bg-gray-50 text-gray-700",
  };
}

export function BrandGlyph({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.1 5.7L20 10.8l-5.9 2.1L12 19l-2.1-6.1L4 10.8l5.9-2.1L12 3z" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" /><path d="M5 12h14" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}

export function FolderIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9z" />
    </svg>
  );
}

export function BoardIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M8 8h4" /><path d="M8 12h8" /><path d="M8 16h6" />
    </svg>
  );
}

export function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6" /><path d="M7 6l1 13a2 2 0 0 0 2 1.8h4a2 2 0 0 0 2-1.8l1-13" /><path d="M10 10.5v5.5" /><path d="M14 10.5v5.5" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" />
    </svg>
  );
}

export function SparkIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 ${className}`}>
      {children}
    </section>
  );
}

export function MetricCard({ label, value, detail, tone = "navy" }) {
  const toneClass = METRIC_TONES[tone] ?? METRIC_TONES.navy;

  return (
    <div className={`rounded-xl border-2 p-5 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">
        {label}
      </p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-2 text-sm font-medium opacity-90">{detail}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span className={`inline-flex items-center rounded-md border-2 px-2.5 py-1 text-xs font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function LoadingScreen({
  eyebrow = "Preparing workspace",
  title = "Loading your dashboard",
  subtitle = "Fetching the latest projects and tasks for you.",
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Panel className="w-full max-w-md text-center border-black">
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          {eyebrow}
        </p>
        <div className="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-black" />
        <p className="mt-6 text-2xl font-extrabold tracking-tight text-black">    
          {title}
        </p>
        <p className="mt-2 text-sm font-medium text-gray-500">{subtitle}</p>
      </Panel>
    </div>
  );
}

export function WorkspaceShell({
  sectionLabel,
  title,
  subtitle,
  nav,
  actions,
  metrics = [],
  children,
  className = "",
}) {
  return (
    <section className={`bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Welcome Hero Section matching the reference */}
        <div className="mb-6 rounded-2xl bg-black px-8 py-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">   
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

          <div className="relative z-10">
             <p className="text-gray-300 text-sm font-bold tracking-widest uppercase mb-2">Welcome back</p>
             <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2"> 
                {title}
             </h1>
             <p className="text-sm font-medium text-gray-400 max-w-xl leading-relaxed">   
                {subtitle}
             </p>
          </div>

          <div className="relative z-10 mt-6 md:mt-0">
             {actions && (
                <div className="flex gap-3">
                   {actions}
                </div>
             )}
          </div>
        </div>

        {/* Dynamic Project Statistics or other metrics */}
        {metrics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-black mb-4 px-1">Overview Statistics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  detail={metric.detail}
                  tone={metric.tone}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">{children}</div>

      </div>
    </section>
  );
}



export function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-black tracking-tight uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm font-medium text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function CreateTaskButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 shadow-sm transition-all focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}


