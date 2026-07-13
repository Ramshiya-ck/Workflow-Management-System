export const ROLE_HOME_ROUTES = {
  SUPER_ADMIN: "/",
  DATA_ENTRY: "/",
  SUPERVISOR: "/",
  DEPARTMENT_MANAGER: "/",
  ACCOUNTS: "/",
};

/**
 * Resolves the primary dashboard redirect route based on employee authorization roles.
 */
export const getHomeRouteForRole = (role) => {
  return ROLE_HOME_ROUTES[role] || "/";
};
