import { useId } from "react";
import { LuCircleAlert } from "react-icons/lu";

/**
 * Labelled input/textarea used by the app's content forms (e.g. the job
 * description form). Errors are announced with an icon *and* text — the
 * message never depends on a red border alone.
 */
export default function TextField({
  label,
  hint,
  error,
  as = "input",
  rows = 6,
  className = "",
  id,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const shared = `w-full px-3.5 py-2.5 text-sm rounded-lg border bg-canvas text-ink
    placeholder:text-ink-soft/70 outline-none transition-colors
    focus:bg-surface ${error ? "border-score-low" : "border-border focus:border-accent"}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-ink-soft mb-1.5">
          {label}
        </label>
      )}

      {as === "textarea" ? (
        <textarea
          id={fieldId}
          rows={rows}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`${shared} resize-y min-h-28 leading-relaxed`}
          {...props}
        />
      ) : (
        <input
          id={fieldId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={shared}
          {...props}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-soft mt-1.5">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs text-score-low mt-1.5">
          <LuCircleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
