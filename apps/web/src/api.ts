const API_URL = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:3000" : "/api")
).replace(/\/$/, "");

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  requiereCambioContrasena?: boolean;
  requiereSeleccionPerfil?: boolean;
  contextoAcceso?: {
    personaId?: string;
    institucionId?: string | null;
    superadministrador?: boolean;
    roles?: Array<{ codigo: string; nombre?: string }>;
    perfiles?: Array<{ id: string; codigo: string; nombre?: string }>;
  };
  perfilPredeterminado?: { codigo?: string; nombre?: string } | null;
}

export interface PersonaResponse {
  id: string;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
}

export interface InstitucionResponse {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  creadoEn?: string;
}

async function readApiResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    const detail = body.startsWith("The page could not be found")
      ? "La API no está publicada en este despliegue"
      : "La API devolvió una respuesta no válida";
    throw new Error(`${detail} (${response.status})`);
  }

  return (await response.json()) as {
    data?: T;
    message?: string | string[];
  };
}

function apiError(payload: { message?: string | string[] }, fallback: string) {
  const message = Array.isArray(payload.message)
    ? payload.message.join(". ")
    : payload.message;
  return new Error(message || fallback);
}

export async function login(correo: string, contrasena: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const payload = await readApiResponse<LoginResponse>(response);
  if (!response.ok) {
    throw apiError(payload, "No fue posible iniciar sesión");
  }
  return payload.data ?? (payload as unknown as LoginResponse);
}

export async function cambiarContrasenaInicial(
  correo: string,
  contrasenaActual: string,
  nuevaContrasena: string,
) {
  const response = await fetch(`${API_URL}/auth/cambiar-contrasena-inicial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasenaActual, nuevaContrasena }),
  });
  const payload = await readApiResponse<LoginResponse>(response);
  if (!response.ok) {
    throw apiError(payload, "No fue posible actualizar la contraseña");
  }
  return payload.data ?? (payload as unknown as LoginResponse);
}

async function authenticatedRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  const payload = await readApiResponse<T>(response);
  if (!response.ok)
    throw apiError(payload, "No fue posible completar la solicitud");
  return payload.data ?? (payload as unknown as T);
}

export function getPersona(id: string, accessToken: string) {
  return authenticatedRequest<PersonaResponse>(`/personas/${id}`, accessToken);
}

export function getInstituciones(accessToken: string) {
  return authenticatedRequest<InstitucionResponse[]>(
    "/instituciones",
    accessToken,
  );
}

export function crearInstitucion(
  input: { codigo: string; nombre: string },
  accessToken: string,
) {
  return authenticatedRequest<InstitucionResponse>(
    "/instituciones",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function crearSedePrincipal(
  institucionId: string,
  input: { codigo: string; nombre: string },
  accessToken: string,
) {
  return authenticatedRequest(
    `/instituciones/${institucionId}/sedes`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ ...input, principal: true }),
    },
  );
}

export function getApiUrl() {
  return API_URL;
}
