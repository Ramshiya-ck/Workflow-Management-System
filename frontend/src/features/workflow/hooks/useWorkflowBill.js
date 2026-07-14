import { useQuery } from "@tanstack/react-query";
import { getBill } from "@/features/bills/api/bills.api";

/**
 * Retrieves specific bill details for workflow review.
 */
export const useWorkflowBill = (id) => {
  return useQuery({
    queryKey: ["bill", id],
    queryFn: () => getBill(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
