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
    <div className="flex w-fit h-fit items-center gap-10 p-8 rounded-4xl bg-white/12 backdrop-blur-md border border-white/15 border-t-white/25 border-b-white/5 shadow-2xl transition-all duration-300 hover:border-white/30">
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
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5 group-hover:ring-white/20" />
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
              className="text-[10px] font-bold text-white/45 uppercase tracking-[0.3em] ml-1"
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
              className="rounded-2xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/30"
              placeholder="name@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] font-bold text-white/45 uppercase tracking-[0.3em] ml-1"
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
              className="rounded-2xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/30"
            />
          </div>

          {error ? (
            <div
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-4 w-full rounded-full border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
