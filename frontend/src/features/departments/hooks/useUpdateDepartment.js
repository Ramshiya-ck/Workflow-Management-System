import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDepartment } from "../api/departments.api";

/**
 * Hook to execute department details modifications and invalidate related cached collections.
 */
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", variables.id] });
    },
  });
};
