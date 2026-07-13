import apiClient from "./apiClient";

/**
 * Retrieves lists of invoices and workflow stages.
 */
export const getBills = async (params = {}) => {
  const response = await apiClient.get("/bills/", { params });
  return response.data;
};
