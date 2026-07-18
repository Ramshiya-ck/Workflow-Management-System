export const ROLE_HOME_ROUTES = {
  SUPER_ADMIN: "/",
  RECEIVING: "/",
  DATA_ENTRY: "/",
  SUPERVISOR: "/",
  MANAGER: "/",
  ACCOUNTS: "/",
  AUDIT_MANAGER: "/",
};

/**
 * Resolves the primary dashboard redirect route based on employee authorization roles.
 */
export const getHomeRouteForRole = (role) => {
  return ROLE_HOME_ROUTES[role] || "/";
};
