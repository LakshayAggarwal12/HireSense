import { LuArrowDown } from "react-icons/lu";

/**
 * Keyboard-only escape hatch past the navigation. Hidden until focused, then
 * pinned to the top-left corner so it's clearly the first stop in the tab order.
 */
export default function SkipLink({ href = "#main", children = "Skip to main content" }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
        focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:border
        focus:border-border focus:bg-surface focus:px-4 focus:py-2.5 focus:text-sm
        focus:font-medium focus:text-ink focus:shadow-pop"
    >
      <LuArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </a>
  );
}
