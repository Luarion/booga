'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import api from '@/lib/eden';

type FormData = {
  email: string;
  password: string;
};

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { status, error: apiError } = await api.api.sign.in.post({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (status === 200) {
        router.push('/');
        return;
      }

      setError(
        typeof apiError?.value === 'string'
          ? apiError.value
          : 'Credenciales invalidas',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-fit h-fit items-center gap-10 p-8 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-pink-500/30">
      <div className="relative group">
        <Image
          src="/wireless.svg"
          alt="QR Code"
          width={180}
          height={180}
          unoptimized
          className="rounded-lg shadow-inner brightness-90 group-hover:brightness-110 transition-all"
          loading="eager"
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 group-hover:ring-pink-400/20" />
      </div>

      <div className="flex flex-col w-64">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-6">
          Sign In
        </h1>
        <form
          id="signin-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                handleInputChange('email', event.target.value)
              }
              disabled={loading}
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
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) =>
                handleInputChange('password', event.target.value)
              }
              disabled={loading}
              className="bg-gray-950/50 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-600/50 focus:border-pink-500 transition-all"
            />
          </div>

          {error ? (
            <p className="text-sm text-pink-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-4 w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-pink-900/20 active:scale-[0.98] transition-all disabled:bg-pink-600/50"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
