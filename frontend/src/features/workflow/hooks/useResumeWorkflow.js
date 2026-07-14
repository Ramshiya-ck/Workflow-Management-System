import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeWorkflow } from "../api/workflow.api";

/**
 * Resumes held workflow stage and invalidates all cache queues.
 */
export const useResumeWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeWorkflow,
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
