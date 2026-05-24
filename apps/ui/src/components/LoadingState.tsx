/**
 * Centered loading placeholder for modals and data panels.
 */
export function LoadingState({
  message = 'Cargando...',
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-sm text-white/60">
      {message}
    </div>
  );
}
