import { LuArrowRight, LuBriefcase, LuTrophy, LuUpload } from "react-icons/lu";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    icon: LuUpload,
    title: "Upload resumes",
    body: "Drop in PDF or DOCX files. Each one is parsed into structured data — skills, contact details, education, experience — and scored for ATS parseability straight away.",
    facts: ["PDF · DOCX", "Up to 5MB each"],
    next: "Describe the role",
  },
  {
    icon: LuBriefcase,
    title: "Describe the role",
    body: "Paste the job description as plain text. HireSense extracts the required skills and infers the professional field the role belongs to.",
    facts: ["Skills auto-extracted", "Field auto-detected"],
    next: "Rank and compare",
  },
  {
    icon: LuTrophy,
    title: "Rank and compare",
    body: "Every candidate is scored against that role and returned highest match first. Expand a row for matched skills, missing skills and suggestions, or select up to three to compare side by side.",
    facts: ["Ranked highest match first", "Side-by-side comparison"],
    next: null,
  },
];

export default function LandingWorkflow() {
  return (
    <section id="how-it-works" className="border-b border-border-soft scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="From a folder of resumes to a ranked shortlist."
          body="No model training, no configuration files. The skills taxonomy seeds itself on first boot, so you can go from an empty account to a ranked shortlist in three steps."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body, facts, next }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="h-full flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card hover-lift">
                <div className="flex items-center justify-between gap-3">
                  <span className="h-9 w-9 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm font-semibold text-ink-soft/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-base text-ink mt-4">{title}</h3>
                <p className="text-xs text-ink-soft leading-relaxed mt-2 flex-1">{body}</p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {facts.map((fact) => (
                    <li
                      key={fact}
                      className="rounded-md border border-border-soft bg-canvas px-2 py-1 text-[11px] font-medium text-ink-soft"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>

                {next && (
                  <p className="mt-4 pt-4 border-t border-border-soft flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                    Next
                    <LuArrowRight className="h-3 w-3 text-accent" aria-hidden="true" />
                    <span className="text-ink">{next}</span>
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 text-xs text-ink-soft">
            Rankings are stored per candidate × role, so re-running them after adding a new resume is
            a single click — not a re-upload.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
