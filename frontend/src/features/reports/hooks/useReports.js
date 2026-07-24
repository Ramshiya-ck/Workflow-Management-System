import { useQuery } from "@tanstack/react-query";
import {
  getReports,
  getDashboardSummary,
  getDepartmentReport,
  getVendorReport,
  getWorkflowReport,
  getStatusReport,
  getAgingReport,
  getAuditReport,
} from "../api/reports.api";

/**
 * Centered Query Keys for Reports feature.
 */
export const REPORT_QUERY_KEYS = {
  all: (params) => ["bills", "reports", params],
  summary: (params) => ["bills", "reports", "summary", params],
  department: (params) => ["bills", "reports", "department", params],
  vendor: (params) => ["bills", "reports", "vendor", params],
  workflow: (params) => ["bills", "reports", "workflow", params],
  status: (params) => ["bills", "reports", "status", params],
  aging: (params) => ["bills", "reports", "aging", params],
  audit: (params) => ["bills", "reports", "audit", params],
};

const QUERY_CONFIG = {
  staleTime: 5000, // 5 seconds stale window to prevent duplicate requests on quick re-renders
  gcTime: 600000,  // 10 minutes garbage collection time
};

export const useReportsList = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.all(params),
    queryFn: () => getReports(params),
    ...QUERY_CONFIG,
  });
};

export const useDashboardSummary = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.summary(params),
    queryFn: () => getDashboardSummary(params),
    ...QUERY_CONFIG,
  });
};

export const useDepartmentReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.department(params),
    queryFn: () => getDepartmentReport(params),
    ...QUERY_CONFIG,
  });
};

export const useVendorReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.vendor(params),
    queryFn: () => getVendorReport(params),
    ...QUERY_CONFIG,
  });
};

export const useWorkflowReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.workflow(params),
    queryFn: () => getWorkflowReport(params),
    ...QUERY_CONFIG,
  });
};

export const useStatusReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.status(params),
    queryFn: () => getStatusReport(params),
    ...QUERY_CONFIG,
  });
};

export const useAgingReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.aging(params),
    queryFn: () => getAgingReport(params),
    ...QUERY_CONFIG,
  });
};

export const useAuditReport = (params = {}) => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.audit(params),
    queryFn: () => getAuditReport(params),
    ...QUERY_CONFIG,
  });
};
