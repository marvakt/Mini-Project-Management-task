// Projects API calls
import apiClient from "./api";

export const projectsApi = {
  async create(name, description, member_ids = []) {
    const response = await apiClient.post("/api/v1/projects", {
      name,
      description,
      member_ids,
    });
    return response.data;
  },

  async getAll(page = 1, limit = 10) {
    const response = await apiClient.get("/api/v1/projects", {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/api/v1/projects/${id}`);
    return response.data;
  },

  async update(id, name, description, member_ids) {
    const response = await apiClient.put(`/api/v1/projects/${id}`, {
      name,
      description,
      member_ids,
    });
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(`/api/v1/projects/${id}`);
  },
};
