import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "../components/auth/RouteGuards";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import CandidatesPage from "../pages/CandidatesPage";
import CandidateDetailPage from "../pages/CandidateDetailPage";
import JobsPage from "../pages/JobsPage";
import JobDetailPage from "../pages/JobDetailPage";
import SettingsPage from "../pages/SettingsPage";

const router = createBrowserRouter([
  {
    // Public product overview. Signed-in visitors are redirected to
    // /dashboard by the page itself, so "/" keeps working for them.
    path: "/",
    element: <LandingPage />,
  },
  {
    // Auth pages — redirect away if already signed in.
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    // Everything below requires a valid session.
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "candidates", element: <CandidatesPage /> },
          { path: "candidates/:id", element: <CandidateDetailPage /> },
          { path: "jobs", element: <JobsPage /> },
          { path: "jobs/:id", element: <JobDetailPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

export default router;
