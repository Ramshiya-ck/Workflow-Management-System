import apiClient from "@/services/apiClient";

/**
 * Retrieves role-tailored dashboard metrics and KPI cards.
 */
export const getDashboardMetrics = async (view = "") => {
  const response = await apiClient.get("/dashboard/", {
    params: view ? { view } : {},
  });
  return response.data;
};
