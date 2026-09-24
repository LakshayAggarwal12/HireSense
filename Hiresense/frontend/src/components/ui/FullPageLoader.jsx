export default function FullPageLoader({ label = "Loading" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <p className="text-xs text-ink-soft" role="status">
          {label}…
        </p>
      </div>
    </div>
  );
}
