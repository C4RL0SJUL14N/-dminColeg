import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthSupportModule } from '@libs/auth';
import { AuditModule } from '@libs/audit';
import {
  InstitutionContextGuard,
  JwtAuthGuard,
  RolesGuard,
} from '@libs/common';
import { DatabaseModule } from '@libs/database';
import { AccessControlServiceModule } from './access-control-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DatabaseModule.forRoot(),
    AuthSupportModule,
    AuditModule.forRoot(),
    AccessControlServiceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: InstitutionContextGuard },
  ],
})
export class AccessControlAppModule {}
