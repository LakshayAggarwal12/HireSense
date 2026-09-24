import { LuCheck } from "react-icons/lu";

const REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { id: "case", label: "Upper and lowercase letter", test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { id: "number", label: "At least one number", test: (pw) => /\d/.test(pw) },
  { id: "symbol", label: "At least one symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const BANDS = {
  0: { label: "Too weak", bar: "bg-score-low", text: "text-score-low" },
  1: { label: "Weak", bar: "bg-score-low", text: "text-score-low" },
  2: { label: "Fair", bar: "bg-score-mid", text: "text-score-mid" },
  3: { label: "Good", bar: "bg-score-mid", text: "text-score-mid" },
  4: { label: "Strong", bar: "bg-score-high", text: "text-score-high" },
};

/**
 * Client-side password feedback for the register form.
 *
 * Advisory only — it never blocks submission. The backend's own rule
 * (min length 8) stays the source of truth, and this deliberately mirrors
 * just that rule as a requirement so the two can't contradict each other.
 */
export default function PasswordStrength({ password }) {
  if (!password) return null;

  const results = REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }));
  const metCount = results.filter((r) => r.met).length;
  const band = BANDS[metCount];
  // The required rule is the backend's; the rest are advisory tips.
  const blocking = !results.find((r) => r.id === "length").met;

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                step <= metCount ? band.bar : "bg-border"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-medium ${band.text}`}>{band.label}</span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
        {results.map((r) => (
          <li key={r.id} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <span
              className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${
                r.met ? "bg-score-high-soft text-score-high" : "bg-canvas border border-border text-transparent"
              }`}
              aria-hidden="true"
            >
              <LuCheck className="h-2.5 w-2.5" />
            </span>
            <span className={r.met ? "text-ink" : ""}>{r.label}</span>
            <span className="sr-only">{r.met ? " — met" : " — not met"}</span>
          </li>
        ))}
      </ul>

      <p className="sr-only" role="status">
        Password strength: {band.label}.
      </p>

      {blocking && password.length > 0 && (
        <p className="text-[11px] text-ink-soft mt-2">
          A password of at least 8 characters is required to continue.
        </p>
      )}
    </div>
  );
}
