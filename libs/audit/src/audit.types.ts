import { Request } from 'express';
import { AUDIT_EVENT_TYPE, AUDIT_RESULT, AUDIT_SCOPE, AUDIT_SEVERITY } from './audit.constants';

export type AuditEventType = (typeof AUDIT_EVENT_TYPE)[keyof typeof AUDIT_EVENT_TYPE];
export type AuditSeverity = (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];
export type AuditResult = (typeof AUDIT_RESULT)[keyof typeof AUDIT_RESULT];
export type AuditScope = (typeof AUDIT_SCOPE)[keyof typeof AUDIT_SCOPE];

export interface AuditPrincipal {
  usuarioId?: string | null;
  personaId?: string | null;
  institucionId?: string | null;
  perfilIdSeleccionado?: string | null;
  perfilCodigoSeleccionado?: string | null;
  roles?: string[];
  superadministrador?: boolean;
}

export interface AuditOptions {
  servicio: string;
  modulo: string;
  entidad: string;
  accion: string;
  tipoEvento: AuditEventType;
  severidad?: AuditSeverity;
  ambitoOperacion?: AuditScope;
  capturarPayload?: boolean;
  capturarAntes?: boolean;
  capturarDespues?: boolean;
  entidadIdParam?: string;
  entidadIdBodyKey?: string;
  entidadIdResponseKey?: string;
}

export interface AuditRequest extends Request {
  requestId?: string;
  correlationId?: string | null;
  user?: AuditPrincipal;
}

export interface AuditRequestContextState {
  requestId: string;
  correlationId: string | null;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}

export interface AuditEventRecord {
  id: string;
  fecha_hora: string;
  usuario_id: string | null;
  institucion_id: string | null;
  servicio: string;
  modulo: string;
  entidad: string;
  entidad_id: string | null;
  accion: string;
  tipo_evento: AuditEventType;
  severidad: AuditSeverity;
  resultado: AuditResult;
  codigo_http: number | null;
  ruta: string | null;
  error_codigo: string | null;
  error_resumen: string | null;
}

export interface AuditSummaryRecord {
  id: string;
  fecha_hora: string;
  servicio: string;
  modulo: string;
  entidad: string;
  entidad_id: string | null;
  accion: string;
  tipo_evento: AuditEventType;
  severidad: AuditSeverity;
  resultado: AuditResult;
  codigo_http: number | null;
  usuario_id: string | null;
  persona_id: string | null;
  institucion_id: string | null;
  sede_id: string | null;
  superadministrador: boolean;
  rol_efectivo_codigo: string | null;
  perfil_efectivo_codigo: string | null;
  ambito_operacion: AuditScope;
  ruta: string | null;
  metodo_http: string | null;
  ip: string | null;
  error_codigo: string | null;
}

export interface AuditSearchFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  institucionId?: string;
  usuarioId?: string;
  tipoEvento?: string;
  resultado?: string;
  severidad?: string;
  entidad?: string;
  entidadId?: string;
  accion?: string;
  servicio?: string;
  modulo?: string;
  texto?: string;
  limit?: number;
  offset?: number;
}

export interface RegisterAuditEventInput {
  options: AuditOptions;
  request: AuditRequest;
  statusCode: number;
  result: AuditResult;
  responseBody?: unknown;
  error?: unknown;
  overrideType?: AuditEventType;
  overrideSeverity?: AuditSeverity;
}

