import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDepartment } from "../api/departments.api";

/**
 * Hook to permanently remove department records and invalidate related cached collections.
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
