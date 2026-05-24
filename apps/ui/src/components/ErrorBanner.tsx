/**
 * Styled error banner for inline form/dialog error display.
 *
 * Renders nothing when `message` is falsy.
 */
export function ErrorBanner({
  message,
}: {
  message: string | null | undefined;
}) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {message}
    </div>
  );
}
