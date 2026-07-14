import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveWorkflow } from "../api/workflow.api";

/**
 * Executes approval step transition and invalidates all cache queues.
 */
export const useApproveWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveWorkflow,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-queue"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-history", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-bills"] });
    },
  });
};
