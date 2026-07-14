import { useQuery } from "@tanstack/react-query";
import { getBills } from "../api/bills.api";

/**
 * Hook to retrieve and cache invoice tracking registries.
 */
export const useBills = (params = {}) => {
  return useQuery({
    queryKey: ["bills", params],
    queryFn: () => getBills(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
