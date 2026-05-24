'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingState } from '@/components/LoadingState';
import { ModalHeader } from '@/components/ModalHeader';
import { ModalOverlay } from '@/components/ModalOverlay';
import { useAnimatedModal } from '@/hooks/useAnimatedModal';
import { fetchDataset } from '@/lib/api';
import { formatValue, titleCase } from '@/lib/formatting';
import type { DatasetKey, Row } from '@/types';
import { datasetConfig } from '@/types';

/* ── Icon button for the sidebar rail ────────────────────────────────── */

function DatasetIconButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
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
      <Image
        src={icon}
        alt={label}
        fill
        sizes="68px"
        className="p-2.5 opacity-90"
      />
    </button>
  );
}

/* ── Generic data table ──────────────────────────────────────────────── */

function DataTable({
  rows,
  datasetType,
  onSensorChartClick,
}: {
  rows: Row[];
  datasetType?: string;
  onSensorChartClick?: (sensorId: number, sensorAlias: string) => void;
}) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) keys.add(key);
    }
    return Array.from(keys);
  }, [rows]);

  if (rows.length === 0) {
    return <EmptyState />;
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
            {datasetType === 'sensors' && (
              <th className="border-b border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                Acciones
              </th>
            )}
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
              {datasetType === 'sensors' && (
                <td className="border-b border-white/5 px-4 py-3 align-top text-white/85">
                  <button
                    type="button"
                    onClick={() =>
                      onSensorChartClick?.(
                        row.id as number,
                        String(row.alias || row.name || `Sensor ${row.id}`),
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-500/20 active:scale-95"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    Ver Gráfica
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Dataset Dialog (modal with table) ───────────────────────────────── */

/**
 * Self-contained dataset dialog.
 *
 * Manages its own modal state, data loading, and display.
 * The parent only needs to call `open(key)` via the ref-like callbacks.
 */
export function useDatasetDialog(
  onSensorChartClick?: (id: number, alias: string) => void,
) {
  const router = useRouter();
  const modal = useAnimatedModal();

  const [activeKey, setActiveKey] = useState<DatasetKey | null>(null);
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

  async function openDataset(key: DatasetKey) {
    setActiveKey(key);
    modal.open();

    if (recordsByDataset[key].length > 0 || loadingByDataset[key]) return;

    setLoadingByDataset((current) => ({ ...current, [key]: true }));
    setErrorByDataset((current) => ({ ...current, [key]: null }));

    try {
      const rows = await fetchDataset(key, router);
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

  const rows = activeKey ? recordsByDataset[activeKey] : [];
  const loading = activeKey ? loadingByDataset[activeKey] : false;
  const error = activeKey ? errorByDataset[activeKey] : null;

  const dialog = (
    <ModalOverlay
      mounted={modal.mounted}
      open={modal.isOpen}
      onClose={modal.close}
      width="1100px"
    >
      <ModalHeader
        title={activeKey ? datasetConfig[activeKey].label : ''}
        onClose={modal.close}
      />

      <div className="mt-5 flex-1 overflow-hidden">
        {loading ? (
          <LoadingState message="Cargando registros..." />
        ) : error ? (
          <ErrorBanner message={error} />
        ) : (
          <DataTable
            rows={rows}
            datasetType={activeKey ?? undefined}
            onSensorChartClick={onSensorChartClick}
          />
        )}
      </div>
    </ModalOverlay>
  );

  return { activeKey, openDataset, isOpen: modal.isOpen, dialog };
}

/* ── Sidebar rail ────────────────────────────────────────────────────── */

export function DatasetRail({
  activeKey,
  onSelect,
}: {
  activeKey: DatasetKey | null;
  onSelect: (key: DatasetKey) => void;
}) {
  return (
    <>
      {(Object.keys(datasetConfig) as DatasetKey[]).map((key) => (
        <DatasetIconButton
          key={key}
          label={datasetConfig[key].label}
          icon={datasetConfig[key].icon}
          active={activeKey === key}
          onClick={() => onSelect(key)}
        />
      ))}
    </>
  );
}
