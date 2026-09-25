import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIZES = {
  sm: { box: "h-8 w-8", icon: "h-3.5 w-3.5" },
  md: { box: "h-9 w-9", icon: "h-4 w-4" },
  lg: { box: "h-10 w-10", icon: "h-4.5 w-4.5" },
};

const VARIANTS = {
  ghost: "text-ink-soft hover:text-ink hover:bg-canvas active:bg-border-soft",
  outline: "text-ink-soft bg-surface border border-border hover:text-ink hover:bg-canvas",
  danger: "text-ink-soft hover:text-score-low hover:bg-score-low-soft",
};

/**
 * Square icon-only control used across the chrome (topbar, sidebar, panels).
 * `label` is mandatory - it becomes both the accessible name and the tooltip,
 * so an icon button can never end up unlabelled.
 *
 * Pass `to` to render a router link in the same style instead of nesting a
 * button inside an anchor.
 */
export default function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  className = "",
  type = "button",
  to,
  ...props
}) {
  const { box, icon } = SIZES[size];

  const classes = `inline-flex items-center justify-center rounded-lg shrink-0
    transition-colors duration-150 ${box} ${VARIANTS[variant]} ${className}`;

  const glyph = <Icon className={icon} aria-hidden="true" />;

  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={classes} {...props}>
        {glyph}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      aria-label={label}
      title={label}
      className={classes}
      {...props}
    >
      {glyph}
    </motion.button>
  );
}
