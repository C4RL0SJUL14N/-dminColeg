import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { Request, Response } from "express";
import { configureAuditApplication } from "@libs/audit";
import { configureApplication } from "@libs/common";
import { ApiGatewayModule } from "../apps/api-gateway/src/api-gateway.module";

let applicationPromise: Promise<INestApplication> | undefined;

async function createApplication() {
  const app = await NestFactory.create(ApiGatewayModule, {
    logger:
      process.env.NODE_ENV === "production" ? ["error", "warn"] : undefined,
  });

  configureAuditApplication(app);
  configureApplication(app, {
    appName: "AdminColeg API",
    appDescription: "API REST de la plataforma educativa AdminColeg",
    globalPrefix: "api",
  });

  await app.init();
  return app;
}

function getApplication() {
  applicationPromise ??= createApplication();
  return applicationPromise;
}

function restoreApiPath(request: Request) {
  const url = new URL(request.url, "http://localhost");
  const rewrittenPath = url.searchParams.get("path");
  if (!rewrittenPath) return;

  url.searchParams.delete("path");
  request.url = `/api/${rewrittenPath}${url.searchParams.size ? url.search : ""}`;
}

export default async function handler(request: Request, response: Response) {
  restoreApiPath(request);
  const app = await getApplication();
  const server = app.getHttpAdapter().getInstance();
  return server(request, response);
}
