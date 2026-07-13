/**
 * Maps backend Axios query response error codes into user-friendly corporate messages.
 */
export const mapAuthError = (error) => {
  if (!error) return "";
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      return data?.message || "Invalid credentials. Please verify your email and password.";
    }
    if (status === 403) {
      return data?.message || "Your account has been deactivated or does not have access permissions.";
    }
    if (status === 400) {
      return data?.message || "Bad request. Please verify input formats.";
    }
    if (status >= 500) {
      return "The validation server encountered an internal error. Please contact system administration.";
    }
  }

  if (error.request) {
    return "Network connection failed. Please check your network cables or proxy settings.";
  }

  return error.message || "An unexpected error occurred. Please try again.";
};
