export function LedRailButton({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Control de LEDs"
      aria-pressed={active}
      title="Control de LEDs"
      className={`relative size-17 shrink-0 overflow-hidden rounded-2xl border transition-all animate-pop-in flex items-center justify-center ${
        active
          ? 'border-amber-400/45 bg-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]'
          : 'border-white/15 bg-white/20 hover:border-amber-400/30 hover:bg-amber-500/30'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`size-8 transition-all duration-300 ${
          active
            ? 'text-amber-400 scale-105 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
            : 'text-white/80 hover:text-white'
        }`}
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    </button>
  );
}
