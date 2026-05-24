import type {
  ChartDataPoint,
  DatasetKey,
  Row,
  SensorReading,
  UserFormData,
} from '@/types';
import api from './eden';
import { redirectToSignInIfUnauthorized } from './redirectToSignIn';

type Router = { push: (href: string) => void };

/** Unified result returned by mutation helpers. */
export type ApiMutationResult = {
  ok: boolean;
  error?: string;
};

/* ── Dataset endpoints ───────────────────────────────────────────────── */

const datasetEndpoints = {
  microcontrollers: () => api.api.microcontrollers.get(),
  sensors: () => api.api.sensors.get(),
  actuators: () => api.api.actuators.get(),
} as const;

const datasetErrorMessages: Record<DatasetKey, string> = {
  microcontrollers: 'No se pudo cargar microcontrollers',
  sensors: 'No se pudo cargar sensores',
  actuators: 'No se pudo cargar actuators',
};

/**
 * Fetch rows for the given dataset key.
 * Redirects to sign-in on 401.
 */
export async function fetchDataset(
  key: DatasetKey,
  router: Router,
): Promise<Row[]> {
  const { data, error, status } = await datasetEndpoints[key]();

  if (redirectToSignInIfUnauthorized(status, router)) return [];

  if (error) {
    throw new Error(
      typeof error.value === 'string' ? error.value : datasetErrorMessages[key],
    );
  }

  const result = (data ?? []) as Row[];

  // Fallback a datos mockeados si la base de datos no tiene actuadores
  if (key === 'actuators' && result.length === 0) {
    return [
      { id: 1, category_id: 1, controller_id: 1, alias: 'Válvula Principal' },
      { id: 2, category_id: 1, controller_id: 1, alias: 'Motor Secundario' },
      { id: 3, category_id: 1, controller_id: 1, alias: 'Bomba de Agua' },
    ] as Row[];
  }

  return result;
}

/* ── Users ────────────────────────────────────────────────────────────── */

/** Fetch all users. */
export async function fetchUsers(router: Router): Promise<Row[]> {
  const { data, error, status } = await api.api.users.get();

  if (redirectToSignInIfUnauthorized(status, router)) return [];

  if (error) {
    throw new Error(
      typeof error.value === 'string'
        ? error.value
        : 'No se pudo cargar usuarios',
    );
  }

  return (data ?? []) as Row[];
}

/** Create a new user. */
export async function createUser(
  payload: UserFormData,
  router: Router,
): Promise<ApiMutationResult> {
  const { status, error } = await api.api.users.post({
    email: payload.email.trim().toLowerCase(),
    username: payload.username.trim(),
    password: payload.password,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
  });

  if (redirectToSignInIfUnauthorized(status, router)) {
    return { ok: false };
  }

  if (status === 201) return { ok: true };

  return {
    ok: false,
    error:
      typeof error?.value === 'string'
        ? error.value
        : 'No se pudo crear el usuario',
  };
}

/** Update an existing user. */
export async function updateUser(
  id: number,
  payload: UserFormData,
  router: Router,
): Promise<ApiMutationResult> {
  const body: Partial<UserFormData> = {
    email: payload.email.trim().toLowerCase(),
    username: payload.username.trim(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
  };

  if (payload.password) {
    body.password = payload.password;
  }

  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { status, error } = await api.api.users[id]!.put(body);

  if (redirectToSignInIfUnauthorized(status, router)) {
    return { ok: false };
  }

  if (status === 200) return { ok: true };

  return {
    ok: false,
    error:
      typeof error?.value === 'string'
        ? error.value
        : 'No se pudo actualizar el usuario',
  };
}

/** Delete a user by ID. */
export async function deleteUserById(
  id: number,
  router: Router,
): Promise<ApiMutationResult> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { status, error } = await api.api.users[id]!.delete();

  if (redirectToSignInIfUnauthorized(status, router)) {
    return { ok: false };
  }

  if (status === 200) return { ok: true };

  return {
    ok: false,
    error:
      typeof error?.value === 'string'
        ? error.value
        : 'No se pudo eliminar el usuario',
  };
}

/* ── Sensor readings ──────────────────────────────────────────────────── */

/** Fetch sensor readings and format them for Recharts. */
export async function fetchSensorReadings(
  sensorId: number,
): Promise<ChartDataPoint[]> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { data, error } = await api.api.sensors[sensorId]!.readings.get();

  if (error) {
    throw new Error(
      typeof error.value === 'string' ? error.value : 'Error fetching data',
    );
  }

  if (!data) return [];

  return (data as SensorReading[])
    .map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: Number.parseFloat(d.value),
    }))
    .reverse();
}

/** Fetch actuator readings and format them for Recharts. */
export async function fetchActuatorReadings(
  actuatorId: number,
): Promise<ChartDataPoint[]> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { data, error } = await api.api.actuators[actuatorId]!.readings.get();

  if (error) {
    throw new Error(
      typeof error.value === 'string' ? error.value : 'Error fetching data',
    );
  }

  if (!data) return [];

  // Assuming actuator readings have a 'value' property in schema similar to sensors
  return (data as any[])
    .map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: Number.parseFloat(d.value),
    }))
    .reverse();
}

/* ── Roles ────────────────────────────────────────────────────────────── */

export async function fetchRoles(router: Router): Promise<Row[]> {
  const { data, error, status } = await api.api.roles.get();
  if (redirectToSignInIfUnauthorized(status, router)) return [];
  if (error) {
    throw new Error(typeof error.value === 'string' ? error.value : 'Error fetching roles');
  }
  return (data ?? []) as Row[];
}

export async function createRole(name: string, router: Router): Promise<ApiMutationResult> {
  const { status, error } = await api.api.roles.post({ name: name.trim().toLowerCase() });
  if (redirectToSignInIfUnauthorized(status, router)) return { ok: false };
  if (status === 201) return { ok: true };
  return { ok: false, error: typeof error?.value === 'string' ? error.value : 'Failed to create role' };
}

export async function deleteRole(id: number, router: Router): Promise<ApiMutationResult> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { status, error } = await api.api.roles[id]!.delete();
  if (redirectToSignInIfUnauthorized(status, router)) return { ok: false };
  if (status === 200) return { ok: true };
  return { ok: false, error: typeof error?.value === 'string' ? error.value : 'Failed to delete role' };
}

export async function fetchUsersForRole(roleId: number, router: Router): Promise<Row[]> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { data, error, status } = await api.api.roles[roleId]!.users.get();
  if (redirectToSignInIfUnauthorized(status, router)) return [];
  if (error) {
    throw new Error(typeof error.value === 'string' ? error.value : 'Error fetching users for role');
  }
  return (data ?? []) as Row[];
}

export async function assignRoleToUser(roleId: number, userId: number, router: Router): Promise<ApiMutationResult> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { status, error } = await api.api.roles[roleId]!.users[userId]!.post({});
  if (redirectToSignInIfUnauthorized(status, router)) return { ok: false };
  if (status === 201) return { ok: true };
  return { ok: false, error: typeof error?.value === 'string' ? error.value : 'Failed to assign role' };
}

export async function unassignRoleFromUser(roleId: number, userId: number, router: Router): Promise<ApiMutationResult> {
  // biome-ignore lint/style/noNonNullAssertion: API type generation limitation
  const { status, error } = await api.api.roles[roleId]!.users[userId]!.delete();
  if (redirectToSignInIfUnauthorized(status, router)) return { ok: false };
  if (status === 200) return { ok: true };
  return { ok: false, error: typeof error?.value === 'string' ? error.value : 'Failed to unassign role' };
}
