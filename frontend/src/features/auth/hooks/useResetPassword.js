import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "../api/auth.api";
import { mapAuthError } from "../validation/errorMapper";

/**
 * Mutation hook handling password resets with code/OTP matches.
 */
export const useResetPassword = (onSuccessCallback) => {
  return useMutation({
    mutationFn: async ({ email, code, newPassword }) => {
      const data = await resetPasswordApi(email, code, newPassword);
      if (data?.success) {
        return data;
      }
      throw new Error(data?.message || "Reset failed");
    },
    onSuccess: (data) => {
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error) => {
      error.friendlyMessage = mapAuthError(error);
    },
  });
};
