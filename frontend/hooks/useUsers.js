import { useState, useCallback } from "react";
import { usersApi } from "@/lib/users";
import { getErrorMessage } from "@/lib/api";

export function useUsers({ autoFetch = false } = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getUsers(page, limit);
      setUsers(data.items || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (name, email, password) => {
    try {
      setError(null);
      const newUser = await usersApi.createUser(name, email, password);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      setError(null);
      await usersApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
  };
}
