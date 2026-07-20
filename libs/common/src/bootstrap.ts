import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { ApiExceptionFilter } from './exceptions/api-exception.filter';
import { ResponseEnvelopeInterceptor } from './interceptors/response-envelope.interceptor';

export interface BootstrapOptions {
  appName: string;
  appDescription: string;
  version?: string;
  globalPrefix?: string;
}

export function configureApplication(
  app: INestApplication,
  options: BootstrapOptions,
): void {
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseEnvelopeInterceptor(),
  );

  if (options.globalPrefix) {
    app.setGlobalPrefix(options.globalPrefix);
  }

  const config = new DocumentBuilder()
    .setTitle(options.appName)
    .setDescription(options.appDescription)
    .setVersion(options.version ?? '0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const docsPath = options.globalPrefix
    ? `${options.globalPrefix}/docs`
    : 'docs';
  SwaggerModule.setup(docsPath, app, document);
}
