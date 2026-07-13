import { useQuery } from "@tanstack/react-query";
import { getBills } from "@/services/bills.api";

/**
 * Hook to retrieve active list of billing records.
 */
export const useDashboardBills = (params = {}) => {
  return useQuery({
    queryKey: ["dashboardBills", params],
    queryFn: async () => {
      const data = await getBills(params);
      if (data?.success) {
        return data.data.results;
      }
      throw new Error(data?.message || "Failed to load bills");
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
