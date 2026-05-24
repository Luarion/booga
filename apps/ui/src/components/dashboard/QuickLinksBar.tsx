import Image from 'next/image';

function QuickLink({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) {
  return (
    <a
      href={href}
      className="relative shrink-0 size-17 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-md shadow-2xl animate-pop-in"
    >
      <Image src={src} alt={alt} fill sizes="68px" className="p-2.5" />
    </a>
  );
}

/** Top bar of quick links. */
export function TopQuickLinks() {
  return (
    <>
      <QuickLink href="https://www.youtube.com" src="/maps.svg" alt="Maps" />
      <QuickLink
        href="https://www.youtube.com"
        src="/youtube.svg"
        alt="YouTube"
      />
      <QuickLink
        href="https://www.youtube.com"
        src="/discord.svg"
        alt="Discord"
      />
    </>
  );
}

/** Bottom bar of quick links. */
export function BottomQuickLinks() {
  return (
    <>
      <QuickLink
        href="https://www.youtube.com"
        src="/settings.svg"
        alt="Settings"
      />
      <QuickLink
        href="https://www.youtube.com"
        src="/wireless.svg"
        alt="Wireless"
      />
      <QuickLink
        href="https://www.youtube.com"
        src="/odometer.svg"
        alt="Odometer"
      />
    </>
  );
}
