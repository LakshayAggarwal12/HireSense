import { useState, useRef, useEffect } from "react";
import { LuBell } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import IconButton from "../ui/IconButton";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={LuBell}
        label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-xl shadow-pop overflow-hidden z-30"
          >
            <div className="px-4 py-3 border-b border-border-soft">
              <p className="text-sm font-semibold text-ink">Notifications</p>
            </div>
            <div className="px-4 py-8 text-center">
              <span className="mx-auto mb-3 h-9 w-9 rounded-xl bg-canvas border border-dashed border-border flex items-center justify-center">
                <LuBell className="h-4 w-4 text-ink-soft" aria-hidden="true" />
              </span>
              <p className="text-xs text-ink-soft leading-relaxed">
                Nothing here yet. Interview reminders and ranking updates will show up here once
                that&apos;s wired up.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
