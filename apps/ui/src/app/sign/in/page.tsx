'use client';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="flex w-fit h-fit items-center gap-10 p-8 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-pink-500/30">
      <div className="relative group">
        <Image
          src="/download.png"
          alt="QR Code"
          width={180}
          height={180}
          className="rounded-lg shadow-inner brightness-90 group-hover:brightness-110 transition-all"
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 group-hover:ring-pink-400/20" />
      </div>

      <div className="flex flex-col w-64">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-6">
          Sign In
        </h1>
        <form action="" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="bg-gray-950/50 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-600/50 focus:border-pink-500 transition-all placeholder:text-gray-600"
              placeholder="name@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              className="bg-gray-950/50 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-600/50 focus:border-pink-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-pink-900/20 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
