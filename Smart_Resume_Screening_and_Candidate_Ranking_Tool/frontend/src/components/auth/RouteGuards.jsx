import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Wraps every authenticated route. Waits for the initial token check to
 * finish before deciding, so a page refresh doesn't flash the login screen
 * at an already-logged-in user.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;

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

  if (initializing) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
