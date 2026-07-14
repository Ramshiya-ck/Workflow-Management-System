import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBill } from "../api/bills.api";

/**
 * Hook to execute invoice creation and clear stale query caches.
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-bills"] });
    },
  });
};
