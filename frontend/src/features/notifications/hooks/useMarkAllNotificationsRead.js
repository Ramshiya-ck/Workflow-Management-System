import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsRead } from "../api/notifications.api";

/**
 * Mutation hook to mark all notifications as read.
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate both notifications list and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
