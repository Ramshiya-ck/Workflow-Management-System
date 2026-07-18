import { useQuery } from "@tanstack/react-query";
import { getWorkflowLogs } from "../api/workflow.api";

/**
 * Retrieves and caches system-wide workflow action transition logs.
 */
export const useWorkflowLogs = (params = {}) => {
  return useQuery({
    queryKey: ["workflow-logs", params],
    queryFn: () => getWorkflowLogs(params),
    staleTime: 1 * 60 * 1000, // 1 minute stale time
    gcTime: 5 * 60 * 1000,    // 5 minutes garbage collection
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
