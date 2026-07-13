import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi } from "../api/auth.api";
import { mapAuthError } from "../validation/errorMapper";

/**
 * Mutation hook handling reset password link dispatch requests.
 */
export const useForgotPassword = (onSuccessCallback) => {
  return useMutation({
    mutationFn: async (email) => {
      const data = await forgotPasswordApi(email);
      if (data?.success) {
        return data;
      }
      throw new Error(data?.message || "Request failed");
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
