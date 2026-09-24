import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import IconButton from "./IconButton";

/**
 * Collapses the page list into "1 … 4 5 6 … 20" once there are enough pages
 * that rendering every number would wrap the row on mobile.
 */
function buildPageItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items = [];
  let previous = 0;
  for (const p of pages) {
    if (previous && p - previous > 1) items.push(`gap-${previous}`);
    items.push(p);
    previous = p;
  }
  return items;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-2">
      <IconButton
        icon={LuChevronLeft}
        label="Previous page"
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface"
      />

      {items.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={`h-8 min-w-8 px-2 rounded-lg text-xs font-medium font-mono transition-colors ${
              item === page
                ? "bg-accent text-white shadow-sm shadow-accent/25"
                : "text-ink-soft hover:bg-canvas hover:text-ink"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={item} aria-hidden="true" className="h-8 min-w-8 flex items-center justify-center text-xs text-ink-soft">
            …
          </span>
        )
      )}

      <IconButton
        icon={LuChevronRight}
        label="Next page"
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface"
      />
    </nav>
  );
}
