import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { AUDIT_METADATA_KEY, AUDIT_RESULT } from './audit.constants';
import { AuditService } from './audit.service';
import { AuditOptions, AuditRequest } from './audit.types';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const options = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<AuditRequest>();
    const response = http.getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      concatMap((data) =>
        from(
          this.auditService.registerHttpEvent({
            options,
            request,
            responseBody: data,
            result: AUDIT_RESULT.EXITO,
            statusCode: response.statusCode,
          }),
        ).pipe(concatMap(() => [data])),
      ),
      catchError((error: unknown) =>
        from(
          this.auditService.registerHttpEvent({
            options,
            request,
            error,
            result:
              response.statusCode === 403 ? AUDIT_RESULT.DENEGADO : AUDIT_RESULT.FALLO,
            statusCode: response.statusCode > 0 ? response.statusCode : 500,
          }),
        ).pipe(concatMap(() => throwError(() => error))),
      ),
    );
  }
}

