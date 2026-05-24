/**
 * Message shown when a table or list has no data.
 */
export function EmptyState({
  message = 'No hay registros para mostrar.',
}: {
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-8 text-sm text-white/55">
      {message}
    </div>
  );
}
