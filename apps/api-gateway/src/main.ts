import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureAuditApplication } from '@libs/audit';
import { configureApplication } from '@libs/common';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'API Gateway',
    appDescription:
      'Punto unico de entrada REST para autenticacion, acceso, identidad e instituciones',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('API_GATEWAY_PORT', '3000')));
}

bootstrap();
