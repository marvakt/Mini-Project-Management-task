"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { usersApi } from "@/lib/users";
import { PlusIcon } from "@/components/dashboard-ui";

const fieldClassName =
  "mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20";

const labelClassName =
  "block text-sm font-medium text-gray-700 mb-1";

const buttonPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 transition-colors";

const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors";

export function CreateTaskModal({ isOpen, onClose, onSubmit, projects, isProject = false }) {
  const formId = "create-task-form";
  const defaultProjectId = projects?.[0]?.id || "";
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: defaultProjectId,
    due_date: "",
    assigned_to: "",
    status: "todo",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Reset form when modal opens
    setSubmitError(null);
    setFormData((currentData) => ({
      ...currentData,
      project_id: currentData.project_id || defaultProjectId,
    }));

    // Fetch users for assignment dropdown
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await usersApi.getUsers(1, 100);
        setUsers(data.items || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [defaultProjectId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      project_id: defaultProjectId,
      due_date: "",
      assigned_to: "",
      status: "todo",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to create task"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-hidden">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isProject ? "Create a new project" : "Create a new task"}</h2><p className="mt-1 text-sm text-gray-600">{isProject ? "Add a new project space to organize teamwork" : "Add a task to your project and manage it from the board"}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {(projects || []).length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-8">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m0 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Create a project first</h3>
              <p className="text-gray-600">You need at least one project before you can create tasks.</p>
            </div>
          </div>
        ) : (
          <form id={formId} onSubmit={handleSubmit} className="flex flex-col w-full">
            {/* Form Content */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[60vh]">
              {/* Title */}
              <div>
                  <label htmlFor="title" className={labelClassName}>
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title"
                    className={fieldClassName}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelClassName}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this task"
                    rows={4}
                    className={`${fieldClassName} resize-none`}
                  />
                </div>

                {!isProject && (<>{/* Project and Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Project */}
                  <div>
                    <label htmlFor="project" className={labelClassName}>
                      Project *
                    </label>
                    <select
                      id="project"
                      required
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className={fieldClassName}
                    >
                      <option value="">Select a project</option>
                      {(projects || []).map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className={labelClassName}>
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={fieldClassName}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                {/* Assign to and Due Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Assign to */}
                  <div>
                    <label htmlFor="assign" className={labelClassName}>
                      Assign to
                    </label>
                    <select
                      id="assign"
                      disabled={loadingUsers}
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className={fieldClassName}
                    >
                      <option value="">
                        {loadingUsers ? "Loading..." : "Select team member"}
                      </option>
                      {users.filter(u => !formData.project_id || ((projects||[]).find(p => p.id === formData.project_id)?.created_by === u.id || (projects||[]).find(p => p.id === formData.project_id)?.member_ids?.includes(u.id))).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label htmlFor="duedate" className={labelClassName}>
                      Due date
                    </label>
                    <input
                      id="duedate"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className={fieldClassName}
                    />
                  </div>
                </div>

                </>)}{/* Error Message */}
                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                )}
            </div>

            {/* Form Buttons */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 sm:px-8 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (projects || []).length === 0}
                className={buttonPrimaryClass}
              >
                {submitting ? "Submitting..." : "Submit Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



