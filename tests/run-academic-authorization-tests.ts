import "reflect-metadata";
import assert from "node:assert/strict";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AcademicStructureController } from "@apps/academic-structure-service/academic-structure.controller";
import { AuditService } from "@libs/audit";
import {
  JwtPayload,
  RolesGuard,
  ROLES_KEY,
  ROLE_ADMIN_APP,
} from "@libs/common";

type HandlerName = keyof AcademicStructureController;

const WRITE_HANDLERS: HandlerName[] = [
  "createAsignatura",
  "createGrado",
  "createJornada",
  "createGrupo",
  "createPlanEstudio",
  "createCargaDocente",
];

const READ_HANDLERS: HandlerName[] = [
  "findAsignaturas",
  "findGrados",
  "findJornadas",
  "findGrupos",
  "findPlanesEstudio",
  "findCargasDocentes",
];

function createPayload(
  roles: string[],
  superadministrador = false,
): JwtPayload {
  return {
    sub: "20000000-0000-4000-8000-000000000001",
    usuarioId: "20000000-0000-4000-8000-000000000001",
    institucionId: superadministrador
      ? null
      : "10000000-0000-4000-8000-000000000001",
    personaId: "30000000-0000-4000-8000-000000000001",
    roles,
    superadministrador,
    sessionId: "40000000-0000-4000-8000-000000000001",
  };
}

function createContext(
  handlerName: HandlerName,
  user: JwtPayload,
): ExecutionContext {
  const request = {
    user,
    params: {},
    query: {},
    body: {},
    headers: {},
    method: handlerName.toString().startsWith("create") ? "POST" : "GET",
    originalUrl: `/test/${String(handlerName)}`,
    baseUrl: "",
  };

  return {
    getHandler: () => AcademicStructureController.prototype[handlerName],
    getClass: () => AcademicStructureController,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

async function main() {
  for (const handlerName of WRITE_HANDLERS) {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      AcademicStructureController.prototype[handlerName],
    );
    assert.deepEqual(roles, [ROLE_ADMIN_APP]);
  }

  for (const handlerName of READ_HANDLERS) {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      AcademicStructureController.prototype[handlerName],
    );
    assert.equal(roles, undefined);
  }

  let deniedAudits = 0;
  const auditService = {
    registerHttpEvent: async () => {
      deniedAudits += 1;
    },
  } as unknown as AuditService;
  const guard = new RolesGuard(new Reflector(), auditService);

  assert.equal(
    await guard.canActivate(
      createContext("createGrupo", createPayload([ROLE_ADMIN_APP])),
    ),
    true,
  );
  assert.equal(
    await guard.canActivate(
      createContext("createGrupo", createPayload([], true)),
    ),
    true,
  );
  await assert.rejects(
    guard.canActivate(createContext("createGrupo", createPayload(["docente"]))),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(
      createContext("findGrupos", createPayload(["docente"])),
    ),
    true,
  );
  assert.equal(deniedAudits, 1);

  console.log("Academic authorization tests passed:");
  console.log(
    "- seis operaciones de escritura requieren administrador institucional",
  );
  console.log("- el superadministrador conserva acceso global");
  console.log("- docentes no pueden escribir estructura academica");
  console.log("- las seis operaciones de lectura siguen disponibles");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
