import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUDIT_METADATA_KEY, AUDIT_RESULT } from '@libs/audit/audit.constants';
import { AuditService } from '@libs/audit/audit.service';
import { AuditOptions, AuditRequest } from '@libs/audit/audit.types';
import { INSTITUTION_SCOPE_KEY } from '../constants/auth.constants';
import { JwtPayload } from '../types/jwt-payload.type';
import { InstitutionScopeOptions } from '../decorators/institution-scoped.decorator';

@Injectable()
export class InstitutionContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<InstitutionScopeOptions>(
      INSTITUTION_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      AuditRequest & {
        user?: JwtPayload;
        params: Record<string, string>;
        query: Record<string, string>;
        body?: Record<string, unknown>;
      }
    >();
    const user = request.user;

    if (!user || user.superadministrador) {
      return true;
    }

    const scopedInstitutionId =
      (options.param ? request.params?.[options.param] : undefined) ??
      (options.query ? request.query?.[options.query] : undefined) ??
      (options.body ? String(request.body?.[options.body] ?? '') : undefined);

    if (!scopedInstitutionId) {
      return true;
    }

    if (scopedInstitutionId !== user.institucionId) {
      await this.logDeniedAudit(
        context,
        request,
        new ForbiddenException(
          'No puede operar fuera de la institucion asociada a su usuario',
        ),
      );
      throw new ForbiddenException(
        'No puede operar fuera de la institucion asociada a su usuario',
      );
    }

    return true;
  }

  private async logDeniedAudit(
    context: ExecutionContext,
    request: AuditRequest & {
      user?: JwtPayload;
      params: Record<string, string>;
      query: Record<string, string>;
      body?: Record<string, unknown>;
    },
    error: ForbiddenException,
  ): Promise<void> {
    const options = this.reflector.getAllAndOverride<AuditOptions>(
      AUDIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return;
    }

    await this.auditService.registerHttpEvent({
      options,
      request,
      error,
      result: AUDIT_RESULT.DENEGADO,
      statusCode: error.getStatus(),
    });
  }
}
