import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../api/departments.api";

/**
 * Hook to retrieve and cache list of departments.
 */
export const useDepartments = (params = {}) => {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => getDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
