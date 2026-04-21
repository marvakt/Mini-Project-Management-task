// Custom hook for projects
"use client";

import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/api";
import { projectsApi } from "@/lib/projects";

export const useProjects = ({ autoFetch = true } = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchProjects = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAll(page, limit);
      setProjects(data.items ?? []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch projects"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [autoFetch]);

  const createProject = async (name, description, member_ids = []) => {
    setLoading(true);
    setError(null);
    try {
      const newProject = await projectsApi.create(name, description, member_ids);
      setProjects((currentProjects) => [...currentProjects, newProject]);
      return newProject;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create project"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, name, description, member_ids) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await projectsApi.update(id, name, description, member_ids);
      setProjects((currentProjects) =>
        currentProjects.map((project) => (project.id === id ? updated : project))
      );
      return updated;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update project"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await projectsApi.delete(id);
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== id)
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete project"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
