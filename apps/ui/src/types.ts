/* ── Shared type definitions ─────────────────────────────────────────── */

/** Generic key-value row returned by API list endpoints. */
export type Row = Record<string, unknown>;

/** Dataset categories available in the dashboard. */
export type DatasetKey = 'microcontrollers' | 'sensors' | 'actuators';

/** Shape of the user form used for create and edit flows. */
export type UserFormData = {
  email: string;
  username: string;
  password: string;
  name: string;
  phone: string;
};

/** Normalized user row extracted from a generic `Row`. */
export type UserRow = {
  id: number;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  phone?: string | null;
};

/* ── Music ───────────────────────────────────────────────────────────── */

export type MusicTrack = {
  title: string;
  artist: string;
  src: string;
  fileName: string;
};

export type MusicAlbum = {
  slug: string;
  title: string;
  artist: string;
  coverSrc: string;
  tracks: MusicTrack[];
};

/* ── Sensors ─────────────────────────────────────────────────────────── */

export type SensorReading = {
  sensor_id: number | string;
  value: string;
  timestamp: Date;
};

/** Data point formatted for Recharts. */
export type ChartDataPoint = {
  time: string;
  value: number;
};

/* ── Dataset configuration ───────────────────────────────────────────── */

export const datasetConfig: Record<
  DatasetKey,
  { label: string; icon: string }
> = {
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
