import { motion } from "framer-motion";
import { LuDatabase, LuFileCheck, LuSparkles } from "react-icons/lu";
import Brand from "../ui/Brand";
import ThemeToggle from "../ui/ThemeToggle";

// Grounded in what the product actually does — no invented marketing claims.
const HIGHLIGHTS = [
  {
    icon: LuFileCheck,
    title: "ATS parseability, itemised",
    body: "Seven weighted checks — text extraction, section headers, layout, contact info, images, special characters and length — each with a reason and a suggested fix.",
  },
  {
    icon: LuSparkles,
    title: "Ranking you can audit",
    body: "TF-IDF content similarity combined with exact required-skill overlap, plus the matched and missing skills behind every score.",
  },
  {
    icon: LuDatabase,
    title: "A real skills taxonomy",
    body: "88 skills across 10 categories and 8 job fields, with alias normalisation, powering both field detection and skill matching.",
  },
];

/**
 * Shared shell for /login and /register.
 *
 * On large screens the form sits next to a brand panel that already answers
 * "what is this product?" — so both pages stay visually identical without
 * duplicating branding, capability copy or the layout itself. Below lg the
 * panel drops away and the form uses the full width.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16 shrink-0">
        <Brand size="md" to="/" nameClassName="text-[15px]" />
        <ThemeToggle compact />
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto grid lg:grid-cols-2">
        <aside className="hidden lg:flex flex-col justify-center px-10 xl:px-14 py-14 bg-surface border-x border-border-soft">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            AI resume screening
          </p>
          <h2 className="font-display font-bold text-2xl xl:text-[28px] leading-tight mt-3 text-ink">
            Screening that shows its work.
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed mt-3 max-w-md">
            Every score HireSense produces comes from rule-based checks, weighted formulas and a
            queryable skills database — not an opaque model output.
          </p>

          <ul className="mt-9 space-y-7 max-w-md">
            {HIGHLIGHTS.map(({ icon: Icon, title: highlightTitle, body }) => (
              <li key={highlightTitle} className="flex gap-3.5">
                <span className="h-8 w-8 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{highlightTitle}</p>
                  <p className="text-xs text-ink-soft leading-relaxed mt-1">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-[11px] font-medium text-ink-soft border-t border-border-soft pt-4">
            PDF and DOCX uploads · explainable scores · light, dark and system themes
          </p>
        </aside>

        <main className="flex flex-col justify-center px-4 sm:px-10 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-surface border border-border rounded-xl shadow-raised p-6 sm:p-7">
              <h1 className="font-display font-semibold text-xl text-ink">{title}</h1>
              {subtitle && <p className="text-sm text-ink-soft leading-relaxed mt-1.5 mb-6">{subtitle}</p>}
              {children}
            </div>

            {footer && <div className="text-center mt-5 text-sm text-ink-soft">{footer}</div>}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
