import { useQuery } from "@tanstack/react-query";
import { getWorkflowHistory } from "../api/workflow.api";

/**
 * Retrieves steps details logs trail for specific bill.
 */
export const useWorkflowHistory = (billId) => {
  return useQuery({
    queryKey: ["workflow-history", billId],
    queryFn: () => getWorkflowHistory(billId),
    enabled: !!billId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
