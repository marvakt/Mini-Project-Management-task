"use client";

import {
  CalendarIcon,
  formatDisplayDate,
  getStatusMeta,
  StatusBadge,
  TrashIcon,
} from "@/components/dashboard-ui";

const statusOptions = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const developerColumns = [
  {
    status: "todo",
    title: "Pending",
    eyebrow: "Backlog",
    description: "Tasks waiting to be picked up next.",
    laneClass: "border-gray-200 bg-gray-50/90",
    accentClass: "from-gray-900 via-gray-700 to-gray-500",
    badgeClass: "bg-gray-900 text-white shadow-gray-300/80",
    emptyCopy: "No pending tasks right now.",
  },
  {
    status: "in_progress",
    title: "In Progress",
    eyebrow: "Active",
    description: "Work currently moving forward.",
    laneClass: "border-gray-200 bg-gray-50/90",
    accentClass: "from-gray-900 via-gray-700 to-gray-500",
    badgeClass: "bg-gray-900 text-white shadow-gray-300/80",
    emptyCopy: "Nothing is in progress yet.",
  },
  {
    status: "done",
    title: "Completed",
    eyebrow: "Delivered",
    description: "Tasks that are finished and ready to review.",
    laneClass: "border-gray-200 bg-gray-50/90",
    accentClass: "from-gray-900 via-gray-700 to-gray-500",
    badgeClass: "bg-gray-900 text-white shadow-gray-300/80",
    emptyCopy: "No completed tasks yet.",
  },
];

export function TaskList({ tasks, onStatusChange, onDelete, projectLookup, isAdmin }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-5 rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(238,242,255,0.95),rgba(255,255,255,0.98)_45%,rgba(239,246,255,0.95))] p-5 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.45)]">
        {developerColumns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);

          return (
            <section
              key={column.status}
              className={`flex w-[320px] shrink-0 flex-col rounded-[28px] border p-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)] ${column.laneClass}`}
            >
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${column.accentClass}`} />

              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {column.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                    {column.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {column.description}
                  </p>
                </div>
                <span className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1 text-sm font-semibold shadow-lg ${column.badgeClass}`}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="mt-5 flex-1 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-sm leading-6 text-slate-500">
                    {column.emptyCopy}
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const projectName =
                      projectLookup[task.project_id]?.name || "Project not found";
                    const statusMeta = getStatusMeta(task.status);

                    return (
                      <article
                        key={task.id}
                        className="group rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.85)] transition-all hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-36px_rgba(99,102,241,0.38)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <span className="truncate">{projectName}</span>
                            </p>
                            <h4 className="mt-3 text-base font-semibold leading-snug tracking-tight text-slate-900">
                              {task.title}
                            </h4>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>

                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                          {task.description?.trim() ||
                            "No task notes yet. Add a description to make the next step clear."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            <CalendarIcon className="h-4 w-4" />
                            Due {formatDisplayDate(task.due_date, "No deadline")}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            Updated {formatDisplayDate(task.updated_at, "recently")}
                          </span>

                          <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Move Task
                            <select
                              value={task.status}
                              onChange={(event) =>
                                onStatusChange(task.id, event.target.value)
                              }
                              className={`h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black ${statusMeta.chipClass}`}
                              style={{
                                backgroundImage:
                                  'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230f172a\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 0.75rem center",
                                backgroundSize: "1em",
                              }}
                            >
                              {statusOptions.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  className="bg-white text-slate-900"
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => onDelete(task.id)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                              title="Delete task"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete task
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
