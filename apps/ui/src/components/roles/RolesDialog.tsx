'use client';

import { useState } from 'react';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingState } from '@/components/LoadingState';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalOverlay } from '@/components/ModalOverlay';
import type { RoleRow, Row, UserRow } from '@/types';
import { toUserRow } from '@/components/users/UsersTable';

export function RolesDialog({
  mounted,
  open,
  roles,
  loading,
  error,
  onClose,
  selectedRole,
  onSelectRole,
  roleUsers,
  roleUsersLoading,
  onCreateRole,
  onDeleteRole,
  allUsers,
  onToggleUserRole,
}: {
  mounted: boolean;
  open: boolean;
  roles: RoleRow[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  selectedRole: RoleRow | null;
  onSelectRole: (role: RoleRow | null) => void;
  roleUsers: UserRow[];
  roleUsersLoading: boolean;
  onCreateRole: (name: string) => Promise<void>;
  onDeleteRole: (roleId: number) => Promise<void>;
  allUsers: Row[];
  onToggleUserRole: (userId: number, currentlyAssigned: boolean) => void;
}) {
  const [newRoleName, setNewRoleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setIsCreating(true);
    await onCreateRole(newRoleName);
    setNewRoleName('');
    setIsCreating(false);
  };

  const assignedUserIds = new Set(roleUsers.map((u) => u.id));

  return (
    <ModalOverlay mounted={mounted} open={open} onClose={onClose} width="900px">
      <ModalHeader subtitle="Gestión" title="Roles del Sistema" onClose={onClose} />

      <div className="mt-5 flex h-[500px] gap-6 overflow-hidden">
        {/* Left Side: Roles List */}
        <div className="flex w-1/3 flex-col gap-4 border-r border-white/10 pr-6">
          <form onSubmit={handleCreateSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Nuevo rol..."
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newRoleName.trim()}
              className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-200 transition-colors hover:bg-purple-500/30 disabled:opacity-50"
            >
              Crear
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <LoadingState message="Cargando roles..." />
            ) : error ? (
              <ErrorBanner message={error} />
            ) : roles.length === 0 ? (
              <div className="mt-4 text-center text-sm text-white/40 italic">
                No hay roles.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {roles.map((role) => (
                  <li
                    key={role.id}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      selectedRole?.id === role.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => onSelectRole(role)}
                  >
                    <span className="text-sm font-medium text-white/90">
                      {role.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRole(role.id);
                      }}
                      className="rounded-md p-1.5 text-red-400 opacity-0 transition-opacity hover:bg-red-500/20 group-hover:opacity-100"
                    >
                      <svg
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: Users Assignment */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!selectedRole ? (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              Selecciona un rol para asignar usuarios
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Usuarios con rol:{' '}
                  <span className="font-bold text-purple-300">
                    {selectedRole.name}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => onSelectRole(null)}
                  className="text-xs text-white/40 hover:text-white/80"
                >
                  Cerrar panel
                </button>
              </div>

              <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-2">
                {roleUsersLoading ? (
                  <LoadingState message="Cargando asignaciones..." />
                ) : allUsers.length === 0 ? (
                  <div className="mt-8 text-center text-sm text-white/40">
                    No hay usuarios en el sistema.
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {allUsers.map((rawUser) => {
                      const user = toUserRow(rawUser);
                      const isAssigned = assignedUserIds.has(user.id);

                      return (
                        <li
                          key={user.id}
                          className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white/90">
                              {user.name || user.username || `User ${user.id}`}
                            </span>
                            <span className="text-xs text-white/40">
                              {user.email || 'Sin email'}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => onToggleUserRole(user.id, isAssigned)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
                              isAssigned ? 'bg-purple-500' : 'bg-white/20'
                            }`}
                          >
                            <span className="sr-only">Toggle role assignment</span>
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isAssigned ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
