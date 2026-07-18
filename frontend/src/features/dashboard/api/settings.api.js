import apiClient from "@/services/apiClient";

export const getSystemSettings = async () => {
  const response = await apiClient.get("/users/system-settings/");
  return response.data;
};

export const updateSystemSettings = async (data) => {
  const response = await apiClient.post("/users/system-settings/", data);
  return response.data;
};
