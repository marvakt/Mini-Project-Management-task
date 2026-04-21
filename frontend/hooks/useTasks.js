// Custom hook for tasks
"use client";

import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "@/lib/api";
import { tasksApi } from "@/lib/projects-tasks";

export const useTasks = ({ autoFetch = true } = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchTasks = useCallback(async (
    page = 1,
    limit = 10,
    project_id,
    status,
    assigned_to
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getAll(
        page,
        limit,
        project_id,
        status,
        assigned_to
      );
      setTasks(data.items);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch tasks"));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array because it doesn't depend on external props that change

  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [autoFetch]);

  const createTask = async (
    title,
    project_id,
    description,
    assigned_to,
    status = "todo",
    due_date
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await tasksApi.create(
        title,
        project_id,
        description,
        assigned_to,
        status,
        due_date
      );
      setTasks((currentTasks) => [...currentTasks, newTask]);
      return newTask;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create task"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, title, description, status, due_date) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await tasksApi.update(
        id,
        title,
        description,
        status,
        due_date
      );
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updated : task))
      );
      return updated;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await tasksApi.updateStatus(id, status);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updated : task))
      );
      return updated;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update task status"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await tasksApi.delete(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete task"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
};
