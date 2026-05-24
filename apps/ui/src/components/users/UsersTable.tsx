'use client';

import { EmptyState } from '@/components/EmptyState';
import { formatValue, titleCase } from '@/lib/formatting';
import type { Row, UserRow } from '@/types';

const COLUMNS = ['id', 'name', 'username', 'email', 'phone', 'timestamp'];

/** Convert a generic Row to a typed UserRow. */
export function toUserRow(row: Row): UserRow {
  const id = Number(row.id);
  return {
    id: Number.isFinite(id) ? id : 0,
    email: typeof row.email === 'string' ? row.email : null,
    username: typeof row.username === 'string' ? row.username : null,
    name: typeof row.name === 'string' ? row.name : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
  };
}

/* ── Action buttons (shared between desktop and mobile rows) ─────────── */

function RowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: Row;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(toUserRow(row))}
        className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white hover:shadow-lg active:scale-90"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(toUserRow(row))}
        className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-100 transition-all duration-200 hover:bg-red-500/20 hover:shadow-lg active:scale-90"
      >
        Eliminar
      </button>
    </div>
  );
}

/* ── Desktop table view ──────────────────────────────────────────────── */

function DesktopTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) {
  return (
    <div className="hidden overflow-hidden overflow-x-auto rounded-2xl border border-white/10 bg-black/10 sm:block">
      <table className="min-w-full overflow-hidden rounded-2xl border-separate border-spacing-0 text-left text-sm">
        <thead className="sticky top-0 z-10 rounded-t-2xl bg-black/30 backdrop-blur-md">
          <tr>
            {COLUMNS.map((column) => (
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
              {COLUMNS.map((column) => (
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
                <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mobile card view ────────────────────────────────────────────────── */

function MobileCards({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) {
  return (
    <div className="grid gap-3 sm:hidden">
      {rows.map((row, rowIndex) => (
        <div
          key={row.id ? String(row.id) : `${rowIndex}`}
          className="rounded-2xl border border-white/10 bg-black/10 p-4"
        >
          {COLUMNS.map((column) => (
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
            <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Public component ────────────────────────────────────────────────── */

/**
 * Responsive users table: desktop table + mobile cards.
 */
export function UsersTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) {
  if (rows.length === 0) {
    return <EmptyState message="No hay usuarios para mostrar." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <DesktopTable rows={rows} onEdit={onEdit} onDelete={onDelete} />
      <MobileCards rows={rows} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
