import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectWorkflow } from "../api/workflow.api";

/**
 * Executes rejection backward step transition and invalidates all cache queues.
 */
export const useRejectWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectWorkflow,
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
