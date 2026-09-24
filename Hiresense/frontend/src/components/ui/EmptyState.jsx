import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="h-12 w-12 rounded-xl bg-canvas border border-dashed border-border flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-ink-soft" />
        </motion.div>
      )}
      <h3 className="font-display font-semibold text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-ink-soft leading-relaxed max-w-sm mt-1.5 mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
