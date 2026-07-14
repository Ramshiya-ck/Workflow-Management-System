import { useQuery } from "@tanstack/react-query";
import { getVendor } from "../api/vendors.api";

/**
 * Hook to retrieve specific supplier details.
 */
export const useVendor = (id) => {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendor(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false,
  });
};
