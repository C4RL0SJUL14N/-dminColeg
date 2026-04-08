import { AUDIT_MAX_DEPTH, AUDIT_REDACTED_VALUE, AUDIT_SENSITIVE_FIELD_NAMES } from './audit.constants';

function maskToken(value: string): string {
  if (value.length <= 8) {
    return AUDIT_REDACTED_VALUE;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function sanitizeScalar(key: string, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (AUDIT_SENSITIVE_FIELD_NAMES.has(normalizedKey)) {
    return normalizedKey === 'authorization' ? AUDIT_REDACTED_VALUE : maskToken(value);
  }

  if (normalizedKey.includes('token') || normalizedKey.includes('secret')) {
    return maskToken(value);
  }

  return value;
}

export function sanitizeAuditPayload<T>(input: T, depth = 0): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (depth >= AUDIT_MAX_DEPTH) {
    return '[TRUNCATED]' as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeAuditPayload(item, depth + 1)) as T;
  }

  if (input instanceof Date) {
    return input as T;
  }

  if (typeof input !== 'object') {
    return input;
  }

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    if (AUDIT_SENSITIVE_FIELD_NAMES.has(normalizedKey)) {
      output[key] =
        normalizedKey === 'authorization'
          ? AUDIT_REDACTED_VALUE
          : typeof value === 'string'
            ? maskToken(value)
            : AUDIT_REDACTED_VALUE;
      continue;
    }

    if (key.toLowerCase() === 'headers' && value && typeof value === 'object') {
      output[key] = sanitizeAuditPayload(value, depth + 1);
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      output[key] = sanitizeAuditPayload(value, depth + 1);
      continue;
    }

    output[key] = sanitizeScalar(key, value);
  }

  return output as T;
}

export function sanitizeAuditError(error: unknown): { errorCodigo: string | null; errorResumen: string | null } {
  if (!error || typeof error !== 'object') {
    return { errorCodigo: null, errorResumen: null };
  }

  const candidate = error as {
    name?: string;
    message?: string;
    response?: string | { message?: string | string[]; error?: string };
  };

  const responseMessage =
    typeof candidate.response === 'object' && candidate.response !== null
      ? candidate.response.message
      : undefined;

  const errorResumen = Array.isArray(responseMessage)
    ? responseMessage.join('; ')
    : responseMessage ?? candidate.message ?? null;

  return {
    errorCodigo: candidate.name ?? null,
    errorResumen,
  };
}

