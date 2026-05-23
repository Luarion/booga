'use client';

import Image from 'next/image';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import MusicPlayer from '@/components/MusicPlayer';
import api from '@/lib/eden';
import { redirectToSignInIfUnauthorized } from '@/lib/redirectToSignIn';

type DatasetKey = 'microcontrollers' | 'sensors' | 'actuators';
type Row = Record<string, unknown>;
type UserFormData = {
  email: string;
  username: string;
  password: string;
  name: string;
  phone: string;
};
type UserRow = {
  id: number;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  phone?: string | null;
};

const datasetConfig: Record<DatasetKey, { label: string; icon: string }> = {
  microcontrollers: {
    label: 'Microcontrollers',
    icon: '/wireless.svg',
  },
  sensors: {
    label: 'Sensores',
    icon: '/settings.svg',
  },
  actuators: {
    label: 'Actuators',
    icon: '/odometer.svg',
  },
};

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

const DatasetIconButton = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={`relative size-17 shrink-0 overflow-hidden rounded-2xl border transition-all animate-pop-in ${
      active
        ? 'border-white/45 bg-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
        : 'border-white/15 bg-white/20 hover:border-white/30 hover:bg-white/30'
    }`}
  >
    <Image src={icon} alt="" fill sizes="68px" className="p-2.5 opacity-90" />
  </button>
);

const QuickLink = ({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) => (
  <a
    href={href}
    className="relative shrink-0 size-17 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-md shadow-2xl animate-pop-in"
  >
    <Image src={src} alt={alt} fill sizes="68px" className="p-2.5" />
  </a>
);

function UserField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: keyof UserFormData;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
        {label}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/30"
      />
    </label>
  );
}

function UsersTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
}) {
  const columns = ['id', 'name', 'username', 'email', 'phone', 'timestamp'];

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-8 text-sm text-white/55">
        No hay usuarios para mostrar.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-hidden overflow-x-auto rounded-2xl border border-white/10 bg-black/10 sm:block">
        <table className="min-w-full overflow-hidden rounded-2xl border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 rounded-t-2xl bg-black/30 backdrop-blur-md">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60 first:rounded-tl-2xl last:rounded-tr-2xl"
                >
                  {titleCase(column)}
                </th>
              ))}
              <th className="whitespace-nowrap border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id ? String(row.id) : `${rowIndex}`}
                className="odd:bg-white/5"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="border-b border-white/5 px-4 py-3 align-top text-white/85"
                  >
                    <span className="block max-w-[16rem] truncate">
                      {formatValue(row[column])}
                    </span>
                  </td>
                ))}
                <td className="border-b border-white/5 px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(toUserRow(row))}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(toUserRow(row))}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 transition-colors hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={row.id ? String(row.id) : `${rowIndex}`}
            className="rounded-2xl border border-white/10 bg-black/10 p-4"
          >
            {columns.map((column) => (
              <div
                key={column}
                className="flex items-start justify-between gap-3 py-1"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                  {titleCase(column)}
                </span>
                <span className="text-right text-sm text-white/85 break-all">
                  {formatValue(row[column])}
                </span>
              </div>
            ))}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(toUserRow(row))}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(toUserRow(row))}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 transition-colors hover:bg-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersRailButton({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Usuarios"
      aria-pressed={active}
      title="Usuarios"
      className={`relative size-17 shrink-0 overflow-hidden rounded-2xl border transition-all animate-pop-in delay-300 ${
        active
          ? 'border-white/45 bg-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
          : 'border-white/15 bg-white/20 hover:border-white/30 hover:bg-white/30'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 m-auto size-10 text-white/90"
      >
        <path
          d="M12 12.75a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M4.5 19.5c0-3.5 3.38-6 7.5-6s7.5 2.5 7.5 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function UsersDialog({
  mounted,
  open,
  users,
  loading,
  error,
  onClose,
  onCreate,
  onEdit,
  onDelete,
}: {
  mounted: boolean;
  open: boolean;
  users: Row[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: () => void;
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
}) {
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
        open ? 'bg-slate-950/45 opacity-100' : 'bg-slate-950/0 opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar usuarios"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default bg-transparent"
      />
      <Something
        className={`relative z-10 w-[min(92vw,1100px)] max-h-[86vh] flex-col items-stretch rounded-4xl p-6 transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
              Usuarios
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Tabla de usuarios
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onCreate}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              Crear usuario nuevo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              X
            </button>
          </div>
        </div>

        <div className="mt-5 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-sm text-white/60">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100">
              {error}
            </div>
          ) : (
            <UsersTable rows={users} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>

        <div className="mt-3 text-xs text-white/45">
          {users.length} usuario{users.length === 1 ? '' : 's'} cargado
          {users.length === 1 ? '' : 's'}
        </div>
      </Something>
    </div>
  );
}

