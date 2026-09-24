import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuUser, LuBriefcase } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "../../context/AppDataContext";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { candidates, jobDescriptions } = useAppData();

  // "/" focuses search from anywhere, unless typing in a field already
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { candidates: [], jobs: [] };
    const q = query.toLowerCase();
    return {
      candidates: candidates
        .filter((c) => c.full_name?.toLowerCase().includes(q) || c.filename?.toLowerCase().includes(q))
        .slice(0, 4),
      jobs: jobDescriptions.filter((j) => j.title.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query, candidates, jobDescriptions]);

  // One flat list so arrow keys can walk candidates and jobs in render order.
  const options = useMemo(
    () => [
      ...results.candidates.map((c) => ({
        key: `candidate-${c.id}`,
        path: `/candidates/${c.id}`,
        label: c.full_name || c.filename,
        group: "Candidates",
      })),
      ...results.jobs.map((j) => ({
        key: `job-${j.id}`,
        path: `/jobs/${j.id}`,
        label: j.title,
        group: "Job descriptions",
      })),
    ],
    [results]
  );

  const hasResults = options.length > 0;
  const showPanel = open && query.trim().length > 0;

  // A new search starts from the top of the list again.
  useEffect(() => setActiveIndex(0), [query]);

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && options[activeIndex]) {
      e.preventDefault();
      goTo(options[activeIndex].path);
    }
  };

  const activeOptionId = showPanel && options[activeIndex] ? `global-search-${options[activeIndex].key}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <LuSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-label="Search candidates and job descriptions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search candidates, jobs..."
        className="w-56 sm:w-72 pl-9 pr-12 py-2 text-sm rounded-lg border border-border bg-canvas
          text-ink placeholder:text-ink-soft/70 shadow-xs outline-none transition-colors
          focus:bg-surface focus:border-accent"
      />
      <kbd className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center justify-center h-5 min-w-5 px-1 rounded border border-border text-[10px] font-mono text-ink-soft bg-surface">
        /
      </kbd>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id="global-search-results"
            role="listbox"
            aria-label="Search results"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-pop overflow-hidden z-30"
          >
            {!hasResults ? (
              <p className="text-sm text-ink-soft text-center py-6">
                No matches for &quot;{query}&quot;
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto py-1.5">
                {results.candidates.length > 0 && (
                  <div className="px-2">
                    <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-wide px-2 py-1.5">
                      Candidates
                    </p>
                    {results.candidates.map((c, i) => {
                      const active = activeIndex === i;
                      return (
                        <button
                          key={c.id}
                          id={`global-search-candidate-${c.id}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => goTo(`/candidates/${c.id}`)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                            active ? "bg-accent-soft" : "hover:bg-canvas"
                          }`}
                        >
                          <LuUser
                            className={`h-3.5 w-3.5 shrink-0 ${active ? "text-accent-ink" : "text-ink-soft"}`}
                            aria-hidden="true"
                          />
                          <span className={`text-sm truncate ${active ? "text-accent-ink" : "text-ink"}`}>
                            {c.full_name || c.filename}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {results.jobs.length > 0 && (
                  <div className="px-2">
                    <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-wide px-2 py-1.5">
                      Job descriptions
                    </p>
                    {results.jobs.map((j, jIdx) => {
                      const i = results.candidates.length + jIdx;
                      const active = activeIndex === i;
                      return (
                        <button
                          key={j.id}
                          id={`global-search-job-${j.id}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => goTo(`/jobs/${j.id}`)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                            active ? "bg-accent-soft" : "hover:bg-canvas"
                          }`}
                        >
                          <LuBriefcase
                            className={`h-3.5 w-3.5 shrink-0 ${active ? "text-accent-ink" : "text-ink-soft"}`}
                            aria-hidden="true"
                          />
                          <span className={`text-sm truncate ${active ? "text-accent-ink" : "text-ink"}`}>
                            {j.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="sr-only" aria-live="polite">
                  {options.length} result{options.length === 1 ? "" : "s"}. Use the arrow keys to
                  choose, then press Enter.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
