import Reveal from "./Reveal";

/**
 * Shared heading block for landing sections so every section shares the same
 * eyebrow → title → description rhythm.
 */
export default function SectionHeading({ eyebrow, title, body, className = "" }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow && (
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="font-display font-bold tracking-tight text-ink text-2xl sm:text-[2rem] leading-tight mt-3">
          {title}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={0.1}>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed mt-3.5">{body}</p>
        </Reveal>
      )}
    </div>
  );
}