function UserFormModal({
  mounted,
  open,
  submitting,
  error,
  formData,
  onChange,
  onClose,
  onSubmit,
}: {
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
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
        open ? 'bg-slate-950/45 opacity-100' : 'bg-slate-950/0 opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default bg-transparent"
      />
      <Something
        className={`relative z-10 w-[min(92vw,560px)] max-h-[86vh] flex-col items-stretch rounded-4xl p-6 transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
              Usuarios
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Crear usuario nuevo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            X
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-5" onSubmit={onSubmit}>
          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <UserField
              id="name"
              label="Nombre"
              type="text"
              value={formData.name}
              onChange={(value) => onChange('name', value)}
              placeholder="Nombre completo"
              autoComplete="name"
            />
            <UserField
              id="username"
              label="Usuario"
              type="text"
              value={formData.username}
              onChange={(value) => onChange('username', value)}
              placeholder="nombredeusuario"
              autoComplete="username"
            />
            <UserField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => onChange('email', value)}
              placeholder="usuario@correo.com"
              autoComplete="email"
            />
            <UserField
              id="phone"
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(value) => onChange('phone', value)}
              placeholder="+34 600 000 000"
              autoComplete="tel"
            />
            <div className="sm:col-span-2">
              <UserField
                id="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(value) => onChange('password', value)}
                placeholder="Introduce una contraseña"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Something>
    </div>
  );
}

function EditUserModal({
  mounted,
  open,
  submitting,
  error,
  formData,
  onChange,
  onClose,
  onSubmit,
}: {
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
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
        open ? 'bg-slate-950/45 opacity-100' : 'bg-slate-950/0 opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar edición"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default bg-transparent"
      />
      <Something
        className={`relative z-10 w-[min(92vw,560px)] max-h-[86vh] flex-col items-stretch rounded-4xl p-6 transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
              Usuarios
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Editar usuario
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            X
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-5" onSubmit={onSubmit}>
          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <UserField
              id="name"
              label="Nombre"
              type="text"
              value={formData.name}
              onChange={(value) => onChange('name', value)}
              placeholder="Nombre completo"
              autoComplete="name"
            />
            <UserField
              id="username"
              label="Usuario"
              type="text"
              value={formData.username}
              onChange={(value) => onChange('username', value)}
              placeholder="nombredeusuario"
              autoComplete="username"
            />
            <UserField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => onChange('email', value)}
              placeholder="usuario@correo.com"
              autoComplete="email"
            />
            <UserField
              id="phone"
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(value) => onChange('phone', value)}
              placeholder="+34 600 000 000"
              autoComplete="tel"
            />
            <div className="sm:col-span-2">
              <UserField
                id="password"
                label="Nueva contraseña (opcional)"
                type="password"
                value={formData.password}
                onChange={(value) => onChange('password', value)}
                placeholder="Deja en blanco para mantenerla"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Something>
    </div>
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}

function toUserRow(row: Row): UserRow {
  const id = Number(row.id);
  return {
    id: Number.isFinite(id) ? id : 0,
    email: typeof row.email === 'string' ? row.email : null,
    username: typeof row.username === 'string' ? row.username : null,
    name: typeof row.name === 'string' ? row.name : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
  };
}

