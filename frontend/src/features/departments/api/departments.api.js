import apiClient from "@/services/apiClient";

/**
 * Retrieves departments list matching parameters.
 */
export const getDepartments = async (params = {}) => {
  const response = await apiClient.get("/departments/", { params });
  return response.data;
};

/**
 * Retrieves specific department record details.
 */
export const getDepartment = async (id) => {
  const response = await apiClient.get(`/departments/${id}/`);
  return response.data;
};

/**
 * Registers new store department definitions.
 */
export const createDepartment = async (data) => {
  const response = await apiClient.post("/departments/", {
    name: data.name,
    code: data.code,
    is_active: data.isActive,
  });
  return response.data;
};

/**
 * Updates properties of existing departments. Handles status changes and code constraints.
 */
export const updateDepartment = async ({ id, data }) => {
  let responseData = null;
  
  if (data.name) {
    const res = await apiClient.patch(`/departments/${id}/`, {
      name: data.name,
    });
    responseData = res.data;
  }
  
  if (data.isActive !== undefined) {
    const endpoint = data.isActive 
      ? `/departments/${id}/activate/` 
      : `/departments/${id}/deactivate/`;
    const res = await apiClient.post(endpoint);
    if (!responseData) {
      responseData = res.data;
    }
  }
  
  return responseData;
};

/**
 * Permanently removes specific department record references.
 */
export const deleteDepartment = async (id) => {
  const response = await apiClient.delete(`/departments/${id}/`);
  return response.data;
};
