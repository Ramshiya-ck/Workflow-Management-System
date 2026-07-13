import { useQuery } from "@tanstack/react-query";
import { fetchProfileApi } from "../api/auth.api";
import { getTokens } from "@/services/apiClient";

/**
 * Query hook fetching authenticated profile data.
 */
export const useCurrentUser = () => {
  const { access } = getTokens();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const data = await fetchProfileApi();
      if (data?.success) {
        return data.data;
      }
      throw new Error(data?.message || "Failed to load profile");
    },
    enabled: !!access,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
