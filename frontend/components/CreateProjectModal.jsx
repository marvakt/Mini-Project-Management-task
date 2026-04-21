"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { usersApi } from "@/lib/users";

const fieldClassName = "mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20";

const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

const buttonPrimaryClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 transition-colors";

const buttonSecondaryClass = "inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors";

export function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const formId = "create-project-form";
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    member_ids: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const data = await usersApi.getUsers();
          if (mounted) {
            setUsers(data.items || []);
          }
        } catch (err) {
          console.error("Failed to load users", err);
        } finally {
          if (mounted) setLoadingUsers(false);
        }
      };
      setSubmitError(null);
      fetchUsers();
    }
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      member_ids: [],
    });
  };

  const handleToggleMember = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.member_ids.includes(userId);
      if (isSelected) {
        return { ...prev, member_ids: prev.member_ids.filter((id) => id !== userId) };
      } else {
        return { ...prev, member_ids: [...prev.member_ids, userId] };
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to create project"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-hidden">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl">
        <div className="border-b border-gray-200 px-6 py-5 sm:px-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create a new project</h2>
              <p className="mt-1 text-sm text-gray-600">
                Start a new project and add tasks to it.
              </p>
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

        <form id={formId} onSubmit={handleSubmit} className="flex flex-col w-full">
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[60vh]">
            <div>
              <label htmlFor="name" className={labelClassName}>
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this project"
                rows={4}
                className={`${fieldClassName} resize-none`}
              />
            </div>

            <div>
              <label className={labelClassName}>Project Members</label>
              {loadingUsers ? (
                <p className="text-sm text-gray-500 mt-2">Loading users...</p>
              ) : (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500">No users found.</p>
                  ) : (
                    users.map((user) => (
                      <label key={user.id} className="flex items-center space-x-3 bg-white p-2 rounded-md border border-gray-200 cursor-pointer hover:border-black">
                        <input
                          type="checkbox"
                          checked={formData.member_ids.includes(user.id)}
                          onChange={() => handleToggleMember(user.id)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {user.name} <span className="text-gray-500 font-normal">({user.email})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}
          </div>

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
              disabled={submitting}
              className={buttonPrimaryClass}
            >
              {submitting ? "Submitting..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
