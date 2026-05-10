import Image from "next/image";

const Something = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`min-h-25 min-w-25 bg-white/12 backdrop-blur-md shadow-2xl border border-white/15 border-t-white/25 border-b-white/5 p-4 flex gap-3 items-center overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
  >
    {children}
  </div>
);
const Button = ({ url, src }: { url: string; src: string }) => (
  <a href={url} className="relative shrink-0 size-17 bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl">
    <Image src={src} alt="youtube" fill />
  </a>
);

export default function Page() {
  return (
    <div className="h-screen w-screen">
      {/* Up */}
      <div className="absolute w-1/2 max-w-1/2 top-0 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center">
        <Something className="w-fit rounded-b-2xl">
          <Button url="https://www.youtube.com" src="/maps.svg"></Button>
          <Button url="https://www.youtube.com" src="/youtube.svg"></Button>
          <Button url="https://www.youtube.com" src="/discord.svg"></Button>
        </Something>
        <Something className="h-12 w-1/2 rounded-2xl gap-3 p-2">
          <div className="size-8 shrink-0 rounded bg-white/10" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold truncate">Unknown Title</span>
            <span className="text-xs text-white/50 truncate">Unknown Artist</span>
          </div>
          <div className="flex-1 flex items-center gap-2 text-[10px] text-white/40">
            <span>0:00</span>
            <div className="h-1 flex-1 rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-white/60" />
            </div>
            <span>3:45</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" className="text-white/50 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.53v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" /></svg>
            </button>
            <button type="button" className="text-white hover:text-white/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
            </button>
            <button type="button" className="text-white/50 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v6.622c0 1.44 1.555 2.343 2.805 1.628L12 12.872v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 4.715 12 5.618 12 7.058v2.34L5.055 5.44Z" /></svg>
            </button>
          </div>
        </Something>
      </div>
      {/* Left */}
      <Something className="absolute w-25 left-0 top-1/2 -translate-y-1/2 max-h-1/2 rounded-r-2xl flex-col justify-start">
        <Button url="https://www.youtube.com" src="/settings.svg"></Button>
        <Button url="https://www.youtube.com" src="/wireless.svg"></Button>
        <Button url="https://www.youtube.com" src="/odometer.svg"></Button>
        <Button url="https://www.youtube.com" src="/settings.svg"></Button>
        <Button url="https://www.youtube.com" src="/wireless.svg"></Button>
      </Something>
      {/* Rigth */}
      <Something className="absolute w-25 right-0 top-1/2 -translate-y-1/2 max-h-[80%] rounded-l-2xl flex-col justify-start">
        <Button url="https://www.youtube.com" src="/settings.svg"></Button>
        <Button url="https://www.youtube.com" src="/wireless.svg"></Button>
      </Something>
      {/* Bottom */}
      <Something className="absolute h-25 bottom-0 left-0 max-w-1/3 rounded-tr-2xl justify-start">
        <Button url="https://www.youtube.com" src="/settings.svg"></Button>
        <Button url="https://www.youtube.com" src="/wireless.svg"></Button>
        <Button url="https://www.youtube.com" src="/odometer.svg"></Button>
      </Something>
    </div>
  );
}
