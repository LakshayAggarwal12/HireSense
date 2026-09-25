import { motion } from "framer-motion";
import { usePreferences } from "../../context/PreferencesContext";

/**
 * Scroll-triggered reveal used throughout the landing page.
 *
 * Plays once per element, and collapses to plain markup when the user has
 * turned animations off in Settings - the app's own reduced-motion switch
 * (a CSS class) can't stop framer-motion, so it has to be checked in JS.
 */
export default function Reveal({ children, delay = 0, y = 14, as = "div", className = "" }) {
  const { reducedMotion } = usePreferences();
  const MotionTag = motion[as] || motion.div;

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
