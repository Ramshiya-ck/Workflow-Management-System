import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutApi } from "../api/auth.api";
import { getTokens, clearTokens } from "@/services/apiClient";

/**
 * Mutation hook performing clean local and remote sign out procedures.
 */
export const useLogout = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { refresh } = getTokens();
      if (refresh) {
        try {
          await logoutApi(refresh);
        } catch (err) {
          console.error("Revoking token failed during logout:", err);
        }
      }
      clearTokens();
    },
    onSuccess: () => {
      queryClient.clear();
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
};
