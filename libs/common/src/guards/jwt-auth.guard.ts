import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  AUDIT_METADATA_KEY,
  AUDIT_RESULT,
  AuditOptions,
  AuditService,
} from '@libs/audit';
import { PUBLIC_ROUTE_KEY } from '../constants/auth.constants';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      await this.logDeniedAudit(context, request, new UnauthorizedException('Token JWT requerido'));
      throw new UnauthorizedException('Token JWT requerido');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      request.user = payload;
      return true;
    } catch {
      await this.logDeniedAudit(
        context,
        request,
        new UnauthorizedException('Token JWT invalido o expirado'),
      );
      throw new UnauthorizedException('Token JWT invalido o expirado');
    }
  }

  private async logDeniedAudit(
    context: ExecutionContext,
    request: Request & { user?: JwtPayload },
    error: UnauthorizedException,
  ): Promise<void> {
    const options = this.reflector.getAllAndOverride<AuditOptions>(AUDIT_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) {
      return;
    }

    await this.auditService.registerHttpEvent({
      options,
      request,
      error,
      result: AUDIT_RESULT.FALLO,
      statusCode: error.getStatus(),
    });
  }
}
