import {
  LuArrowRight,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuFileText,
  LuSparkles,
} from "react-icons/lu";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ScoreRing from "../ui/ScoreRing";
import Reveal from "./Reveal";
import { getScoreBand, SCORE_COLORS } from "../../utils/scoring";

const META = [
  "PDF & DOCX up to 5MB",
  "88-skill taxonomy built in",
  "Light, dark & system themes",
];

// Mirrors the two signals the backend's matcher actually combines.
const MATCH_METRICS = [
  { label: "Content similarity", value: 73 },
  { label: "Skill overlap", value: 85 },
];

// These three are three of the seven ATS checks the checker really runs.
const ATS_CHECKS = [
  { name: "Text extractability", detail: "Machine-readable text layer found", passed: true },
  { name: "Section headers", detail: "Standard headings detected", passed: true },
  { name: "Embedded images", detail: "Image-only content may be skipped", passed: false },
];

const MATCHED_SKILLS = ["Python", "PostgreSQL", "React", "Docker"];
const MISSING_SKILLS = ["Kubernetes"];

function MetricBar({ label, value }) {
  const band = getScoreBand(value);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-ink-soft">{label}</span>
        <span className="font-mono font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-border-soft overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: SCORE_COLORS[band].ring }}
        />
      </div>
    </div>
  );
}

function CheckRow({ check }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-px ${
          check.passed ? "bg-score-high-soft text-score-high" : "bg-score-mid-soft text-score-mid"
        }`}
      >
        {check.passed ? (
          <LuCircleCheck className="h-3 w-3" aria-hidden="true" />
        ) : (
          <LuCircleAlert className="h-3 w-3" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink">
          {check.name}
          <span className="sr-only"> — {check.passed ? "passed" : "needs attention"}</span>
        </p>
        <p className="text-[11px] text-ink-soft leading-relaxed">{check.detail}</p>
      </div>
    </li>
  );
}


/**
 * Product visual for the hero: a static illustration of the real report
 * shape (ATS checks + composite match + matched/missing skills), labelled as
 * an example rather than live data.
 */
function HeroReport() {
  return (
    <Reveal delay={0.15} y={20} className="relative">
      <div className="rounded-2xl border border-border bg-surface shadow-pop overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft bg-canvas/60 px-5 py-3">
          <span className="flex items-center gap-2 min-w-0 text-xs font-medium text-ink">
            <LuFileText className="h-3.5 w-3.5 text-ink-soft shrink-0" aria-hidden="true" />
            <span className="truncate">frontend_engineer_resume.pdf</span>
          </span>
          <Badge className="shrink-0">Example output</Badge>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <ScoreRing score={84} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">ATS parseability</p>
              <p className="text-xs text-ink-soft leading-relaxed mt-0.5">
                Seven weighted checks, scored separately from content quality.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 rounded-lg border border-border-soft bg-canvas/40 p-3.5">
            {ATS_CHECKS.map((check) => (
              <CheckRow key={check.name} check={check} />
            ))}
          </ul>

          <div className="border-t border-border-soft pt-4 grid grid-cols-[auto_1fr] gap-5 items-center">
            <ScoreRing score={78.4} size="lg" />
            <div className="space-y-3 min-w-0">
              <p className="text-sm font-semibold text-ink">
                Composite match
                <span className="text-ink-soft font-normal"> · Backend Engineer</span>
              </p>
              {MATCH_METRICS.map((metric) => (
                <MetricBar key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <div className="border-t border-border-soft pt-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Matched skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MATCHED_SKILLS.map((skill) => (
                  <Badge key={skill} tone="accent">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Missing skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MISSING_SKILLS.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documented behaviour from the skills dataset, not a decorative badge. */}
      <div className="hidden lg:flex absolute -bottom-6 -right-6 items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-raised">
        <span className="h-7 w-7 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center shrink-0">
          <LuSparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-ink">Alias normalisation</p>
          <p className="text-[11px] font-mono text-ink-soft">&quot;ReactJS&quot; → React</p>
        </div>
      </div>
    </Reveal>
  );
}

export default function LandingHero() {
  return (
    <section className="border-b border-border-soft">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-soft shadow-xs">
                <LuSparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Explainable resume screening
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display font-bold tracking-tight text-ink text-[2.15rem] leading-[1.12] sm:text-[2.9rem] sm:leading-[1.08] lg:text-[3.15rem]">
                Screen resumes and rank candidates —
                <span className="text-accent"> with every score explained.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-5 text-base sm:text-[1.0625rem] text-ink-soft leading-relaxed max-w-xl">
                HireSense parses PDF and DOCX resumes, scores how well an ATS can read them across
                seven weighted checks, then ranks every candidate against your job description using
                TF-IDF content similarity and exact skill overlap — with the matched and missing
                skills behind each number.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button to="/register" size="lg" iconRight={LuArrowRight}>
                  Create free account
                </Button>
                <Button to="/login" variant="secondary" size="lg">
                  Sign in
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                {META.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <LuCheck className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <HeroReport />
        </div>
      </div>
    </section>
  );
}
