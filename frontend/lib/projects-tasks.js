// Tasks API calls
import apiClient from "./api";

const normalizeOptionalField = (value) => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : null;
  }

  return value ?? null;
};

export const tasksApi = {
  async create(
    title,
    project_id,
    description,
    assigned_to,
    status = "todo",
    due_date
  ) {
    const response = await apiClient.post("/api/v1/tasks", {
      title,
      description: normalizeOptionalField(description),
      project_id,
      assigned_to: normalizeOptionalField(assigned_to),
      status,
      due_date: normalizeOptionalField(due_date),
    });
    return response.data;
  },

  async getAll(page = 1, limit = 10, project_id, status, assigned_to) {
    const params = { page, limit };
    if (project_id) params.project_id = project_id;
    if (status) params.status = status;
    if (assigned_to) params.assigned_to = assigned_to;

    const response = await apiClient.get("/api/v1/tasks", { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/api/v1/tasks/${id}`);
    return response.data;
  },

  async update(id, title, description, status, due_date) {
    const response = await apiClient.put(`/api/v1/tasks/${id}`, {
      title,
      description: normalizeOptionalField(description),
      status,
      due_date: normalizeOptionalField(due_date),
    });
    return response.data;
  },

  async assign(id, assigned_to) {
    const response = await apiClient.put(`/api/v1/tasks/${id}/assign`, {
      assigned_to: normalizeOptionalField(assigned_to),
    });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await apiClient.put(`/api/v1/tasks/${id}/status`, {
      status,
    });
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(`/api/v1/tasks/${id}`);
  },
};
