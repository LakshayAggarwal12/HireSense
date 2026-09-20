import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  ...props
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div>
      <label className="text-xs font-medium text-ink-soft mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-canvas
            focus:bg-surface outline-none transition-colors
            ${isPassword ? "pr-10" : ""}
            ${error ? "border-score-low focus:border-score-low" : "border-border focus:border-accent"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
            aria-label={revealed ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {revealed ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-score-low mt-1.5">{error}</p>}
    </div>
  );
}
