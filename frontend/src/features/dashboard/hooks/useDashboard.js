import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "../api/dashboard.api";

/**
 * Hook to retrieve and cache role-based corporate dashboard statistics.
 */
export const useDashboard = (view = "") => {
  return useQuery({
    queryKey: ["dashboardMetrics", view],
    queryFn: () => getDashboardMetrics(view),
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
