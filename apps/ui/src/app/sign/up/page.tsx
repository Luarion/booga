'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/eden';

type FormData = {
  email: string;
  phone: string;
  username: string;
  name: string;
  password: string;
  passwordConfirm: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    username: '',
    name: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function validateStepOne(): string | null {
    if (!formData.name.trim()) return 'Nombre es requerido';
    if (!formData.username.trim()) return 'Usuario es requerido';
    if (formData.username.length < 3)
      return 'Usuario debe tener al menos 3 caracteres';
    if (!formData.email.trim()) return 'Email es requerido';
    if (!formData.email.includes('@')) return 'Email inválido';
    return null;
  }

  function validateStepTwo(): string | null {
    if (!formData.phone.trim()) return 'Teléfono es requerido';
    if (!formData.password) return 'Contraseña es requerida';
    if (formData.password.length < 6)
      return 'Contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.passwordConfirm)
      return 'Las contraseñas no coinciden';
    return null;
  }

  function validateForm(): string | null {
    return validateStepOne() ?? validateStepTwo();
  }

  function handleNextStep() {
    const validationError = validateStepOne();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStep(2);
    setError(null);
  }

  function handlePreviousStep() {
    setStep(1);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.api.sign.up.post({
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        username: formData.username,
        name: formData.name,
        password: formData.password,
      });

      if (response.status === 201) {
        // Successful registration, redirect to login
        router.push('/sign/in?registered=true');
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-fit h-fit flex-col gap-6 rounded-2xl border border-white/10 bg-gray-900/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-pink-500/30 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crear Cuenta
          </h1>
          <p className="text-sm text-white/60">Regístrate para empezar</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
          Paso {step} de 2
        </div>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-pink-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {step === 1 ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                placeholder="juanperez"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                placeholder="juan@company.com"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="mt-2 w-full rounded-lg bg-pink-600 py-2.5 font-semibold text-white shadow-lg shadow-pink-900/20 transition-all active:scale-[0.98] hover:bg-pink-500 disabled:bg-pink-600/50"
              disabled={loading}
            >
              Continuar
            </button>

            <p className="text-center text-sm text-white/60">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/sign/in"
                className="text-pink-400 transition hover:text-pink-300"
              >
                Inicia sesión
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                style={{ color: '#ffffff' }}
                placeholder="+56912345678"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                style={{ color: '#ffffff' }}
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="passwordConfirm"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Confirmar Contraseña
              </label>
              <input
                id="passwordConfirm"
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  handleInputChange('passwordConfirm', e.target.value)
                }
                className="rounded-lg border border-gray-700 bg-gray-950/90 px-4 py-2.5 text-white font-medium outline-none transition-all placeholder:text-white/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-600/50"
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
                disabled={loading}
              >
                Volver
              </button>

              <button
                type="submit"
                className="w-full rounded-lg bg-pink-600 py-2.5 font-semibold text-white shadow-lg shadow-pink-900/20 transition-all active:scale-[0.98] hover:bg-pink-500 disabled:bg-pink-600/50"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>

            <p className="text-center text-sm text-white/60">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/sign/in"
                className="text-pink-400 transition hover:text-pink-300"
              >
                Inicia sesión
              </a>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
