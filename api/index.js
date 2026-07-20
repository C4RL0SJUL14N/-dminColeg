const { NestFactory } = require("@nestjs/core");
const {
  configureAuditApplication,
} = require("../dist/apps/api-gateway/libs/audit/src");
const {
  configureApplication,
} = require("../dist/apps/api-gateway/libs/common/src");
const {
  ApiGatewayModule,
} = require("../dist/apps/api-gateway/apps/api-gateway/src/api-gateway.module");

let applicationPromise;

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

function restoreApiPath(request) {
  const url = new URL(request.url, "http://localhost");
  const rewrittenPath = url.searchParams.get("path");
  if (!rewrittenPath) return;

  url.searchParams.delete("path");
  request.url = `/api/${rewrittenPath}${url.searchParams.size ? url.search : ""}`;
}

module.exports = async function handler(request, response) {
  restoreApiPath(request);
  const app = await getApplication();
  const server = app.getHttpAdapter().getInstance();
  return server(request, response);
};
