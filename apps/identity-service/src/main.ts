import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureApplication } from '@libs/common';
import { IdentityAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityAppModule);
  configureApplication(app, {
    appName: 'Identity Service',
    appDescription: 'Personas y catalogos de identidad',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('IDENTITY_SERVICE_PORT', '3004')));
}

bootstrap();
