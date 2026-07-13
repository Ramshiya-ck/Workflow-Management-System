import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../api/departments.api";

/**
 * Hook to execute department registrations and invalidate related cached collections.
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
