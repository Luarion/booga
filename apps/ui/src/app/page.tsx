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
import MusicPlayer from '@/components/MusicPlayer';
import { SensorChartDialog } from '@/components/SensorChartDialog';
import { UserFormModal } from '@/components/users/UserFormModal';
import { UsersDialog } from '@/components/users/UsersDialog';
import { UsersRailButton } from '@/components/users/UsersRailButton';
import { useUsers } from '@/hooks/useUsers';

export default function Page() {
  const users = useUsers();

  /* ── Sensor chart ──────────────────────────────────────────────── */
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<{
    id: number | null;
    alias: string;
  }>({ id: null, alias: '' });

  const handleSensorChartClick = (id: number, alias: string) => {
    setSelectedSensor({ id, alias });
    setIsChartOpen(true);
  };

  /* ── Dataset dialog ────────────────────────────────────────────── */
  const dataset = useDatasetDialog(handleSensorChartClick);

  /* ── Load users on mount ───────────────────────────────────────── */
  useEffect(() => {
    void users.loadUsers();
  }, [users.loadUsers]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div
        className={
          dataset.isOpen
            ? 'relative h-full w-full opacity-20 blur-sm transition duration-300 ease-out'
            : 'relative h-full w-full opacity-100 blur-0 transition duration-300 ease-out'
        }
      >
        {/* Up */}
        <div className="absolute left-1/2 top-0 flex w-1/2 max-w-1/2 -translate-x-1/2 flex-col items-center gap-3 animate-in-down delay-100">
          <GlassPanel className="w-fit rounded-b-2xl animate-pop-in delay-100">
            <TopQuickLinks />
          </GlassPanel>
          <div className="animate-pop-in delay-200">
            <MusicPlayer />
          </div>
        </div>

        {/* Top Right */}
        <GlassPanel className="absolute right-0 top-0 max-w-1/3 justify-end rounded-bl-2xl animate-in-right delay-200">
          <SignOutButton />
        </GlassPanel>

        {/* Left */}
        <GlassPanel className="absolute left-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-r-2xl animate-in-left delay-300">
          <UsersRailButton
            active={users.usersDialog.isOpen}
            onClick={users.openUsersDialog}
          />
        </GlassPanel>

        {/* Right */}
        <GlassPanel className="absolute right-0 top-1/2 max-h-[80%] w-25 -translate-y-1/2 flex-col items-center justify-start rounded-l-2xl animate-in-right delay-400">
          <DatasetRail
            activeKey={dataset.activeKey}
            onSelect={(key) => void dataset.openDataset(key)}
          />
        </GlassPanel>

        {/* Bottom */}
        <GlassPanel className="absolute bottom-0 left-0 max-w-1/3 justify-start rounded-tr-2xl animate-in-up delay-200">
          <BottomQuickLinks />
        </GlassPanel>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}

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
        sensorId={selectedSensor.id}
        sensorAlias={selectedSensor.alias}
      />
    </div>
  );
}
