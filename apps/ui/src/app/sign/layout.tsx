export default function SignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 py-6">
      <div className="flex min-h-full justify-center items-start py-6 md:items-center">
        <div className="flex w-full max-w-xl flex-row items-center gap-6 rounded-2xl border border-white/10 bg-gray-900/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-pink-500/30 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
