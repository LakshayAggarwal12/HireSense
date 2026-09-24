import { Link } from "react-router-dom";
import Brand from "../ui/Brand";

const SECTIONS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#explainability", label: "Why it's different" },
];

const LINK_CLASS =
  "text-xs text-ink-soft hover:text-ink transition-colors rounded-md focus-visible:outline-2";

export default function LandingFooter() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Brand size="md" nameClassName="text-base" />
            <p className="text-xs text-ink-soft leading-relaxed mt-3.5 max-w-sm">
              AI-powered resume screening and candidate ranking. Parses resumes, scores ATS
              parseability and ranks candidates against a job description — with the reasoning shown
              rather than hidden.
            </p>
            <p className="text-[11px] text-ink-soft leading-relaxed mt-4 max-w-sm">
              The hosted backend runs on a free tier, so the first request after a period of
              inactivity can take 30–60 seconds while it wakes up. Later requests are fast.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Overview</h3>
            <ul className="mt-3.5 space-y-2.5">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <a href={section.href} className={LINK_CLASS}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Get started
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              <li>
                <Link to="/login" className={LINK_CLASS}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className={LINK_CLASS}>
                  Create an account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-ink-soft">
            Built with FastAPI, spaCy, scikit-learn, PostgreSQL, React and Tailwind CSS.
          </p>
          <p className="text-[11px] text-ink-soft">HireSense · Lakshay Aggarwal</p>
        </div>
      </div>
    </footer>
  );
}
