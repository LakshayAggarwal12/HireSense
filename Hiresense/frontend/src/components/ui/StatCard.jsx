import { useEffect, useState, useRef } from "react";

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const numTarget = typeof target === "number" ? target : 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(numTarget * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export default function StatCard({ icon: Icon, label, value, hint }) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0);

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-5 hover-lift">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-soft">{label}</p>
          <p className="text-2xl font-display font-bold font-tabular text-ink leading-tight mt-1">
            {isNumeric ? animated : value}
          </p>
          {hint && <p className="text-[11px] text-ink-soft/80 mt-1.5">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
