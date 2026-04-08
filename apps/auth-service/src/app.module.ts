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
import { AuthServiceModule } from './auth-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DatabaseModule.forRoot(),
    AuthSupportModule,
    AuthServiceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: InstitutionContextGuard },
  ],
})
export class AuthAppModule {}
