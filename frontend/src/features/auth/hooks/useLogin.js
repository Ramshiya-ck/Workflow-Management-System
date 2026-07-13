import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/auth.api";
import { setTokens } from "@/services/apiClient";
import { mapAuthError } from "../validation/errorMapper";

/**
 * Mutation hook handling corporate login requests and storage tokens injection.
 */
export const useLogin = (onSuccessCallback) => {
  return useMutation({
    mutationFn: async ({ email, password, rememberMe }) => {
      const data = await loginApi(email, password);
      if (data?.success) {
        const { tokens, user } = data.data;
        setTokens(tokens.access, tokens.refresh, rememberMe);
        return user;
      }
      throw new Error(data?.message || "Authentication failed");
    },
    onSuccess: (user) => {
      if (onSuccessCallback) {
        onSuccessCallback(user);
      }
    },
    onError: (error) => {
      error.friendlyMessage = mapAuthError(error);
    },
  });
};
