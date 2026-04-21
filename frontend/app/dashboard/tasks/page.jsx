"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import {
  BoardIcon,
  LoadingScreen,
  LogoutIcon,
  Panel,
  PlusIcon,
  WorkspaceShell,
} from "@/components/dashboard-ui";
import { TaskList } from "@/components/TaskList";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { authApi } from "@/lib/auth";

const statusFilters = [
  { value: "", label: "All tasks" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const shellButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50";

const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-black transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    tasks,
    loading,
    error,
    updateTaskStatus,
    deleteTask,
    createTask,
    fetchTasks,
  } = useTasks({ autoFetch: false });
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [pageError, setPageError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const projectId = searchParams.get("project_id");

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!authApi.isAuthenticated()) {
        router.replace("/login");
        return;
      }
      try {
        const user = await authApi.getCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
        }

        const status = user?.role === "admin" ? statusFilter || undefined : undefined;
        await fetchTasks(1, 100, projectId || undefined, status);
      } catch (err) {
        if (isMounted) {
          setPageError(authApi.getErrorMessage(err, "Failed to load your profile"));
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }

    };

    init();

    return () => {
      isMounted = false;
    };
  }, [projectId, statusFilter, fetchTasks]);

  const isAdmin = currentUser?.role === "admin";
  const projectLookup = {};
  projects.forEach((project) => {
    projectLookup[project.id] = project;
  });

  const activeProject = projectId ? projectLookup[projectId] : null;
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const completionRate =
    tasks.length > 0 ? `${Math.round((doneCount / tasks.length) * 100)}%` : "0%";
  const boardSummaries = [
    {
      label: "Pending",
      value: todoCount,
      detail: "Ready to be picked up next.",
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      detail: "Tasks currently moving forward.",
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },
    {
      label: "Completed",
      value: doneCount,
      detail: "Finished work ready for review.",
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },
  ];

  const combinedError = pageError || error || projectsError;
  const initialLoading =
    authLoading ||
    (loading && tasks.length === 0) ||
    (projectsLoading && projects.length === 0);

  const metrics = [
    {
      label: "Visible tasks",
      value: String(tasks.length).padStart(2, "0"),
      detail:
        tasks.length > 0
          ? isAdmin
            ? "Tasks currently in view based on filters."
            : "Tasks visible across your project boards."
          : "Tasks will appear here once added.",
      tone: "mint",
    },
    {
      label: "Current focus",
      value: activeProject ? "1 board" : `${projects.length || 0}`,
      detail: activeProject
        ? activeProject.name
        : "Viewing work across all projects.",
      tone: "navy",
    },
    {
      label: "Completed",
      value: completionRate,
      detail: `${doneCount} of ${tasks.length || 0} tasks done.`,
      tone: "peach",
    },
  ];

  const handleStatusChange = async (id, status) => {
    setPageError(null);

    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      setPageError(authApi.getErrorMessage(err, "Failed to update task status"));
    }
  };

  const handleCreateTask = async (data) => {
    setPageError(null);

    try {
      await createTask(
        data.title,
        data.project_id,
        data.description,
        data.assigned_to,
        data.status,
        data.due_date
      );
    } catch (err) {
      setPageError(authApi.getErrorMessage(err, "Failed to create task"));
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    setPageError(null);

    try {
      await deleteTask(id);
    } catch (err) {
      setPageError(authApi.getErrorMessage(err, "Failed to delete task"));
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.replace("/login");
  };

  if (initialLoading) {
    return (
      <LoadingScreen
        eyebrow="Task flow"
        title="Loading tasks"
        subtitle="Preparing your task view..."
      />
    );
  }

  return (
    <>
      <WorkspaceShell
        sectionLabel="Task flow"
        title={
          activeProject
            ? `Tasks for ${activeProject.name}`
            : "Tasks"
        }
        subtitle={
          activeProject
            ? "Review deadlines, status changes, and next actions for this project."
            : "Track work across projects and manage task status."
        }
        nav={
          <>
            {isAdmin && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/users")}
                className={shellButtonClass}
              >
                Team
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/dashboard/projects")}
              className={shellButtonClass}
            >
              <BoardIcon className="h-4 w-4" />
              Projects
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={shellButtonClass}
            >
              <LogoutIcon className="h-4 w-4" />
              Logout
            </button>
          </>
        }
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={projects.length === 0}
              className={primaryButtonClass}
            >
              <PlusIcon className="h-4 w-4" />
              Create task
            </button>
          ) : null
        }

      >
        <div className="flex flex-col gap-10">
          {combinedError && (
            <Panel className="border-red-200 bg-red-50 p-5 text-red-700">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
                Workflow alert
              </p>
              <p className="mt-2 text-base">{combinedError}</p>
            </Panel>
          )}

          {isAdmin ? (
            <>
              <Panel>
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-black">
                      Filters
                    </p>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                      Task Status
                    </h2>
                    <p className="mt-3 max-w-lg text-base text-slate-500">
                      Filter tasks by their current phase and manage work across the whole team board.
                    </p>
                  </div>

                  {activeProject && (
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/tasks")}
                      className={shellButtonClass}
                    >
                      View all tasks
                    </button>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {statusFilters.map((filter) => {
                    const isActive = statusFilter === filter.value;

                    return (
                      <button
                        key={filter.value || "all"}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={`rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${
                          isActive
                            ? "border-black bg-black text-white shadow-lg shadow-black"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </Panel>

              {tasks.length === 0 ? (
                <Panel className="border-dashed px-6 py-16 text-center sm:px-12">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-black">
                    Empty state
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    No tasks match your filters
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
                    {projects.length === 0
                      ? "Create a project first to start adding tasks."
                      : "Try clearing filters or create a new task."}
                  </p>

                  {projects.length > 0 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className={`${primaryButtonClass} px-8`}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Create task
                      </button>
                    </div>
                  )}
                </Panel>
              ) : (
                <TaskList
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                  projectLookup={projectLookup}
                  isAdmin={isAdmin}
                />
              )}
            </>
          ) : (
            <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black">
                    Sprint board
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    Your Kanban Flow
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                    Move work between Pending, In Progress, and Completed just like a Jira board.
                  </p>
                </div>

                {activeProject && (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/tasks")}
                    className={shellButtonClass}
                  >
                    View all tasks
                  </button>
                )}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {boardSummaries.map((summary) => (
                  <div
                    key={summary.label}
                    className={`rounded-3xl border p-5 ${summary.className}`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                      {summary.label}
                    </p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">
                      {summary.value}
                    </p>
                    <p className="mt-2 text-sm opacity-80">{summary.detail}</p>
                  </div>
                ))}
              </div>

              {tasks.length === 0 ? (
                <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-black">
                    No tasks yet
                  </p>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    Your board is ready
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-500">
                    Once an admin adds you to a project and assigns work, tasks will appear here in three sections.
                  </p>
                </div>
              ) : (
                <div className="mt-8">
                  <TaskList
                    tasks={tasks}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    projectLookup={projectLookup}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
            </section>
          )}
        </div>
      </WorkspaceShell>
      <CreateTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
      />
    </>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          eyebrow="Task flow"
          title="Loading tasks"
          subtitle="Preparing your task view..."
        />
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
