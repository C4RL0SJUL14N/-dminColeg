import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { Body, Controller, Module, Param, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Audit, AuditModule, AuditService, AUDIT_EVENT_TYPE, AUDIT_SEVERITY, configureAuditApplication, mergeAuditMetadata, setAuditAfterState, setAuditBeforeState, setAuditEntityId, sanitizeAuditPayload } from '@libs/audit';
import { configureApplication } from '@libs/common';
import { DatabaseModule } from '@libs/database';

const TEST_SERVICE = `test-audit-service-${Date.now()}`;
const TEST_MODULE = 'test-audit';

@Controller()
class TestAuditController {
  @Post('test-audit/login')
  @Audit({
    servicio: TEST_SERVICE,
    modulo: TEST_MODULE,
    entidad: 'usuario',
    accion: 'login',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  login(@Body() body: Record<string, unknown>, @Req() request: { headers: Record<string, string> }) {
    mergeAuditMetadata({ suite: 'audit-integration', customHeader: request.headers['x-suite-id'] });
    if (body.correo === 'bad@example.com') {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const usuarioId = crypto.randomUUID();
    setAuditEntityId(usuarioId);
    setAuditAfterState({ usuarioId, estado: 'autenticado' });
    return { ok: true, usuarioId };
  }

  @Patch('test-audit/personas/:id')
  @Audit({
    servicio: TEST_SERVICE,
    modulo: TEST_MODULE,
    entidad: 'persona',
    entidadIdParam: 'id',
    accion: 'actualizar-persona',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updatePersona(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    setAuditEntityId(id);
    setAuditBeforeState({ id, primerNombre: 'Antes' });
    setAuditAfterState({ id, primerNombre: body.primerNombre ?? 'Despues' });
    return { id, actualizado: true };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DatabaseModule.forRoot(),
    AuditModule.forRoot({ exposeController: true }),
  ],
  controllers: [TestAuditController],
})
class TestAuditModule {}

let app: Awaited<ReturnType<typeof createApp>>;
let baseUrl = '';
let auditService: AuditService;

async function createApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [TestAuditModule],
  }).compile();

  const nestApp = moduleRef.createNestApplication();
  configureAuditApplication(nestApp);
  configureApplication(nestApp, {
    appName: 'Audit Test',
    appDescription: 'Verificacion automatica de auditoria',
  });
  await nestApp.listen(0);
  return nestApp;
}

async function fetchJson(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    response,
    json: await response.json(),
  };
}

async function getLatestEvent(action: string) {
  const rows = await (auditService as any).dataSource.query(
    `
      select *
      from auditoria_eventos
      where servicio = $1 and modulo = $2 and accion = $3
      order by fecha_hora desc
      limit 1
    `,
    [TEST_SERVICE, TEST_MODULE, action],
  );

  return rows[0];
}

before(async () => {
  app = await createApp();
  const address = app.getHttpServer().address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  auditService = app.get(AuditService);
});

after(async () => {
  await app?.close();
});

test('sanitizeAuditPayload redacts secrets', () => {
  const sanitized = sanitizeAuditPayload({
    contrasena: 'Secret123!',
    refreshToken: 'abcdefghijklmnopqrstuvwxyz',
    nested: {
      authorization: 'Bearer token',
    },
  });

  assert.notEqual(sanitized.contrasena, 'Secret123!');
  assert.notEqual(sanitized.refreshToken, 'abcdefghijklmnopqrstuvwxyz');
  assert.equal(sanitized.nested.authorization, '[REDACTED]');
});

test('successful audited request stores sanitized payload and request identifiers', async () => {
  const { response, json } = await fetchJson('/test-audit/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'external-request-id',
      'x-suite-id': 'suite-success',
      authorization: 'Bearer sensitive-token',
    },
    body: JSON.stringify({
      correo: 'good@example.com',
      contrasena: 'SuperSecret123',
      refreshToken: '123456789012345678901234',
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(typeof json.data.usuarioId, 'string');
  assert.match(response.headers.get('x-request-id') ?? '', /^[0-9a-f-]{36}$/i);
  assert.equal(response.headers.get('x-correlation-id'), 'external-request-id');

  const event = await getLatestEvent('login');
  assert.equal(event.resultado, 'exito');
  assert.equal(event.tipo_evento, 'seguridad');
  assert.equal(event.correlation_id, 'external-request-id');
  assert.equal(event.payload_resumen_json.body.correo, 'good@example.com');
  assert.notEqual(event.payload_resumen_json.body.contrasena, 'SuperSecret123');
  assert.notEqual(event.payload_resumen_json.body.refreshToken, '123456789012345678901234');
  assert.equal(event.payload_resumen_json.headers.authorization, '[REDACTED]');
});

test('failed audited request stores fallo without stack traces', async () => {
  const { response } = await fetchJson('/test-audit/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-suite-id': 'suite-failure',
    },
    body: JSON.stringify({
      correo: 'bad@example.com',
      contrasena: 'BadSecret123',
    }),
  });

  assert.equal(response.status, 401);

  const event = await getLatestEvent('login');
  assert.equal(event.resultado, 'fallo');
  assert.equal(event.codigo_http, 401);
  assert.equal(event.error_codigo, 'UnauthorizedException');
  assert.match(event.error_resumen, /Credenciales invalidas/i);
  assert.equal(typeof event.error_resumen, 'string');
});

test('before and after snapshots are stored for audited updates', async () => {
  const personaId = crypto.randomUUID();
  const { response } = await fetchJson(`/test-audit/personas/${personaId}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      primerNombre: 'Despues',
      password: 'NoDebePersistirse',
    }),
  });

  assert.equal(response.status, 200);

  const event = await getLatestEvent('actualizar-persona');
  assert.equal(event.resultado, 'exito');
  assert.equal(event.antes_json.primerNombre, 'Antes');
  assert.equal(event.despues_json.primerNombre, 'Despues');
  assert.equal(event.payload_resumen_json.body.password !== 'NoDebePersistirse', true);
});

test('audit query endpoints return filtered data and totals', async () => {
  const listResult = await fetchJson(
    `/auditorias?servicio=${encodeURIComponent(TEST_SERVICE)}&modulo=${TEST_MODULE}&limit=10&offset=0`,
  );
  assert.equal(listResult.response.status, 200);
  assert.ok(Array.isArray(listResult.json.data.data));
  assert.ok(listResult.json.data.total >= 1);

  const summaryResult = await fetchJson(
    `/auditorias/resumen?servicio=${encodeURIComponent(TEST_SERVICE)}&modulo=${TEST_MODULE}&limit=10&offset=0`,
  );
  assert.equal(summaryResult.response.status, 200);
  assert.ok(Array.isArray(summaryResult.json.data.data));
  assert.ok(summaryResult.json.data.total >= 1);
});
