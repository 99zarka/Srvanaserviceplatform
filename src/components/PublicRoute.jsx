import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // If user is already authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
