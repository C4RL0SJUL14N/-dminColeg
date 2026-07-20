import "reflect-metadata";
import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CrearTrasladoDto } from "@apps/enrollment-service/dto";
import { EnrollmentService } from "@apps/enrollment-service/enrollment.service";
import { JwtPayload } from "@libs/common";
import { Matricula, TrasladoEstudiantil } from "@libs/database";

type TransferHarness = {
  resolveTransferType(
    matricula: Matricula,
    grupoOrigenId: string | null,
    dto: CrearTrasladoDto,
  ): string;
  assertTransferReadAccess(
    traslado: TrasladoEstudiantil,
    currentUser: JwtPayload,
  ): void;
  assertDestinationAccess(
    traslado: TrasladoEstudiantil,
    currentUser: JwtPayload,
  ): void;
  maxDate(first: string, second: string): string;
};

const ORIGEN = "10000000-0000-4000-8000-000000000001";
const DESTINO = "10000000-0000-4000-8000-000000000002";
const TERCERA = "10000000-0000-4000-8000-000000000003";

function payload(institucionId: string): JwtPayload {
  return {
    sub: "20000000-0000-4000-8000-000000000001",
    usuarioId: "20000000-0000-4000-8000-000000000001",
    institucionId,
    personaId: "30000000-0000-4000-8000-000000000001",
    roles: ["administrador_app_institucion"],
    superadministrador: false,
    sessionId: "40000000-0000-4000-8000-000000000001",
  };
}

function main() {
  const service = Object.create(EnrollmentService.prototype) as TransferHarness;
  const matricula = {
    institucionId: ORIGEN,
    sedeId: "50000000-0000-4000-8000-000000000001",
    anioLectivoId: "50000000-0000-4000-8000-000000000002",
    gradoId: "50000000-0000-4000-8000-000000000003",
    jornadaId: "50000000-0000-4000-8000-000000000004",
  } as Matricula;
  const base = {
    institucionDestinoId: ORIGEN,
    sedeDestinoId: matricula.sedeId,
    anioLectivoDestinoId: matricula.anioLectivoId,
    gradoDestinoId: matricula.gradoId,
    jornadaDestinoId: matricula.jornadaId,
    grupoDestinoId: "50000000-0000-4000-8000-000000000006",
  } as CrearTrasladoDto;
  const grupoOrigen = "50000000-0000-4000-8000-000000000005";

  assert.equal(
    service.resolveTransferType(matricula, grupoOrigen, base),
    "entre_grupos",
  );
  assert.equal(
    service.resolveTransferType(matricula, grupoOrigen, {
      ...base,
      sedeDestinoId: "50000000-0000-4000-8000-000000000007",
      grupoDestinoId: grupoOrigen,
    }),
    "entre_sedes",
  );
  assert.equal(
    service.resolveTransferType(matricula, grupoOrigen, {
      ...base,
      institucionDestinoId: DESTINO,
    }),
    "entre_instituciones",
  );
  assert.equal(
    service.resolveTransferType(matricula, grupoOrigen, {
      ...base,
      sedeDestinoId: "50000000-0000-4000-8000-000000000007",
    }),
    "mixto",
  );
  assert.throws(
    () =>
      service.resolveTransferType(matricula, grupoOrigen, {
        ...base,
        grupoDestinoId: grupoOrigen,
      }),
    BadRequestException,
  );

  const traslado = {
    institucionOrigenId: ORIGEN,
    institucionDestinoId: DESTINO,
  } as TrasladoEstudiantil;
  assert.doesNotThrow(() =>
    service.assertTransferReadAccess(traslado, payload(ORIGEN)),
  );
  assert.doesNotThrow(() =>
    service.assertTransferReadAccess(traslado, payload(DESTINO)),
  );
  assert.throws(
    () => service.assertTransferReadAccess(traslado, payload(TERCERA)),
    ForbiddenException,
  );
  assert.doesNotThrow(() =>
    service.assertDestinationAccess(traslado, payload(DESTINO)),
  );
  assert.throws(
    () => service.assertDestinationAccess(traslado, payload(ORIGEN)),
    ForbiddenException,
  );
  assert.equal(service.maxDate("2026-07-01", "2026-07-20"), "2026-07-20");

  console.log("Transfer workflow tests passed:");
  console.log("- tipos de traslado calculados desde el destino");
  console.log("- solicitudes sin cambio real rechazadas");
  console.log("- origen y destino pueden consultar");
  console.log("- solo destino puede decidir y ejecutar");
}

main();
