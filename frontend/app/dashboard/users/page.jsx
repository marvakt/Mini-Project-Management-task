"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BoardIcon,
  LoadingScreen,
  LogoutIcon,
  Panel,
  PlusIcon,
  WorkspaceShell,
} from "@/components/dashboard-ui";
import { useUsers } from "@/hooks/useUsers";
import { authApi } from "@/lib/auth";

const fieldClassName =
  "glass-input mt-3 block w-full rounded-xl px-4 py-3 text-[15px]";

const shellButtonClass =
  "btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[14px]";

const primaryButtonClass =
  "btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold";

export default function UsersPage() {
  const router = useRouter();
  const { users, loading, error, fetchUsers, createUser, deleteUser } =
    useUsers({ autoFetch: false });
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

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
          if (user.role !== "admin") {
            router.replace("/dashboard/projects");
            return;
          }
        }
      } catch (err) {
        if (isMounted) {
          setPageError(authApi.getErrorMessage(err, "Failed to load profile"));
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
          fetchUsers();
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [router, fetchUsers]);

  const combinedError = pageError || error;
  const initialLoading = authLoading || (loading && users.length === 0);

  const metrics = [
    {
      label: "Total members",
      value: String(users.length).padStart(2, "0"),
      detail: "Registered developers and admins.",
      tone: "mint",
    },
  ];

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      setPageError("You cannot delete yourself.");
      return;
    }
    setPageError(null);
    try {
      await deleteUser(userId);
    } catch (err) {
      setPageError(authApi.getErrorMessage(err, "Failed to delete user"));
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setPageError(null);

    try {
      await createUser(formData.name, formData.email, formData.password);
      setFormData({ name: "", email: "", password: "" });
      setShowCreateForm(false);
    } catch (err) {
      setPageError(authApi.getErrorMessage(err, "Failed to create user"));
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.replace("/login");
  };

  if (initialLoading) {
    return (
      <LoadingScreen
        eyebrow="Team overview"
        title="Loading team directory"
        subtitle="Fetching user roles and profiles."
      />
    );
  }

  // Double check client side render block
  if (currentUser?.role !== "admin") return null;

  return (
    <WorkspaceShell
      sectionLabel="Team directory"
      title="Users"
      subtitle="Manage developer access across all projects in the workspace."
      nav={
        <>
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
            onClick={() => router.push("/dashboard/tasks")}
            className={shellButtonClass}
          >
            Tasks
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
        <button
          type="button"
          onClick={() => setShowCreateForm((currentValue) => !currentValue)}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px]"
        >
          <PlusIcon className="h-4 w-4" />
          {showCreateForm ? "Hide form" : "Add Developer"}
        </button>
      }
      metrics={metrics}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_400px]">
        <div className="flex flex-col gap-8">
          {combinedError && (
            <Panel className="border-red-500/30 bg-red-500/10 text-red-400 !px-6 !py-5">
              <p className="text-sm font-bold uppercase tracking-widest text-red-300">
                Workspace error
              </p>
              <p className="mt-2 text-base">{combinedError}</p>
            </Panel>
          )}

          <div className="grid gap-6">
            {users.map((user) => (
              <Panel key={user.id} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                    <span className="mt-4 inline-block rounded-lg bg-gray-800/60 px-3 py-1 text-xs font-semibold text-black uppercase tracking-wider border border-black/20">
                      {user.role}
                    </span>
                  </div>
                  {user.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Remove User
                    </button>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <Panel className="backdrop-blur-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-black">
                Action
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                {showCreateForm ? "New Developer" : "Scale the Team"}
              </h2>
              <p className="mt-3 text-[15px] text-gray-400 leading-relaxed">
                {showCreateForm
                  ? "Generate credentials for a new developer."
                  : "Invite new builders to execute tasks."}
              </p>
            </div>

            {showCreateForm ? (
              <form onSubmit={handleCreate} className="mt-8 space-y-6 pt-8 border-t border-white/10">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    placeholder="e.g. Jane Developer"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
                    }
                    placeholder="jane@techbrain.dev"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({ ...formData, password: event.target.value })
                    }
                    placeholder="Enter temp password"
                    className={fieldClassName}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-[15px]"
                    disabled={loading}
                  >
                    <PlusIcon className="h-4 w-4" />
                    {loading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Register User
                </button>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </WorkspaceShell>
  );
}
