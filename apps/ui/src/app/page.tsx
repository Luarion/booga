'use client';

import { useEffect, useState } from 'react';
import {
  DatasetRail,
  useDatasetDialog,
} from '@/components/dashboard/DatasetDialog';
import {
  BottomQuickLinks,
  TopQuickLinks,
} from '@/components/dashboard/QuickLinksBar';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { GlassPanel } from '@/components/GlassPanel';
import { LedControlPanel } from '@/components/leds/LedControlPanel';
import { LedRailButton } from '@/components/leds/LedRailButton';
import MusicPlayer from '@/components/MusicPlayer';
import { RolesDialog } from '@/components/roles/RolesDialog';
import { RolesRailButton } from '@/components/roles/RolesRailButton';
import { SensorChartDialog } from '@/components/SensorChartDialog';
import { UserFormModal } from '@/components/users/UserFormModal';
import { UsersDialog } from '@/components/users/UsersDialog';
import { UsersRailButton } from '@/components/users/UsersRailButton';
import { useAnimatedModal } from '@/hooks/useAnimatedModal';
import { useLedControl } from '@/hooks/useLedControl';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';

export default function Page() {
  const users = useUsers();
  const roles = useRoles(users.users, users.loadUsers);

  
  const ledModal = useAnimatedModal();
  const ledControl = useLedControl(ledModal.mounted);

  
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: number | null;
    alias: string;
    type: 'sensors' | 'actuators';
  }>({ id: null, alias: '', type: 'sensors' });

  const handleChartClick = (
    id: number,
    alias: string,
    type: 'sensors' | 'actuators',
  ) => {
    setSelectedDevice({ id, alias, type });
    setIsChartOpen(true);
  };

  
  const dataset = useDatasetDialog(handleChartClick);

  
  useEffect(() => {
    void users.loadUsers();
  }, [users.loadUsers]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        className={
          dataset.isOpen ||
          users.usersDialog.isOpen ||
          roles.rolesDialog.isOpen ||
          ledModal.isOpen
            ? 'relative h-full w-full opacity-20 blur-sm transition duration-300 ease-out'
            : 'relative h-full w-full opacity-100 blur-0 transition duration-300 ease-out'
        }
      >
        {}
        <div className="absolute left-1/2 top-0 flex w-1/2 max-w-1/2 -translate-x-1/2 flex-col items-center gap-3 animate-in-down delay-100">
          <GlassPanel className="w-fit rounded-b-2xl animate-pop-in delay-100">
            <TopQuickLinks />
          </GlassPanel>
          <div className="animate-pop-in delay-200">
            <MusicPlayer />
          </div>
        </div>

        {}
        <GlassPanel className="absolute right-0 top-0 max-w-1/3 justify-end rounded-bl-2xl animate-in-right delay-200">
          <SignOutButton />
        </GlassPanel>

        {}
        <GlassPanel className="absolute left-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-r-2xl gap-3 animate-in-left delay-300">
          <UsersRailButton
            active={users.usersDialog.isOpen}
            onClick={users.openUsersDialog}
          />
          <RolesRailButton
            active={roles.rolesDialog.isOpen}
            onClick={roles.openRolesDialog}
          />
          <LedRailButton active={ledModal.isOpen} onClick={ledModal.open} />
        </GlassPanel>

        {}
        <GlassPanel className="absolute right-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-l-2xl animate-in-right delay-400">
          <DatasetRail
            activeKey={dataset.activeKey}
            onSelect={(key) => void dataset.openDataset(key)}
          />
        </GlassPanel>

        {}
        <GlassPanel className="absolute bottom-0 left-0 max-w-1/3 justify-start rounded-tr-2xl animate-in-up delay-200">
          <BottomQuickLinks />
        </GlassPanel>
      </div>

      {}

      <UsersDialog
        mounted={users.usersDialog.mounted}
        open={users.usersDialog.isOpen}
        users={users.users}
        loading={users.usersLoading}
        error={users.usersError}
        onClose={users.usersDialog.close}
        onCreate={users.openCreateForm}
        onEdit={users.openEditForm}
        onDelete={users.handleDeleteUser}
      />

      <RolesDialog
        mounted={roles.rolesDialog.mounted}
        open={roles.rolesDialog.isOpen}
        roles={roles.roles}
        loading={roles.rolesLoading}
        error={roles.rolesError}
        onClose={roles.rolesDialog.close}
        selectedRole={roles.selectedRole}
        onSelectRole={roles.handleSelectRole}
        roleUsers={roles.roleUsers}
        roleUsersLoading={roles.roleUsersLoading}
        onCreateRole={roles.handleCreateRole}
        onDeleteRole={roles.handleDeleteRole}
        allUsers={users.users}
        onToggleUserRole={roles.handleToggleUserRole}
      />

      <UserFormModal
        mode="create"
        mounted={users.createModal.mounted}
        open={users.createModal.isOpen}
        submitting={users.createSubmitting}
        error={users.createError}
        formData={users.createFormData}
        onChange={users.updateCreateForm}
        onClose={users.createModal.close}
        onSubmit={users.submitCreateForm}
      />

      <UserFormModal
        mode="edit"
        mounted={users.editModal.mounted}
        open={users.editModal.isOpen}
        submitting={users.editSubmitting}
        error={users.editError}
        formData={users.editFormData}
        onChange={users.updateEditForm}
        onClose={users.editModal.close}
        onSubmit={users.submitEditForm}
      />

      {dataset.dialog}

      <SensorChartDialog
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
        sensorId={selectedDevice.id}
        sensorAlias={selectedDevice.alias}
        deviceType={selectedDevice.type}
      />

      <LedControlPanel
        mounted={ledModal.mounted}
        open={ledModal.isOpen}
        onClose={ledModal.close}
        params={ledControl.params}
        connected={ledControl.connected}
        onParamChange={ledControl.updateParam}
      />
    </div>
  );
}
