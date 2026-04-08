import { INestApplication } from '@nestjs/common';
import { requestIdMiddleware } from './request-id.middleware';

export function configureAuditApplication(app: INestApplication): void {
  app.use(requestIdMiddleware);
}

