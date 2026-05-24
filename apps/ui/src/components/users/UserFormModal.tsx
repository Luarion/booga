'use client';

import type { FormEvent } from 'react';
import { ErrorBanner } from '@/components/ErrorBanner';
import { FormField } from '@/components/FormField';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalOverlay } from '@/components/ModalOverlay';
import type { UserFormData } from '@/types';

type UserFormMode = 'create' | 'edit';

const modeConfig: Record<
  UserFormMode,
  {
    title: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
  }
> = {
  create: {
    title: 'Crear usuario nuevo',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Introduce una contraseña',
    submitLabel: 'Crear usuario',
    submittingLabel: 'Creando...',
  },
  edit: {
    title: 'Editar usuario',
    passwordLabel: 'Nueva contraseña (opcional)',
    passwordPlaceholder: 'Deja en blanco para mantenerla',
    submitLabel: 'Guardar cambios',
    submittingLabel: 'Guardando...',
  },
};

/**
 * Unified modal for creating and editing users.
 *
 * The `mode` prop controls titles, labels, and password requirements.
 * This replaces the two nearly-identical `UserFormModal` and `EditUserModal`
 * components that previously existed.
 */
export function UserFormModal({
  mode,
  mounted,
  open,
  submitting,
  error,
  formData,
  onChange,
  onClose,
  onSubmit,
}: {
  mode: UserFormMode;
  mounted: boolean;
  open: boolean;
  submitting: boolean;
  error: string | null;
  formData: UserFormData;
  onChange: <K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const config = modeConfig[mode];

  return (
    <ModalOverlay mounted={mounted} open={open} onClose={onClose} width="560px">
      <ModalHeader subtitle="Usuarios" title={config.title} onClose={onClose} />

      <form className="mt-5 flex flex-col gap-5" onSubmit={onSubmit}>
        <ErrorBanner message={error} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="name"
            label="Nombre"
            type="text"
            value={formData.name}
            onChange={(value) => onChange('name', value)}
            placeholder="Nombre completo"
            autoComplete="name"
          />
          <FormField
            id="username"
            label="Usuario"
            type="text"
            value={formData.username}
            onChange={(value) => onChange('username', value)}
            placeholder="nombredeusuario"
            autoComplete="username"
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => onChange('email', value)}
            placeholder="usuario@correo.com"
            autoComplete="email"
          />
          <FormField
            id="phone"
            label="Teléfono"
            type="tel"
            value={formData.phone}
            onChange={(value) => onChange('phone', value)}
            placeholder="+34 600 000 000"
            autoComplete="tel"
          />
          <div className="sm:col-span-2">
            <FormField
              id="password"
              label={config.passwordLabel}
              type="password"
              value={formData.password}
              onChange={(value) => onChange('password', value)}
              placeholder={config.passwordPlaceholder}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-200 hover:shadow-lg active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-purple-500/50 bg-purple-500/20 px-5 py-2 text-sm font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-200 hover:bg-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? config.submittingLabel : config.submitLabel}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
