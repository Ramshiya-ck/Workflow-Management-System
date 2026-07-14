import { useQuery } from "@tanstack/react-query";
import { getPendingWorkflowQueue } from "../api/workflow.api";

/**
 * Retrieves and caches active pending workflow queue invoices.
 */
export const useWorkflowQueue = (params = {}) => {
  return useQuery({
    queryKey: ["workflow-queue", params],
    queryFn: () => getPendingWorkflowQueue(params),
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    gcTime: 5 * 60 * 1000,    // 5 minutes garbage collection
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
