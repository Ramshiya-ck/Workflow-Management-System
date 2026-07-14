import { useQuery } from "@tanstack/react-query";
import { getBill } from "../api/bills.api";

/**
 * Hook to retrieve specific invoice details.
 */
export const useBill = (id) => {
  return useQuery({
    queryKey: ["bill", id],
    queryFn: () => getBill(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache stale
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
