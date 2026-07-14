import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBill } from "../api/bills.api";

/**
 * Hook to execute invoice update mutations and clear stale query caches.
 */
export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBill,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-bills"] });
    },
  });
};
