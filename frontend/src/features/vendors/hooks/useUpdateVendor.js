import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVendor } from "../api/vendors.api";

/**
 * Hook to execute supplier profile modifications and clear stale query caches.
 */
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", variables.id] });
    },
  });
};
