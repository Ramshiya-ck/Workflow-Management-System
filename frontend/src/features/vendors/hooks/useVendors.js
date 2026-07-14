import { useQuery } from "@tanstack/react-query";
import { getVendors } from "../api/vendors.api";

/**
 * Hook to retrieve and cache supplier list records.
 */
export const useVendors = (params = {}) => {
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => getVendors(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
