import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import {
  AUDIT_CORRELATION_ID_HEADER,
  AUDIT_REQUEST_ID_HEADER,
} from './audit.constants';
import { runAuditContext } from './audit.context';
import { AuditRequest } from './audit.types';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function requestIdMiddleware(req: AuditRequest, res: Response, next: NextFunction): void {
  const rawRequestIdHeader = req.header(AUDIT_REQUEST_ID_HEADER)?.trim();
  const rawCorrelationHeader = req.header(AUDIT_CORRELATION_ID_HEADER)?.trim();

  const requestId =
    rawRequestIdHeader && isUuid(rawRequestIdHeader) ? rawRequestIdHeader : randomUUID();
  const correlationId =
    rawCorrelationHeader ?? (rawRequestIdHeader && !isUuid(rawRequestIdHeader) ? rawRequestIdHeader : requestId);

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader(AUDIT_REQUEST_ID_HEADER, requestId);
  res.setHeader(AUDIT_CORRELATION_ID_HEADER, correlationId);

  runAuditContext(
    {
      requestId,
      correlationId,
    },
    () => next(),
  );
}

