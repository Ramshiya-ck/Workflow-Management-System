import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notifications.api";

/**
 * Hook to retrieve notifications list.
 */
export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  });
};
