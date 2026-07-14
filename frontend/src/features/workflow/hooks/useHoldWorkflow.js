import { useMutation, useQueryClient } from "@tanstack/react-query";
import { holdWorkflow } from "../api/workflow.api";

/**
 * Places invoice on HOLDING stage and invalidates all cache queues.
 */
export const useHoldWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: holdWorkflow,
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
