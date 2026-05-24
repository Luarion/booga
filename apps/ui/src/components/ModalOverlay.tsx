import { GlassPanel } from './GlassPanel';

/**
 * Full-screen overlay for modal dialogs.
 *
 * Handles the backdrop, centering, mount/open animation states, and
 * click-outside-to-close. Wraps children in a `GlassPanel`.
 */
export function ModalOverlay({
  mounted,
  open,
  onClose,
  width = '1100px',
  children,
}: {
  mounted: boolean;
  open: boolean;
  onClose: () => void;
  /** Max width of the modal panel (CSS value). */
  width?: string;
  children: React.ReactNode;
}) {
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
        open ? 'bg-slate-950/45 opacity-100' : 'bg-slate-950/0 opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar diálogo"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default bg-transparent"
      />
      <GlassPanel
        className={`relative z-10 w-[min(92vw,${width})] max-h-[86vh] flex-col items-stretch rounded-4xl p-6 transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0'
        }`}
      >
        {children}
      </GlassPanel>
    </div>
  );
}
