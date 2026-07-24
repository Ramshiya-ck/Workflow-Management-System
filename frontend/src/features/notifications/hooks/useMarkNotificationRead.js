import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../api/notifications.api";

/**
 * Mutation hook to mark notification as read.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      // Invalidate both notifications list and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
