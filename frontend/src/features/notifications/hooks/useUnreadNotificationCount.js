import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../api/notifications.api";

/**
 * Hook to retrieve unread notifications count.
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  });
};
