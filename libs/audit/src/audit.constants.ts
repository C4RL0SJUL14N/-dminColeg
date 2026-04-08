export const AUDIT_METADATA_KEY = 'audit:metadata';
export const AUDIT_REQUEST_ID_HEADER = 'x-request-id';
export const AUDIT_CORRELATION_ID_HEADER = 'x-correlation-id';
export const AUDIT_REDACTED_VALUE = '[REDACTED]';
export const AUDIT_MAX_DEPTH = 5;

export const AUDIT_RESULT = {
  EXITO: 'exito',
  FALLO: 'fallo',
  DENEGADO: 'denegado',
} as const;

export const AUDIT_EVENT_TYPE = {
  SEGURIDAD: 'seguridad',
  NEGOCIO: 'negocio',
  SISTEMA: 'sistema',
} as const;

export const AUDIT_SEVERITY = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export const AUDIT_SCOPE = {
  GLOBAL: 'global',
  INSTITUCIONAL: 'institucional',
  SEDE: 'sede',
} as const;

export const AUDIT_SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'contrasena',
  'hash_contrasena',
  'refreshtoken',
  'accesstoken',
  'token',
  'tokenrecuperacion',
  'recoverytoken',
  'clientsecret',
  'client_secret',
  'authorization',
]);

