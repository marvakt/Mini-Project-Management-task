import apiClient from "./api";

export const usersApi = {
  getUsers: async (page = 1, limit = 50) => {
    const response = await apiClient.get("/api/v1/users", {
      params: { page, limit },
    });
    return response.data;
  },
  createUser: async (name, email, password) => {
    const response = await apiClient.post("/api/v1/users", {
      name,
      email,
      password,
    });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};
