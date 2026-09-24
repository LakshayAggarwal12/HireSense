import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Single button primitive for the whole app.
 *
 * `focus-visible:outline-*` is set per variant: the global focus ring uses
 * the accent color, which would disappear against the accent-filled primary
 * button, so primary swaps to a darker accent outline instead.
 */
const VARIANTS = {
  primary:
    "bg-gradient-to-b from-[#4362e0] to-accent text-white shadow-sm shadow-accent/25 hover:brightness-[1.06] active:brightness-95 focus-visible:outline-accent-ink",
  secondary:
    "bg-surface text-ink border border-border shadow-xs hover:bg-canvas hover:border-ink/20 active:bg-border-soft",
  ghost: "text-ink-soft hover:bg-canvas hover:text-ink active:bg-border-soft",
  danger:
    "bg-score-low-soft text-score-low border border-score-low/25 hover:bg-score-low/15 active:bg-score-low/20",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-sm px-5 py-3 gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  to,
  ...props
}) {
  const inactive = disabled || loading;

  const classes = `inline-flex items-center justify-center font-medium rounded-lg whitespace-nowrap
    transition-[background-color,background-image,box-shadow,filter,border-color,color] duration-150
    ${inactive ? "opacity-50 cursor-not-allowed" : ""}
    ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading ? (
        <span
          className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin"
          aria-hidden="true"
        />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </>
  );

  // Navigation CTAs render as real links rather than a button nested inside
  // an anchor, which keeps the markup valid and keyboard behaviour normal.
  if (to && !inactive) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      // A restrained press feedback: enough to feel responsive, small enough
      // that it never looks bouncy.
      whileTap={{ scale: inactive ? 1 : 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      type={type}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </motion.button>
  );
}
