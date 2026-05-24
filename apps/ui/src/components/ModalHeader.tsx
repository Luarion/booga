/**
 * Standard header for modal dialogs.
 *
 * Renders an optional subtitle, a title, and a close button.
 */
export function ModalHeader({
  subtitle,
  title,
  onClose,
  actions,
}: {
  subtitle?: string;
  title: string;
  onClose: () => void;
  /** Extra action buttons placed before the close button. */
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {subtitle && (
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
            {subtitle}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {actions}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:shadow-lg active:scale-90"
        >
          X
        </button>
      </div>
    </div>
  );
}
