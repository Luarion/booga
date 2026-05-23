'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
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
  const [step, setStep] = useState(1);

  function handleInputChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Use native HTML validation for required fields. Password equality is
  // checked using the Constraint Validation API at submit time.

  function handleNextStep() {
    const form = document.getElementById(
      'signup-form',
    ) as HTMLFormElement | null;
    if (!form) {
      setStep(2);
      return;
    }

    const nameEl = form.querySelector('#name') as HTMLInputElement | null;
    const usernameEl = form.querySelector(
      '#username',
    ) as HTMLInputElement | null;
    const emailEl = form.querySelector('#email') as HTMLInputElement | null;

    if (nameEl && usernameEl && emailEl) {
      if (
        nameEl.checkValidity() &&
        usernameEl.checkValidity() &&
        emailEl.checkValidity()
      ) {
        setStep(2);
      } else {
        // Show native validation messages in order
        if (!nameEl.checkValidity()) nameEl.reportValidity();
        else if (!usernameEl.checkValidity()) usernameEl.reportValidity();
        else emailEl.reportValidity();
      }
    } else {
      setStep(2);
    }
  }

  function handlePreviousStep() {
    setStep(1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget as HTMLFormElement;
    // Let browser run its native validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setLoading(true);

    // Additional check: password equality
    if (formData.password !== formData.passwordConfirm) {
      const passwordConfirmEl = form.querySelector(
        '#passwordConfirm',
      ) as HTMLInputElement | null;
      if (passwordConfirmEl) {
        passwordConfirmEl.setCustomValidity('Las contraseñas no coinciden');
        passwordConfirmEl.reportValidity();
        passwordConfirmEl.setCustomValidity('');
      } else {
        window.alert('Las contraseñas no coinciden');
      }
      setLoading(false);
      return;
    }

    try {
      const { status, error } = await api.api.sign.up.post({
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        username: formData.username,
        name: formData.name,
        password: formData.password,
      });

      if (status === 201) {
        router.push('/');
        return;
      }

      const errorMsg =
        typeof error?.value === 'string' ? error.value : 'Error al registrarse';
      window.alert(errorMsg);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al registrarse';
      // Use native alert for server errors to avoid custom error blocks
      window.alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'rounded-2xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/30';
  const labelClass =
    'ml-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45';

  return (
    <div className="flex w-fit h-fit flex-col gap-6 rounded-4xl border border-white/15 border-t-white/25 border-b-white/5 bg-white/12 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/30 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crear Cuenta
          </h1>
          <p className="text-sm text-white/50">Regístrate para empezar</p>
        </div>
        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
          Paso {step} de 2
        </div>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/60 transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      <form
        id="signup-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        {step === 1 ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className={inputClass}
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className={labelClass}>
                Usuario
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                minLength={3}
                className={inputClass}
                placeholder="juanperez"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className={inputClass}
                placeholder="juan@company.com"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="mt-2 w-full rounded-full border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              Continuar
            </button>

            <p className="text-center text-sm text-white/50">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/sign/in"
                className="text-white/80 transition hover:text-white"
              >
                Inicia sesión
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className={labelClass}>
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                className={inputClass}
                placeholder="+56912345678"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="passwordConfirm" className={labelClass}>
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
                required
                className={inputClass}
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:opacity-60"
                disabled={loading}
              >
                Volver
              </button>

              <button
                type="submit"
                className="w-full rounded-full border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>

            <p className="text-center text-sm text-white/50">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/sign/in"
                className="text-white/80 transition hover:text-white"
              >
                Inicia sesión
              </Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
