import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly configService;
    constructor(reflector: Reflector, jwtService: JwtService, configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
