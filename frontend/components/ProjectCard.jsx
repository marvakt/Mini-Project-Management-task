"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  FolderIcon,
  formatDisplayDate,
  TrashIcon,
} from "@/components/dashboard-ui";

const secondaryButtonClass =
  "btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium";

const deleteButtonClass =
  "inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 shadow-sm";

const primaryButtonClass = 
  "inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black shadow-sm transition-all";

export function ProjectCard({ project, isAdmin, onDelete }) {
  const description =
    project.description?.trim() ||
    "No description provided. Add a brief to help teammates understand the project goals.";
  const memberCount = project.member_ids?.length || 0;

  return (
    <article className="group flex flex-col justify-between rounded-xl bg-white border border-gray-200 p-6 sm:p-8 transition-all hover:border-black hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-black tracking-wide uppercase border border-black">
            <FolderIcon className="h-4 w-4" />
            Project
          </span>
          <span className="text-xs font-medium text-gray-500">
            {formatDisplayDate(project.updated_at, "Recently updated")}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-bold tracking-tight text-gray-900 group-hover:text-black transition-colors">
          {project.name}
        </h3>
        <p className="mt-3 min-h-[64px] text-sm text-gray-600 leading-relaxed line-clamp-3">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-600 border border-gray-200">
            <CalendarIcon className="h-3.5 w-3.5" />
            Created {formatDisplayDate(project.created_at, "recently")}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-600 border border-gray-200">
            {project.description?.trim() ? "Brief included" : "Needs brief"}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-600 border border-gray-200">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
        <Link
          href={`/dashboard/tasks?project_id=${project.id}`}
          className={primaryButtonClass}
        >
          Open tasks
          <ArrowRightIcon className="h-4 w-4" />
        </Link>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            className={deleteButtonClass}
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        )}

        {!isAdmin && (
          <span className="px-2 text-sm text-gray-500">
            Team view only
          </span>
        )}
      </div>
    </article>
  );
}