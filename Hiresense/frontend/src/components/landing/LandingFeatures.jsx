import {
  LuBriefcase,
  LuCheck,
  LuFileText,
  LuListChecks,
  LuTrophy,
} from "react-icons/lu";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  {
    icon: LuFileText,
    title: "Resume parsing",
    body: "PDF and DOCX text extraction with layout analysis that flags multi-column layouts, embedded images and non-ASCII noise - the things that quietly break an ATS read.",
  },
  {
    icon: LuListChecks,
    title: "ATS parseability score",
    body: "Seven independent, weighted checks. Each one returns a reason and a concrete suggestion, so the number is something a candidate can actually act on.",
  },
  {
    icon: LuBriefcase,
    title: "Job description intelligence",
    body: "Paste a free-text job post. Required skills are extracted automatically and the role's professional field is inferred from weighted skill relevance.",
  },
  {
    icon: LuTrophy,
    title: "Candidate ranking",
    body: "A composite score from TF-IDF content similarity plus exact skill overlap, with matched skills, missing skills and per-candidate suggestions attached.",
  },
];

const ALSO_INCLUDED = [
  "ATS score distribution chart from real uploaded data",
  "Global search, with a \u201c/\u201d shortcut from anywhere",
  "Sortable, paginated candidate list",
  "Compare up to three candidates side by side",
  "Light, dark and system themes, with accent presets",
  "Live backend health indicator in the header",
];

export default function LandingFeatures() {
  return (
    <section id="features" className="border-b border-border-soft scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <SectionHeading
          eyebrow="What it does"
          title="Four pieces, one screening pipeline."
          body="HireSense covers the whole path from a raw resume file to a ranked shortlist - and keeps the reasoning for every score it produces."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className="h-full rounded-xl border border-border bg-surface p-5 shadow-card hover-lift">
                <span className="h-9 w-9 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                </span>
                <h3 className="font-display font-semibold text-sm text-ink mt-4">{title}</h3>
                <p className="text-xs text-ink-soft leading-relaxed mt-2">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-6 rounded-xl border border-border bg-surface/60 p-5 sm:p-6">
            <h3 className="font-display font-semibold text-sm text-ink">Also built in</h3>
            <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {ALSO_INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-ink-soft">
                  <LuCheck className="h-3.5 w-3.5 text-accent shrink-0 mt-px" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
