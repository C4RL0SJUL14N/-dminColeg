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

export interface SedeResponse {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface AnioLectivoResponse {
  id: string;
  codigo: string;
  nombre?: string | null;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface ConfiguracionInstitucionResponse {
  id: string;
  institucionId: string;
  modeloPedagogico?: string | null;
  enfoquePedagogico?: string | null;
  tipoEscalaValoracion: string;
}

export interface NivelEscalaResponse {
  id: string;
  nombre: string;
  etiquetaCorta?: string | null;
  valorMinimo: string;
  valorMaximo: string;
  orden: number;
}

export interface EscalaValoracionResponse {
  id: string;
  nombre: string;
  tipo: string;
  activo: boolean;
  niveles: NivelEscalaResponse[];
}

export interface AreaConocimientoResponse {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface AsignaturaResponse {
  id: string;
  codigo: string;
  nombre: string;
  areaConocimientoId: string;
  activo: boolean;
}

export type NivelEducativo =
  | "preescolar"
  | "primaria"
  | "secundaria"
  | "media"
  | "tecnica"
  | "adultos"
  | "otro";

export interface GradoResponse {
  id: string;
  codigo: string;
  nombre: string;
  nombreCorto?: string | null;
  nivelEducativo: NivelEducativo;
  orden: number;
  activo: boolean;
}

export type JornadaNombre =
  "mañana" | "tarde" | "única" | "nocturna" | "sabatina";

export interface JornadaResponse {
  id: string;
  codigo: string;
  nombre: JornadaNombre;
  horaInicio?: string | null;
  horaFin?: string | null;
  activo: boolean;
}

export interface GrupoResponse {
  id: string;
  codigo: string;
  nombre: string;
  sedeId: string;
  anioLectivoId: string;
  gradoId: string;
  jornadaId: string;
  activo: boolean;
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
    error?: string | { message?: string | string[] };
  };
}

function apiError(
  payload: {
    message?: string | string[];
    error?: string | { message?: string | string[] };
  },
  fallback: string,
) {
  const rawMessage =
    payload.message ??
    (typeof payload.error === "object" ? payload.error.message : undefined);
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(". ")
    : rawMessage;
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
  return Object.prototype.hasOwnProperty.call(payload, "data")
    ? (payload.data as T)
    : (payload as unknown as T);
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

export function actualizarInstitucion(
  institucionId: string,
  input: { nombre: string; activo: boolean },
  accessToken: string,
) {
  return authenticatedRequest<InstitucionResponse>(
    `/instituciones/${institucionId}`,
    accessToken,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function getSedes(institucionId: string, accessToken: string) {
  return authenticatedRequest<SedeResponse[]>(
    `/instituciones/${institucionId}/sedes`,
    accessToken,
  );
}

export function crearSede(
  institucionId: string,
  input: { codigo: string; nombre: string },
  accessToken: string,
) {
  return authenticatedRequest<SedeResponse>(
    `/instituciones/${institucionId}/sedes`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getAniosLectivos(institucionId: string, accessToken: string) {
  return authenticatedRequest<AnioLectivoResponse[]>(
    `/instituciones/${institucionId}/anios-lectivos`,
    accessToken,
  );
}

export function crearAnioLectivo(
  institucionId: string,
  input: { nombre: string; fechaInicio: string; fechaFin: string },
  accessToken: string,
) {
  return authenticatedRequest<AnioLectivoResponse>(
    `/instituciones/${institucionId}/anios-lectivos`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getConfiguracionInstitucion(
  institucionId: string,
  accessToken: string,
) {
  return authenticatedRequest<ConfiguracionInstitucionResponse | null>(
    `/instituciones/${institucionId}/configuracion`,
    accessToken,
  );
}

export function guardarConfiguracionInstitucion(
  institucionId: string,
  input: {
    modeloPedagogico: string;
    enfoquePedagogico: string;
    tipoEscalaValoracion: string;
  },
  accessToken: string,
) {
  return authenticatedRequest<ConfiguracionInstitucionResponse>(
    `/instituciones/${institucionId}/configuracion`,
    accessToken,
    {
      method: "PUT",
      body: JSON.stringify({ configuracion: input }),
    },
  );
}

export function getEscalasValoracion(
  institucionId: string,
  accessToken: string,
) {
  return authenticatedRequest<EscalaValoracionResponse[]>(
    `/instituciones/${institucionId}/escalas-valoracion`,
    accessToken,
  );
}

export function crearEscalaValoracion(
  institucionId: string,
  input: {
    nombre: string;
    niveles: Array<{
      codigo: string;
      nombre: string;
      valorMinimo: string;
      valorMaximo: string;
      orden: number;
    }>;
  },
  accessToken: string,
) {
  return authenticatedRequest<EscalaValoracionResponse[]>(
    `/instituciones/${institucionId}/escalas-valoracion`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getAreasConocimiento(
  institucionId: string,
  accessToken: string,
) {
  return authenticatedRequest<AreaConocimientoResponse[]>(
    `/instituciones/${institucionId}/areas-conocimiento`,
    accessToken,
  );
}

export function crearAreaConocimiento(
  institucionId: string,
  input: { codigo: string; nombre: string; orden: number },
  accessToken: string,
) {
  return authenticatedRequest<AreaConocimientoResponse>(
    `/instituciones/${institucionId}/areas-conocimiento`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getAsignaturas(institucionId: string, accessToken: string) {
  return authenticatedRequest<AsignaturaResponse[]>(
    `/instituciones/${institucionId}/asignaturas`,
    accessToken,
  );
}

export function crearAsignatura(
  institucionId: string,
  input: { codigo: string; nombre: string; areaConocimientoId: string },
  accessToken: string,
) {
  return authenticatedRequest<AsignaturaResponse>(
    `/instituciones/${institucionId}/asignaturas`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getGrados(institucionId: string, accessToken: string) {
  return authenticatedRequest<GradoResponse[]>(
    `/instituciones/${institucionId}/grados`,
    accessToken,
  );
}

export function crearGrado(
  institucionId: string,
  input: {
    codigo: string;
    nombre: string;
    nombreCorto?: string;
    nivelEducativo: NivelEducativo;
    orden: number;
  },
  accessToken: string,
) {
  return authenticatedRequest<GradoResponse>(
    `/instituciones/${institucionId}/grados`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getJornadas(institucionId: string, accessToken: string) {
  return authenticatedRequest<JornadaResponse[]>(
    `/instituciones/${institucionId}/jornadas`,
    accessToken,
  );
}

export function crearJornada(
  institucionId: string,
  input: {
    codigo: string;
    nombre: JornadaNombre;
    horaInicio?: string;
    horaFin?: string;
  },
  accessToken: string,
) {
  return authenticatedRequest<JornadaResponse>(
    `/instituciones/${institucionId}/jornadas`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getGrupos(institucionId: string, accessToken: string) {
  return authenticatedRequest<GrupoResponse[]>(
    `/instituciones/${institucionId}/grupos`,
    accessToken,
  );
}

export function crearGrupo(
  institucionId: string,
  input: {
    codigo: string;
    nombre: string;
    sedeId: string;
    anioLectivoId: string;
    gradoId: string;
    jornadaId: string;
  },
  accessToken: string,
) {
  return authenticatedRequest<GrupoResponse>(
    `/instituciones/${institucionId}/grupos`,
    accessToken,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function getApiUrl() {
  return API_URL;
}
