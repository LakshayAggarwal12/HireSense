import { useMemo } from "react";
import { LuCheck, LuX, LuCircleAlert } from "react-icons/lu";
import { getScoreBand, SCORE_COLORS } from "../../utils/scoring";

/**
 * Renders the v2 ATS report: checks grouped by category, each showing the
 * points actually earned out of the points available.
 *
 * Handles v1 reports too - older ATS reports saved before the category
 * upgrade have no `category` field on their checks, so those fall back to a
 * single ungrouped list rather than rendering an empty screen.
 */
function CategoryScoreBar({ label, score }) {
  const band = getScoreBand(score);
  const { text, ring } = SCORE_COLORS[band];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-ink">{label}</span>
        <span className={`text-sm font-mono font-semibold ${text}`}>{Math.round(score)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border-soft overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, backgroundColor: ring }}
        />
      </div>
    </div>
  );
}

function CheckRow({ check }) {
  // Partial credit: a check can be "not passed" while still having earned
  // most of its points, so the icon reflects three states, not two.
  const isFull = check.score >= 0.999;
  const isPartial = !isFull && check.score > 0;

  const { icon: Icon, cls } = isFull
    ? { icon: LuCheck, cls: "bg-score-high-soft text-score-high" }
    : isPartial
    ? { icon: LuCircleAlert, cls: "bg-score-mid-soft text-score-mid" }
    : { icon: LuX, cls: "bg-score-low-soft text-score-low" };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cls}`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-ink">{check.name}</p>
          <span className="text-[11px] font-mono text-ink-soft shrink-0">
            {check.earned_points ?? 0}/{check.weight}
          </span>
        </div>
        <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{check.message}</p>
      </div>
    </div>
  );
}

export default function AtsChecklist({ checks = [], categoryScores = {} }) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const check of checks) {
      const key = check.category || "Checks";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(check);
    }
    return Array.from(map.entries());
  }, [checks]);

  const hasCategories = Object.keys(categoryScores).length > 0;

  return (
    <div className="space-y-6">
      {hasCategories && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-1">
          {Object.entries(categoryScores).map(([label, score]) => (
            <CategoryScoreBar key={label} label={label} score={score} />
          ))}
        </div>
      )}

      {grouped.map(([category, categoryChecks]) => (
        <div key={category}>
          <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wide mb-1">
            {category}
          </p>
          <div className="divide-y divide-border-soft">
            {categoryChecks.map((check) => (
              <CheckRow key={check.name} check={check} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
