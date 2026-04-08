import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

export interface AuditModuleOptions {
  exposeController?: boolean;
}

@Global()
@Module({})
export class AuditModule {
  static forRoot(options: AuditModuleOptions = {}): DynamicModule {
    return {
      module: AuditModule,
      controllers: options.exposeController ? [AuditController] : [],
      providers: [
        AuditService,
        AuditInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useExisting: AuditInterceptor,
        },
      ],
      exports: [AuditService, AuditInterceptor],
    };
  }
}

