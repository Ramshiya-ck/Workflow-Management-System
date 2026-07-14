import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVendor } from "../api/vendors.api";

/**
 * Hook to permanently delete supplier profiles and clear stale query caches.
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};
