/**
 * Sidebar rail button to open the users dialog.
 */
export function UsersRailButton({
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
      aria-label="Usuarios"
      aria-pressed={active}
      title="Usuarios"
      className={`relative size-17 shrink-0 overflow-hidden rounded-2xl border transition-all animate-pop-in delay-300 ${
        active
          ? 'border-purple-400/45 bg-purple-500/30 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]'
          : 'border-white/15 bg-white/20 hover:border-purple-400/30 hover:bg-purple-500/30'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 m-auto size-10 text-white/90"
      >
        <path
          d="M12 12.75a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M4.5 19.5c0-3.5 3.38-6 7.5-6s7.5 2.5 7.5 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
