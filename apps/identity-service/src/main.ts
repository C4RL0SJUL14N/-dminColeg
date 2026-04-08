import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureAuditApplication } from '@libs/audit';
import { configureApplication } from '@libs/common';
import { IdentityAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'Identity Service',
    appDescription: 'Personas y catalogos de identidad',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('IDENTITY_SERVICE_PORT', '3004')));
}

bootstrap();
