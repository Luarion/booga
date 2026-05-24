'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { useAnimatedModal } from '@/hooks/useAnimatedModal';
import { createUser, deleteUserById, fetchUsers, updateUser } from '@/lib/api';
import { validateUserForm } from '@/lib/validation';
import type { Row, UserFormData, UserRow } from '@/types';

const EMPTY_FORM: UserFormData = {
  email: '',
  username: '',
  password: '',
  name: '',
  phone: '',
};

/**
 * Encapsulates all users-related state and CRUD operations.
 *
 * Returns:
 * - Data: users list, loading/error states
 * - Dialog state: users dialog, create form, edit form (via useAnimatedModal)
 * - Handlers: loadUsers, openCreate, openEdit, submitCreate, submitEdit, deleteUser
 */
export function useUsers() {
  const router = useRouter();

  /* ── Users list ──────────────────────────────────────────────────── */
  const [users, setUsers] = useState<Row[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  /* ── Users dialog ────────────────────────────────────────────────── */
  const usersDialog = useAnimatedModal();

  /* ── Create form ─────────────────────────────────────────────────── */
  const createModal = useAnimatedModal({
    onAfterClose: () => {
      setCreateError(null);
    },
  });
  const [createFormData, setCreateFormData] =
    useState<UserFormData>(EMPTY_FORM);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /* ── Edit form ───────────────────────────────────────────────────── */
  const editModal = useAnimatedModal({
    onAfterClose: () => {
      setEditError(null);
      setEditUserId(null);
    },
  });
  const [editFormData, setEditFormData] = useState<UserFormData>(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  /* ── Load users ──────────────────────────────────────────────────── */
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await fetchUsers(router);
      setUsers(data);
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : 'Error inesperado al cargar usuarios',
      );
    } finally {
      setUsersLoading(false);
    }
  }, [router]);

  /* ── Open users dialog ───────────────────────────────────────────── */
  const openUsersDialog = useCallback(() => {
    usersDialog.open();
    void loadUsers();
  }, [usersDialog, loadUsers]);

  /* ── Create flow ─────────────────────────────────────────────────── */
  function openCreateForm() {
    setCreateError(null);
    setCreateFormData(EMPTY_FORM);
    createModal.open();
  }

  function updateCreateForm<K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K],
  ) {
    setCreateFormData((current) => ({ ...current, [key]: value }));
    setCreateError(null);
  }

  async function submitCreateForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateUserForm(createFormData, 'create');
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      const result = await createUser(createFormData, router);
      if (result.ok) {
        setCreateFormData(EMPTY_FORM);
        createModal.close();
        await loadUsers();
      } else {
        setCreateError(result.error ?? 'No se pudo crear el usuario');
      }
    } catch {
      setCreateError('Error de conexión al crear el usuario');
    } finally {
      setCreateSubmitting(false);
    }
  }

  /* ── Edit flow ───────────────────────────────────────────────────── */
  function openEditForm(user: UserRow) {
    setEditError(null);
    setEditUserId(user.id);
    setEditFormData({
      email: user.email ?? '',
      username: user.username ?? '',
      password: '',
      name: user.name ?? '',
      phone: user.phone ?? '',
    });
    editModal.open();
  }

  function updateEditForm<K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K],
  ) {
    setEditFormData((current) => ({ ...current, [key]: value }));
    setEditError(null);
  }

  async function submitEditForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editUserId) {
      setEditError('No se pudo determinar el usuario a editar.');
      return;
    }

    const validationError = validateUserForm(editFormData, 'edit');
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditSubmitting(true);
    setEditError(null);

    try {
      const result = await updateUser(editUserId, editFormData, router);
      if (result.ok) {
        editModal.close();
        await loadUsers();
      } else {
        setEditError(result.error ?? 'No se pudo actualizar el usuario');
      }
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : 'Error de conexión al actualizar el usuario',
      );
    } finally {
      setEditSubmitting(false);
    }
  }

  /* ── Delete flow ─────────────────────────────────────────────────── */
  async function handleDeleteUser(user: UserRow) {
    if (!user.id) return;
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;

    try {
      const result = await deleteUserById(user.id, router);
      if (result.ok) {
        await loadUsers();
      } else {
        setUsersError(result.error ?? 'No se pudo eliminar el usuario');
      }
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : 'Error de conexión al eliminar el usuario',
      );
    }
  }

  return {
    /* Users list */
    users,
    usersLoading,
    usersError,
    loadUsers,

    /* Users dialog */
    usersDialog,
    openUsersDialog,

    /* Create form */
    createModal,
    createFormData,
    createSubmitting,
    createError,
    openCreateForm,
    updateCreateForm,
    submitCreateForm,

    /* Edit form */
    editModal,
    editFormData,
    editSubmitting,
    editError,
    openEditForm,
    updateEditForm,
    submitEditForm,

    /* Delete */
    handleDeleteUser,
  } as const;
}
