import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuMenu, LuX } from "react-icons/lu";
import Brand from "../ui/Brand";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import ThemeToggle from "../ui/ThemeToggle";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#explainability", label: "Why it's different" },
];

/**
 * Landing page header. Sticky and translucent so the section underneath
 * stays visible while scrolling; anchors rely on the global scroll-padding
 * so headings don't hide under it after a jump.
 */
export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Brand size="md" nameClassName="text-base" />

        <nav aria-label="Page sections" className="hidden md:flex items-center">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft
                hover:text-ink hover:bg-canvas transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle compact />
          </div>
          <Button to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button to="/register" size="sm" className="hidden sm:inline-flex">
            Get started
          </Button>
          <IconButton
            icon={open ? LuX : LuMenu}
            label={open ? "Close menu" : "Open menu"}
            size="lg"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="landing-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border bg-surface"
          >
            <nav aria-label="Page sections" className="px-4 py-3 flex flex-col">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:text-ink hover:bg-canvas"
                >
                  {link.label}
                </a>
              ))}

              <div className="flex items-center justify-between gap-3 px-3 pt-3 mt-2 border-t border-border-soft">
                <span className="text-xs font-medium text-ink-soft">Theme</span>
                <ThemeToggle compact layoutId="theme-toggle-pill-mobile" />
              </div>

              <div className="grid grid-cols-2 gap-2 px-1 pt-3">
                <Button to="/login" variant="secondary" className="w-full" onClick={close}>
                  Sign in
                </Button>
                <Button to="/register" className="w-full" onClick={close}>
                  Get started
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
