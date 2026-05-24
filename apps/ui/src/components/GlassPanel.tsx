/**
 * Frosted-glass container used throughout the dashboard.
 *
 * Provides a translucent white background with backdrop blur, subtle
 * border highlights, and an inner shadow for depth. Previously named
 * `Something` — renamed for clarity.
 */
export function GlassPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-25 min-w-25 bg-white/12 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/15 border-t-white/30 border-b-black/20 p-4 flex gap-3 items-center overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}
