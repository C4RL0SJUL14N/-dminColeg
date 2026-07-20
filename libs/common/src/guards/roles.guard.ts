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
import { ROLES_KEY } from '../constants/auth.constants';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuditRequest & { user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      await this.logDeniedAudit(
        context,
        request,
        new ForbiddenException('No se encontro contexto autenticado'),
      );
      throw new ForbiddenException('No se encontro contexto autenticado');
    }

    if (user.superadministrador) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      await this.logDeniedAudit(
        context,
        request,
        new ForbiddenException('No tiene los roles requeridos'),
      );
      throw new ForbiddenException('No tiene los roles requeridos');
    }

    return true;
  }

  private async logDeniedAudit(
    context: ExecutionContext,
    request: AuditRequest & { user?: JwtPayload },
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
