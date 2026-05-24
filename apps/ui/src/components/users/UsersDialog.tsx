'use client';

import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingState } from '@/components/LoadingState';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalOverlay } from '@/components/ModalOverlay';
import { UsersTable } from '@/components/users/UsersTable';
import type { Row, UserRow } from '@/types';

/**
 * Modal dialog showing the users table with create/edit/delete actions.
 */
export function UsersDialog({
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
  const createButton = (
    <button
      type="button"
      onClick={onCreate}
      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition-all duration-200 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-95"
    >
      Crear usuario nuevo
    </button>
  );

  return (
    <ModalOverlay
      mounted={mounted}
      open={open}
      onClose={onClose}
      width="1100px"
    >
      <ModalHeader
        subtitle="Usuarios"
        title="Tabla de usuarios"
        onClose={onClose}
        actions={createButton}
      />

      <div className="mt-5 flex-1 overflow-hidden">
        {loading ? (
          <LoadingState message="Cargando usuarios..." />
        ) : error ? (
          <ErrorBanner message={error} />
        ) : (
          <UsersTable rows={users} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>

      <div className="mt-3 text-xs text-white/45">
        {users.length} usuario{users.length === 1 ? '' : 's'} cargado
        {users.length === 1 ? '' : 's'}
      </div>
    </ModalOverlay>
  );
}
