import { useId, useState } from "react";
import { LuEye, LuEyeOff, LuCircleAlert } from "react-icons/lu";

/**
 * Single field primitive for the auth forms. Owns the label/id wiring, the
 * error + hint description, and the password reveal toggle so /login and
 * /register can't drift apart.
 *
 * Errors are rendered as icon + message (not a colored border alone), and
 * wired up with aria-invalid / aria-describedby so screen readers announce
 * the reason instead of just "invalid".
 */
export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  autoComplete,
  id,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  const inputType = isPassword && revealed ? "text" : type;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-semibold text-ink-soft mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-canvas text-ink shadow-xs
            placeholder:text-ink-soft/60 outline-none
            transition-[border-color,background-color] duration-150
            ${isPassword ? "pr-11" : ""}
            ${error ? "border-score-low focus:border-score-low" : "border-border focus:border-accent focus:bg-surface"}`}
          {...props}
        />

        {/* Plain button rather than IconButton here: the tap animation's
            inline transform would fight the -translate-y-1/2 centering. */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            title={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center
              justify-center rounded-lg text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
          >
            {revealed ? (
              <LuEyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <LuEye className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

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
