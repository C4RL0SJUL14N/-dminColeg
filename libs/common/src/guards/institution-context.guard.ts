import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { INSTITUTION_SCOPE_KEY } from '../constants/auth.constants';
import { JwtPayload } from '../types/jwt-payload.type';
import { InstitutionScopeOptions } from '../decorators/institution-scoped.decorator';

@Injectable()
export class InstitutionContextGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<InstitutionScopeOptions>(
      INSTITUTION_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      params: Record<string, string>;
      query: Record<string, string>;
      body?: Record<string, unknown>;
    }>();
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
      throw new ForbiddenException(
        'No puede operar fuera de la institucion asociada a su usuario',
      );
    }

    return true;
  }
}

