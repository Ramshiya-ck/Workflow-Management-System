import { useAuth as useContextAuth } from "../AuthContext";

/**
 * Hook to retrieve user profile data, session scopes, and role verifier checkers.
 */
export const useAuth = () => {
  return useContextAuth();
};
