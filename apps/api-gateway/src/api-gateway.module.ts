import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthSupportModule } from '@libs/auth';
import {
  InstitutionContextGuard,
  JwtAuthGuard,
  RolesGuard,
} from '@libs/common';
import { DatabaseModule } from '@libs/database';
import { AccessControlServiceModule } from '@apps/access-control-service/access-control-service.module';
import { AuthServiceModule } from '@apps/auth-service/auth-service.module';
import { IdentityServiceModule } from '@apps/identity-service/identity-service.module';
import { InstitutionServiceModule } from '@apps/institution-service/institution-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DatabaseModule.forRoot(),
    AuthSupportModule,
    AuthServiceModule,
    AccessControlServiceModule,
    InstitutionServiceModule,
    IdentityServiceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: InstitutionContextGuard },
  ],
})
export class ApiGatewayModule {}
