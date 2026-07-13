import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "../api/departments.api";

/**
 * Hook to retrieve specific department details.
 */
export const useDepartment = (id) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => getDepartment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false,
  });
};
