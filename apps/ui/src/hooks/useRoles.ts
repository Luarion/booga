import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useAnimatedModal } from '@/hooks/useAnimatedModal';
import {
  assignRoleToUser,
  createRole,
  deleteRole,
  fetchRoles,
  fetchUsersForRole,
  unassignRoleFromUser,
} from '@/lib/api';
import type { RoleRow, Row, UserRow } from '@/types';

export function useRoles(allUsers: Row[], reloadUsers: () => void) {
  const router = useRouter();

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [roleUsers, setRoleUsers] = useState<UserRow[]>([]);
  const [roleUsersLoading, setRoleUsersLoading] = useState(false);

  const rolesDialog = useAnimatedModal();

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const data = await fetchRoles(router);
      setRoles(data as RoleRow[]);
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRolesLoading(false);
    }
  }, [router]);

  const loadRoleUsers = useCallback(
    async (roleId: number) => {
      setRoleUsersLoading(true);
      try {
        const data = await fetchUsersForRole(roleId, router);
        setRoleUsers(data as UserRow[]);
      } catch (err) {
        console.error(err);
      } finally {
        setRoleUsersLoading(false);
      }
    },
    [router],
  );

  const openRolesDialog = useCallback(() => {
    rolesDialog.open();
    if (roles.length === 0) {
      void loadRoles();
    }
  }, [rolesDialog, loadRoles, roles.length]);

  const handleSelectRole = useCallback(
    (role: RoleRow | null) => {
      setSelectedRole(role);
      if (role) {
        void loadRoleUsers(role.id);
      } else {
        setRoleUsers([]);
      }
    },
    [loadRoleUsers],
  );

  const handleCreateRole = async (name: string) => {
    const { ok, error } = await createRole(name, router);
    if (ok) {
      void loadRoles();
    } else {
      alert(error || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return;
    const { ok, error } = await deleteRole(roleId, router);
    if (ok) {
      if (selectedRole?.id === roleId) setSelectedRole(null);
      void loadRoles();
      
      reloadUsers();
    } else {
      alert(error || 'Failed to delete role');
    }
  };

  const handleToggleUserRole = async (userId: number, assigned: boolean) => {
    if (!selectedRole) return;
    const { id: roleId } = selectedRole;

    
    if (assigned) {
      
      setRoleUsers((prev) => prev.filter((u) => u.id !== userId));
      await unassignRoleFromUser(roleId, userId, router);
    } else {
      
      const userObj = allUsers.find((u) => Number(u.id) === userId) as
        | UserRow
        | undefined;
      if (userObj) {
        setRoleUsers((prev) => [...prev, userObj]);
        await assignRoleToUser(roleId, userId, router);
      }
    }

    
    reloadUsers();
  };

  return {
    rolesDialog,
    openRolesDialog,
    roles,
    rolesLoading,
    rolesError,
    loadRoles,
    selectedRole,
    handleSelectRole,
    roleUsers,
    roleUsersLoading,
    handleCreateRole,
    handleDeleteRole,
    handleToggleUserRole,
  };
}
