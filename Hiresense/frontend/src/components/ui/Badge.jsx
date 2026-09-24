import { getScoreBand, SCORE_COLORS } from "../../utils/scoring";

// Score bands also carry a word, so the meaning never depends on color alone.
const BAND_LABEL = { high: "High", mid: "Medium", low: "Low" };

export function ScoreBadge({ score, children }) {
  const band = getScoreBand(score ?? 0);
  const { text, bg } = SCORE_COLORS[band];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold font-mono ${text} ${bg}`}
    >
      <span className="sr-only">{BAND_LABEL[band]} score: </span>
      {children ?? `${Math.round(score)}`}
    </span>
  );
}

const TONES = {
  neutral: "bg-canvas text-ink-soft border border-border-soft",
  accent: "bg-accent-soft text-accent-ink border border-accent/15",
  outline: "bg-transparent text-ink-soft border border-border",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
