import { motion } from "framer-motion";
import { usePreferences } from "../../context/PreferencesContext";

/**
 * Grid whose children fade/rise in one after another instead of all at once.
 *
 * Same reduced-motion rule as the landing page's `Reveal`: framer-motion is
 * driven in JS, so the app's `.reduce-motion` CSS class can't stop it - the
 * preference has to be read here and the animation skipped entirely.
 *
 * The stagger is intentionally short (60ms per child) and capped by the
 * container's own duration so a long candidate list never leaves the last
 * card waiting to appear.
 */
const CONTAINER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

const ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StaggerGrid({ children, className = "", ...props }) {
  const { reducedMotion } = usePreferences();

  if (reducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div variants={CONTAINER} initial="hidden" animate="show" className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", ...props }) {
  const { reducedMotion } = usePreferences();

  if (reducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div variants={ITEM} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export default StaggerGrid;
