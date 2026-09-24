/**
 * Base surface for every panel in the app: one border color, one radius,
 * one elevation token. Keeps cards identical across pages without each page
 * re-deciding its own border/shadow stack.
 */
export default function Card({ children, className = "", padded = true, interactive = false, ...props }) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-card
        ${padded ? "p-5" : ""}
        ${interactive ? "hover-lift" : ""}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
