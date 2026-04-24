import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <p className="auth-loading">Checking session...</p>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
