import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBill } from "../api/bills.api";

/**
 * Hook to execute invoice deletions and clear stale query caches.
 */
export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-bills"] });
    },
  });
};
