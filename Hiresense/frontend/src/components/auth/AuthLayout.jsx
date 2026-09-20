import { LuTrophy } from "react-icons/lu";
import { motion } from "framer-motion";

/**
 * Shared shell for /login and /register so both pages stay visually
 * identical without duplicating the branding and card markup.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent to-accent-ink flex items-center justify-center shadow-sm shadow-accent/30">
            <LuTrophy className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">HireSense</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-7">
          <h1 className="font-display font-semibold text-xl text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mt-1.5 mb-6">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="text-center mt-5 text-sm text-ink-soft">{footer}</div>}
      </motion.div>
    </div>
  );
}
