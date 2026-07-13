import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import AuthLayout from "../components/AuthLayout";
import AuthHeader from "../components/AuthHeader";
import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";
import { getHomeRouteForRole } from "@/routes/roleRoutes";

const LoginPage = () => {
  const { login: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const { mutate: performLogin, isPending, error } = useLogin((user) => {
    // 1. Save user object to AuthContext state
    setAuthUser(user);
    // 2. Redirect based on role-to-route mapper
    const redirectUrl = getHomeRouteForRole(user.role);
    navigate(redirectUrl, { replace: true });
  });

  const handleSubmit = React.useCallback((data) => {
    performLogin({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  }, [performLogin]);

  return (
    <AuthLayout>
      <AuthHeader
        title="Sign in to your account"
        description="Access and clear your pending hypermarket billing workflows."
      />
      <AuthCard>
        {/* Render submission or connection errors */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs font-semibold text-destructive animate-in fade-in duration-200">
            {error.friendlyMessage || error.message}
          </div>
        )}
        <LoginForm onSubmit={handleSubmit} isLoading={isPending} />
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
