import { Link } from "react-router-dom";
import { LuTrophy } from "react-icons/lu";

const SIZES = {
  sm: { box: "h-7 w-7 rounded-lg", icon: "h-3.5 w-3.5" },
  md: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  lg: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
};

/**
 * The HireSense lockup (mark + wordmark). Shared by the sidebar, the auth
 * screens and the landing header so the brand renders identically everywhere
 * — the mark keeps the existing accent gradient, only its size varies.
 */
export default function Brand({
  size = "sm",
  showName = true,
  nameClassName = "text-[15px]",
  to,
  className = "",
}) {
  const { box, icon } = SIZES[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`${box} bg-gradient-to-br from-accent to-accent-ink flex items-center justify-center shadow-sm shadow-accent/25 shrink-0`}
      >
        <LuTrophy className={`${icon} text-white`} aria-hidden="true" />
      </span>
      {showName && (
        <span className={`font-display font-bold tracking-tight text-ink ${nameClassName}`}>
          HireSense
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex rounded-lg" aria-label="HireSense home">
        {content}
      </Link>
    );
  }
  return content;
}
