import { LuArrowRight } from "react-icons/lu";
import Button from "../ui/Button";
import Reveal from "./Reveal";

export default function LandingCta() {
  return (
    <section className="border-b border-border-soft">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-raised">
            <div className="absolute inset-0 backdrop-dots opacity-50" aria-hidden="true" />
            <div className="relative px-6 py-12 sm:px-12 sm:py-14 text-center">
              <h2 className="font-display font-bold tracking-tight text-ink text-2xl sm:text-[2rem] leading-tight">
                Ready to screen your first batch?
              </h2>
              <p className="text-sm sm:text-base text-ink-soft leading-relaxed mt-3.5 max-w-xl mx-auto">
                Create an account, upload a resume and see the ATS breakdown and ranking for
                yourself. The skills dataset seeds itself on first boot — there is no setup step.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button to="/register" size="lg" iconRight={LuArrowRight} className="w-full sm:w-auto">
                  Create free account
                </Button>
                <Button to="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </div>

              <p className="mt-6 text-xs text-ink-soft">
                PDF and DOCX · up to 5MB per file · light, dark and system themes
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
