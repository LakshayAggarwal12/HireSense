import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FullPageLoader from "../ui/FullPageLoader";

/**
 * Wraps every authenticated route. Waits for the initial token check to
 * finish before deciding, so a page refresh doesn't flash the login screen
 * at an already-logged-in user.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader label="Checking your session" />;

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/**
 * For /login and /register — redirects already-authenticated users away,
 * so a logged-in user visiting /login lands on the dashboard instead.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <FullPageLoader label="Checking your session" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
