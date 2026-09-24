import {
  LuArrowRight,
  LuCheck,
  LuDatabase,
  LuLayers,
  LuShieldCheck,
  LuSparkles,
} from "react-icons/lu";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const SIGNALS = [
  {
    icon: LuLayers,
    title: "Content similarity",
    detail: "TF-IDF vectors compared with cosine similarity across the whole document — so wording and context both count.",
  },
  {
    icon: LuSparkles,
    title: "Required-skill overlap",
    detail: "Exact matching of the role's extracted skills against the candidate's detected ones, with alias normalisation.",
  },
];

const PRINCIPLES = [
  "Every ranking result carries its matched skills, missing skills and per-candidate suggestions.",
  "ATS parseability and content quality are scored separately — a resume can be strong at one and weak at the other.",
  "No third-party AI API is called per resume: parsing, matching and scoring all run on your own backend.",
];

const DATASET_STATS = [
  { value: "88", label: "skills" },
  { value: "10", label: "categories" },
  { value: "8", label: "job fields" },
];

export default function LandingExplainability() {
  return (
    <section id="explainability" className="border-b border-border-soft scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeading
              eyebrow="Why it's different"
              title="Not a black box — a number you can argue with."
              body="A score is only useful if you can tell whether to trust it. HireSense keeps the whole path visible: what was read from the file, what matched, what didn't."
            />

            <ul className="mt-8 space-y-4">
              {PRINCIPLES.map((item, index) => (
                <Reveal key={item} delay={index * 0.05} as="li">
                  <div className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-accent-soft text-accent-ink flex items-center justify-center shrink-0 mt-0.5">
                      <LuCheck className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <p className="text-sm text-ink-soft leading-relaxed">{item}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-xl border border-border bg-surface shadow-raised p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold text-sm text-ink">Score anatomy</h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                  <LuShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Deterministic
                </span>
              </div>

              <ul className="mt-5 space-y-4">
                {SIGNALS.map(({ icon: Icon, title, detail }, index) => (
                  <li key={title}>
                    <div className="flex items-start gap-3">
                      <span className="h-8 w-8 rounded-lg bg-canvas border border-border flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          <span className="font-mono text-xs text-ink-soft mr-1.5">0{index + 1}</span>
                          {title}
                        </p>
                        <p className="text-xs text-ink-soft leading-relaxed mt-1">{detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent-soft/50 px-3.5 py-3">
                <LuArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-ink leading-relaxed">
                  Combined server-side into one weighted{" "}
                  <span className="font-semibold">composite match score</span>, persisted per
                  candidate × role and returned ranked highest match first.
                </p>
              </div>

              <div className="mt-5 pt-5 border-t border-border-soft">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  <LuDatabase className="h-3.5 w-3.5" aria-hidden="true" />
                  Backed by a queryable skills dataset
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {DATASET_STATS.map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-canvas border border-border-soft px-3 py-2.5">
                      <p className="font-display font-bold text-lg font-tabular text-ink leading-none">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-ink-soft mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft leading-relaxed mt-3">
                  Alias spellings are normalised to one canonical skill, so &quot;ReactJS&quot;,
                  &quot;React.js&quot; and &quot;React&quot; all count as the same match.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
