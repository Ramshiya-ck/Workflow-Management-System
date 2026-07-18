import apiClient from "@/services/apiClient";

export const getUsers = async (params) => {
  const response = await apiClient.get("/users/", { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}/`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await apiClient.post("/users/", data);
  return response.data;
};

export const updateUser = async ({ id, data }) => {
  const response = await apiClient.patch(`/users/${id}/`, data);
  return response.data;
};

export const activateUser = async (id) => {
  const response = await apiClient.post(`/users/${id}/activate/`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await apiClient.post(`/users/${id}/deactivate/`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}/`);
  return response.data;
};

export const resetPassword = async ({ id, password }) => {
  const response = await apiClient.post(`/users/${id}/reset-password/`, { password });
  return response.data;
};

export const getRoles = async () => {
  const response = await apiClient.get("/users/roles/");
  return response.data;
};
