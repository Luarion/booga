import Image from 'next/image';

export function RolesRailButton({
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
      aria-label="Manage roles"
      aria-pressed={active}
      title="Gestión de Roles"
      className={`relative size-17 shrink-0 overflow-hidden rounded-2xl border transition-all animate-pop-in ${
        active
          ? 'border-purple-400/45 bg-purple-500/30 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]'
          : 'border-white/15 bg-white/20 hover:border-purple-400/30 hover:bg-purple-500/30'
      }`}
    >
      <Image
        src="/settings.svg"
        alt="Gestión de roles"
        fill
        sizes="68px"
        className="p-3 opacity-90"
      />
    </button>
  );
}
