import type { UserFormData } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/** Validate an email string. Returns an error message or `null`. */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es obligatorio.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Introduce un email válido.';
  return null;
}

/** Validate a password. Returns an error message or `null`. */
export function validatePassword(
  password: string,
  required: boolean,
): string | null {
  if (required && !password) return 'La contraseña es obligatoria.';
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

/**
 * Validate a user form for create or edit mode.
 *
 * In `create` mode the password is required.
 * In `edit` mode the password is optional (empty = keep current).
 *
 * Returns an error message or `null` when valid.
 */
export function validateUserForm(
  data: UserFormData,
  mode: 'create' | 'edit',
): string | null {
  const requiredFields = [data.name, data.username, data.email, data.phone];
  if (mode === 'create') requiredFields.push(data.password);

  if (requiredFields.some((field) => !field.trim())) {
    return mode === 'create'
      ? 'Completa todos los campos antes de crear el usuario.'
      : 'Completa todos los campos antes de guardar.';
  }

  const emailError = validateEmail(data.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(data.password, mode === 'create');
  if (passwordError) return passwordError;

  return null;
}
