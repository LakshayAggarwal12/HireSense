import { Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "../components/ui/FullPageLoader";
import SkipLink from "../components/ui/SkipLink";
import LandingNav from "../components/landing/LandingNav";
import LandingHero from "../components/landing/LandingHero";
import LandingFeatures from "../components/landing/LandingFeatures";
import LandingWorkflow from "../components/landing/LandingWorkflow";
import LandingExplainability from "../components/landing/LandingExplainability";
import LandingCta from "../components/landing/LandingCta";
import LandingFooter from "../components/landing/LandingFooter";

/**
 * Public product overview at "/".
 *
 * Signed-in visitors are sent straight to their dashboard, so the app's
 * original entry point still lands where they expect. Everyone else gets the
 * marketing page instead of being bounced to the login form.
 *
 * MotionConfig ties framer-motion to the OS "reduce motion" setting; the
 * app's own Animations preference is honoured inside <Reveal>.
 */
export default function LandingPage() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <FullPageLoader label="Checking your session" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-canvas flex flex-col">
        <SkipLink />
        <LandingNav />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <LandingHero />
          <LandingFeatures />
          <LandingWorkflow />
          <LandingExplainability />
          <LandingCta />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