function titleCase(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function loadDataset(key: DatasetKey) {
  switch (key) {
    case 'microcontrollers': {
      const { data, error, status } = await api.api.microcontrollers.get();
      if (redirectToSignInIfUnauthorized(status)) return [] as Row[];
      if (error)
        throw new Error(
          typeof error.value === 'string'
            ? error.value
            : 'No se pudo cargar microcontrollers',
        );
      return (data ?? []) as Row[];
    }
    case 'sensors': {
      const { data, error, status } = await api.api.sensors.get();
      if (redirectToSignInIfUnauthorized(status)) return [] as Row[];
      if (error)
        throw new Error(
          typeof error.value === 'string'
            ? error.value
            : 'No se pudo cargar sensores',
        );
      return (data ?? []) as Row[];
    }
    case 'actuators': {
      const { data, error, status } = await api.api.actuators.get();
      if (redirectToSignInIfUnauthorized(status)) return [] as Row[];
      if (error)
        throw new Error(
          typeof error.value === 'string'
            ? error.value
            : 'No se pudo cargar actuators',
        );
      return (data ?? []) as Row[];
    }
    default:
      return [];
  }
}

function DataTable({ rows }: { rows: Row[] }) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) keys.add(key);
    }
    return Array.from(keys);
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-8 text-sm text-white/55">
        No hay registros para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-black/10">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-black/30 backdrop-blur-md">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60"
              >
                {titleCase(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id ? String(row.id) : `${rowIndex}`}
              className="odd:bg-white/5"
            >
              {columns.map((column) => (
                <td
                  key={column}
                  className="border-b border-white/5 px-4 py-3 align-top text-white/85"
                >
                  <span className="block max-w-[18rem] truncate">
                    {formatValue(row[column])}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const [users, setUsers] = useState<Row[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [mountedUsersDialog, setMountedUsersDialog] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const usersDialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [mountedUserForm, setMountedUserForm] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    username: '',
    password: '',
    name: '',
    phone: '',
  });
  const [mountedEditUserForm, setMountedEditUserForm] = useState(false);
  const [isEditUserFormOpen, setIsEditUserFormOpen] = useState(false);
  const [editUserFormSubmitting, setEditUserFormSubmitting] = useState(false);
  const [editUserFormError, setEditUserFormError] = useState<string | null>(
    null,
  );
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserFormData, setEditUserFormData] = useState<UserFormData>({
    email: '',
    username: '',
    password: '',
    name: '',
    phone: '',
  });
  const [mountedDataset, setMountedDataset] = useState<DatasetKey | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recordsByDataset, setRecordsByDataset] = useState<
    Record<DatasetKey, Row[]>
  >({
    microcontrollers: [],
    sensors: [],
    actuators: [],
  });
  const [loadingByDataset, setLoadingByDataset] = useState<
    Record<DatasetKey, boolean>
  >({
    microcontrollers: false,
    sensors: false,
    actuators: false,
  });
  const [errorByDataset, setErrorByDataset] = useState<
    Record<DatasetKey, string | null>
  >({
    microcontrollers: null,
    sensors: null,
    actuators: null,
  });
  const userFormTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editUserFormTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUsersDialogTimer = useCallback(() => {
    if (usersDialogTimerRef.current) {
      clearTimeout(usersDialogTimerRef.current);
      usersDialogTimerRef.current = null;
    }
  }, []);

  const clearUserFormTimer = useCallback(() => {
    if (userFormTimerRef.current) {
      clearTimeout(userFormTimerRef.current);
      userFormTimerRef.current = null;
    }
  }, []);

  const clearEditUserFormTimer = useCallback(() => {
    if (editUserFormTimerRef.current) {
      clearTimeout(editUserFormTimerRef.current);
      editUserFormTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const { data, error, status } = await api.api.users.get();

      if (redirectToSignInIfUnauthorized(status)) return;

      if (error) {
        throw new Error(
          typeof error.value === 'string'
            ? error.value
            : 'No se pudo cargar usuarios',
        );
      }

      setUsers((data ?? []) as Row[]);
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : 'Error inesperado al cargar usuarios',
      );
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const openUserForm = useCallback(() => {
    clearUserFormTimer();
    setUserFormError(null);
    setMountedUserForm(true);
    setIsUserFormOpen(true);
  }, [clearUserFormTimer]);

  const closeUserForm = useCallback(() => {
    setIsUserFormOpen(false);
    clearUserFormTimer();
    userFormTimerRef.current = setTimeout(() => {
      setMountedUserForm(false);
      setUserFormError(null);
      userFormTimerRef.current = null;
    }, 260);
  }, [clearUserFormTimer]);

  const openEditUserForm = useCallback(
    (user: UserRow) => {
      clearEditUserFormTimer();
      setEditUserFormError(null);
      setEditUserId(user.id);
      setEditUserFormData({
        email: user.email ?? '',
        username: user.username ?? '',
        password: '',
        name: user.name ?? '',
        phone: user.phone ?? '',
      });
      setMountedEditUserForm(true);
      setIsEditUserFormOpen(true);
    },
    [clearEditUserFormTimer],
  );

  const closeEditUserForm = useCallback(() => {
    setIsEditUserFormOpen(false);
    clearEditUserFormTimer();
    editUserFormTimerRef.current = setTimeout(() => {
      setMountedEditUserForm(false);
      setEditUserFormError(null);
      setEditUserId(null);
      editUserFormTimerRef.current = null;
    }, 260);
  }, [clearEditUserFormTimer]);

  const openUsersDialog = useCallback(() => {
    clearUsersDialogTimer();
    setMountedUsersDialog(true);
    setIsUsersDialogOpen(true);
    void loadUsers();
  }, [clearUsersDialogTimer, loadUsers]);

  const closeUsersDialog = useCallback(() => {
    setIsUsersDialogOpen(false);
    clearUsersDialogTimer();
    usersDialogTimerRef.current = setTimeout(() => {
      setMountedUsersDialog(false);
      usersDialogTimerRef.current = null;
    }, 260);
  }, [clearUsersDialogTimer]);

  const closeDataset = useCallback(() => {
    setIsDialogOpen(false);
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setMountedDataset(null);
      closeTimerRef.current = null;
    }, 260);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!mountedDataset) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDataset();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeDataset, mountedDataset]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!mountedUsersDialog) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeUsersDialog();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeUsersDialog, mountedUsersDialog]);

  useEffect(() => () => clearUsersDialogTimer(), [clearUsersDialogTimer]);

  useEffect(() => {
    if (!mountedUserForm) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeUserForm();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeUserForm, mountedUserForm]);

  useEffect(() => () => clearUserFormTimer(), [clearUserFormTimer]);

  useEffect(() => {
    if (!mountedEditUserForm) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeEditUserForm();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeEditUserForm, mountedEditUserForm]);

  useEffect(() => () => clearEditUserFormTimer(), [clearEditUserFormTimer]);

  function updateUserForm<K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K],
  ) {
    setUserFormData((current) => ({ ...current, [key]: value }));
    setUserFormError(null);
  }

  function updateEditUserForm<K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K],
  ) {
    setEditUserFormData((current) => ({ ...current, [key]: value }));
    setEditUserFormError(null);
  }

  function validateUserForm() {
    const name = userFormData.name.trim();
    const username = userFormData.username.trim();
    const email = userFormData.email.trim().toLowerCase();
    const phone = userFormData.phone.trim();
    const password = userFormData.password;

    if (!name || !username || !email || !phone || !password) {
      return 'Completa todos los campos antes de crear el usuario.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Introduce un email válido.';
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    return null;
  }

  function validateEditUserForm() {
    const name = editUserFormData.name.trim();
    const username = editUserFormData.username.trim();
    const email = editUserFormData.email.trim().toLowerCase();
    const phone = editUserFormData.phone.trim();
    const password = editUserFormData.password;

    if (!name || !username || !email || !phone) {
      return 'Completa todos los campos antes de guardar.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Introduce un email válido.';
    }

    if (password && password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    return null;
  }

  async function submitUserForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateUserForm();
    if (validationError) {
      setUserFormError(validationError);
      return;
    }

    setUserFormSubmitting(true);
    setUserFormError(null);

    const payload = {
      email: userFormData.email.trim().toLowerCase(),
      username: userFormData.username.trim(),
      password: userFormData.password,
      name: userFormData.name.trim(),
      phone: userFormData.phone.trim(),
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (redirectToSignInIfUnauthorized(res.status)) return;

      if (res.status === 201) {
        setUserFormData({
          email: '',
          username: '',
          password: '',
          name: '',
          phone: '',
        });
        closeUserForm();
        await loadUsers();
        return;
      }

      const body = await res.json().catch(() => null);
      setUserFormError(
        body && typeof body.error === 'string'
          ? body.error
          : 'No se pudo crear el usuario',
      );
    } catch {
      setUserFormError('Error de conexión al crear el usuario');
    } finally {
      setUserFormSubmitting(false);
    }
  }

  async function submitEditUserForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editUserId) {
      setEditUserFormError('No se pudo determinar el usuario a editar.');
      return;
    }

    const validationError = validateEditUserForm();
    if (validationError) {
      setEditUserFormError(validationError);
      return;
    }

    setEditUserFormSubmitting(true);
    setEditUserFormError(null);

    const payload: Partial<UserFormData> = {
      email: editUserFormData.email.trim().toLowerCase(),
      username: editUserFormData.username.trim(),
      name: editUserFormData.name.trim(),
      phone: editUserFormData.phone.trim(),
      password: editUserFormData.password,
    };

    if (!payload.password) {
      delete payload.password;
    }

    try {
      // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
      const { status, error } = await api.api.users[editUserId]!.put(payload);

      if (redirectToSignInIfUnauthorized(status)) return;

      if (status === 200) {
        closeEditUserForm();
        await loadUsers();
        return;
      }

      setEditUserFormError(
        typeof error?.value === 'string'
          ? error.value
          : 'No se pudo actualizar el usuario',
      );
    } catch (error) {
      setEditUserFormError(
        error instanceof Error
          ? error.message
          : 'Error de conexión al actualizar el usuario',
      );
    } finally {
      setEditUserFormSubmitting(false);
    }
  }

  async function deleteUser(row: UserRow) {
    if (!row.id) return;
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;

    try {
      // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
      const { status, error } = await api.api.users[row.id]!.delete();

      if (redirectToSignInIfUnauthorized(status)) return;

      if (status === 200) {
        await loadUsers();
        return;
      }

      setUsersError(
        typeof error?.value === 'string'
          ? error.value
          : 'No se pudo eliminar el usuario',
      );
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : 'Error de conexión al eliminar el usuario',
      );
    }
  }

  async function openDataset(key: DatasetKey) {
    clearCloseTimer();
    setMountedDataset(key);
    setIsDialogOpen(true);

    if (recordsByDataset[key].length > 0 || loadingByDataset[key]) return;

    setLoadingByDataset((current) => ({ ...current, [key]: true }));
    setErrorByDataset((current) => ({ ...current, [key]: null }));

    try {
      const rows = await loadDataset(key);
      setRecordsByDataset((current) => ({ ...current, [key]: rows }));
    } catch (error) {
      setErrorByDataset((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : 'Error inesperado',
      }));
    } finally {
      setLoadingByDataset((current) => ({ ...current, [key]: false }));
    }
  }

  const modalRows = mountedDataset ? recordsByDataset[mountedDataset] : [];
  const modalLoading = mountedDataset
    ? loadingByDataset[mountedDataset]
    : false;
  const modalError = mountedDataset ? errorByDataset[mountedDataset] : null;
  const hasDialog = mountedDataset !== null;
  const hasUsersDialog = mountedUsersDialog;
  const hasUserForm = mountedUserForm;
  const hasEditUserForm = mountedEditUserForm;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        className={
          isDialogOpen
            ? 'relative h-full w-full opacity-20 blur-sm transition duration-300 ease-out'
            : 'relative h-full w-full opacity-100 blur-0 transition duration-300 ease-out'
        }
      >
        {/* Up */}
        <div className="absolute left-1/2 top-0 flex w-1/2 max-w-1/2 -translate-x-1/2 flex-col items-center gap-3 animate-in-down delay-100">
          <Something className="w-fit rounded-b-2xl animate-pop-in delay-100">
            <QuickLink
              href="https://www.youtube.com"
              src="/maps.svg"
              alt="Maps"
            />
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
          </Something>
          <div className="animate-pop-in delay-200">
            <MusicPlayer />
          </div>
        </div>
        {/* Left */}
        <Something className="absolute left-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-r-2xl animate-in-left delay-300">
          <UsersRailButton
            active={isUsersDialogOpen}
            onClick={openUsersDialog}
          />
        </Something>
        {/* Right */}
        <Something className="absolute right-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-l-2xl animate-in-right delay-400">
          <DatasetIconButton
            label={datasetConfig.microcontrollers.label}
            icon={datasetConfig.microcontrollers.icon}
            active={mountedDataset === 'microcontrollers'}
            onClick={() => void openDataset('microcontrollers')}
          />
          <DatasetIconButton
            label={datasetConfig.sensors.label}
            icon={datasetConfig.sensors.icon}
            active={mountedDataset === 'sensors'}
            onClick={() => void openDataset('sensors')}
          />
          <DatasetIconButton
            label={datasetConfig.actuators.label}
            icon={datasetConfig.actuators.icon}
            active={mountedDataset === 'actuators'}
            onClick={() => void openDataset('actuators')}
          />
        </Something>
        {/* Bottom */}
        <Something className="absolute bottom-0 left-0 max-w-1/3 justify-start rounded-tr-2xl animate-in-up delay-200">
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
        </Something>
      </div>

      <UsersDialog
        mounted={hasUsersDialog}
        open={isUsersDialogOpen}
        users={users}
        loading={usersLoading}
        error={usersError}
        onClose={closeUsersDialog}
        onCreate={openUserForm}
        onEdit={openEditUserForm}
        onDelete={deleteUser}
      />

      <UserFormModal
        mounted={hasUserForm}
        open={isUserFormOpen}
        submitting={userFormSubmitting}
        error={userFormError}
        formData={userFormData}
        onChange={updateUserForm}
        onClose={closeUserForm}
        onSubmit={submitUserForm}
      />

      <EditUserModal
        mounted={hasEditUserForm}
        open={isEditUserFormOpen}
        submitting={editUserFormSubmitting}
        error={editUserFormError}
        formData={editUserFormData}
        onChange={updateEditUserForm}
        onClose={closeEditUserForm}
        onSubmit={submitEditUserForm}
      />

      {hasDialog ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
            isDialogOpen
              ? 'bg-slate-950/45 opacity-100'
              : 'bg-slate-950/0 opacity-0'
          }`}
        >
          <button
            type="button"
            aria-label="Cerrar diálogo"
            onClick={closeDataset}
            className="absolute inset-0 z-0 cursor-default bg-transparent"
          />
          <Something
            className={`relative z-10 w-[min(92vw,1100px)] max-h-[86vh] flex-col items-stretch rounded-4xl p-6 transition-all duration-300 ease-out ${
              isDialogOpen
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-4 scale-95 opacity-0'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {datasetConfig[mountedDataset].label}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDataset}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                X
              </button>
            </div>

            <div className="mt-5 flex-1 overflow-hidden">
              {modalLoading ? (
                <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-sm text-white/60">
                  Cargando registros...
                </div>
              ) : modalError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100">
                  {modalError}
                </div>
              ) : (
                <DataTable rows={modalRows} />
              )}
            </div>
          </Something>
        </div>
      ) : null}
    </div>
  );
}
