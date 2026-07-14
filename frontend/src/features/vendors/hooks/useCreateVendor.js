import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor } from "../api/vendors.api";

/**
 * Hook to execute supplier profile creation and clear stale query caches.
 */
export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};
