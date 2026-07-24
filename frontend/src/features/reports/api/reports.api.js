import apiClient from "@/services/apiClient";

/**
 * API Wrapper for Reports and Analytics endpoints.
 */

export const getReports = async (params = {}) => {
  const response = await apiClient.get("/reports/", { params });
  return response.data;
};

export const getDashboardSummary = async (params = {}) => {
  const response = await apiClient.get("/reports/summary/", { params });
  return response.data;
};

export const getDepartmentReport = async (params = {}) => {
  const response = await apiClient.get("/reports/department/", { params });
  return response.data;
};

export const getVendorReport = async (params = {}) => {
  const response = await apiClient.get("/reports/vendor/", { params });
  return response.data;
};

export const getWorkflowReport = async (params = {}) => {
  const response = await apiClient.get("/reports/workflow/", { params });
  return response.data;
};

export const getStatusReport = async (params = {}) => {
  const response = await apiClient.get("/reports/status/", { params });
  return response.data;
};

export const getAgingReport = async (params = {}) => {
  const response = await apiClient.get("/reports/aging/", { params });
  return response.data;
};

export const getAuditReport = async (params = {}) => {
  const response = await apiClient.get("/reports/audit/", { params });
  return response.data;
};

export const getExportCSVUrl = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${apiClient.defaults.baseURL}/reports/csv/${queryString ? `?${queryString}` : ""}`;
};

export const getExportHTMLUrl = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${apiClient.defaults.baseURL}/reports/html/${queryString ? `?${queryString}` : ""}`;
};
