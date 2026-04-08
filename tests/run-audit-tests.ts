import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { Body, Controller, Global, Module, Param, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { DataSource } from 'typeorm';
import {
  Audit,
  AuditModule,
  AuditService,
  AUDIT_EVENT_TYPE,
  AUDIT_SEVERITY,
  configureAuditApplication,
  mergeAuditMetadata,
  sanitizeAuditPayload,
  setAuditAfterState,
  setAuditBeforeState,
  setAuditEntityId,
} from '@libs/audit';
import { configureApplication } from '@libs/common';

process.env.DB_SSL = process.env.DB_SSL ?? 'true';
process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client }: { Client: new (config: Record<string, unknown>) => any } = require('pg');

const TEST_SERVICE = `test-audit-service-${Date.now()}`;
const TEST_MODULE = 'test-audit';

class TestLoginDto {
  @IsEmail()
  correo!: string;

  @IsString()
  contrasena!: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

class TestUpdatePersonaDto {
  @IsString()
  primerNombre!: string;

  @IsOptional()
  @IsString()
  password?: string;
}

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
  login(@Body() body: TestLoginDto, @Req() request: { headers: Record<string, string> }) {
    mergeAuditMetadata({
      suite: 'audit-integration',
      customHeader: request.headers['x-suite-id'],
    });
    const usuarioId = randomUUID();
    setAuditEntityId(usuarioId);
    setAuditAfterState({ usuarioId, estado: 'autenticado' });
    return { ok: true, usuarioId };
  }

  @Post('test-audit/login-fail')
  @Audit({
    servicio: TEST_SERVICE,
    modulo: TEST_MODULE,
    entidad: 'usuario',
    accion: 'login',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
  })
  loginFail() {
    throw new UnauthorizedException('Credenciales invalidas');
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
  updatePersona(@Param('id') id: string, @Body() body: TestUpdatePersonaDto) {
    setAuditEntityId(id);
    setAuditBeforeState({ id, primerNombre: 'Antes' });
    setAuditAfterState({ id, primerNombre: body.primerNombre ?? 'Despues' });
    return { id, actualizado: true };
  }
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const client = new Client({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
          ssl:
            configService.get('DB_SSL', 'true') === 'true'
              ? { rejectUnauthorized: false }
              : false,
        });
        await client.connect();

        return {
          query: async (sql: string, params: unknown[]) => {
            const result = await client.query(sql, params);
            return result.rows;
          },
          destroy: async () => {
            await client.end();
          },
        } as Pick<DataSource, 'query' | 'destroy'> as DataSource;
      },
    },
  ],
  exports: [DataSource],
})
class TestDatabaseModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    TestDatabaseModule,
    AuditModule.forRoot({ exposeController: true }),
  ],
  controllers: [TestAuditController],
})
class TestAuditModule {}

async function main() {
  const results: string[] = [];
  const moduleRef = await Test.createTestingModule({
    imports: [TestAuditModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'Audit Test',
    appDescription: 'Verificacion automatica de auditoria',
  });
  await app.listen(0);

  try {
    const address = app.getHttpServer().address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const auditService = app.get(AuditService);
    const dataSource = app.get(DataSource);

    const fetchJson = async (path: string, init?: RequestInit) => {
      const response = await fetch(`${baseUrl}${path}`, init);
      return {
        response,
        json: await response.json(),
      };
    };

    const getLatestEvent = async (action: string) => {
      const rows = await dataSource.query(
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
    };

    const sanitized = sanitizeAuditPayload({
      contrasena: 'Secret123!',
      refreshToken: 'abcdefghijklmnopqrstuvwxyz',
      nested: { authorization: 'Bearer token' },
    });
    assert.notEqual(sanitized.contrasena, 'Secret123!');
    assert.notEqual(sanitized.refreshToken, 'abcdefghijklmnopqrstuvwxyz');
    assert.equal(sanitized.nested.authorization, '[REDACTED]');
    results.push('sanitizacion ok');

    const success = await fetchJson('/test-audit/login', {
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
    assert.equal(success.response.status, 201);
    assert.equal(typeof success.json.data.usuarioId, 'string');
    assert.match(success.response.headers.get('x-request-id') ?? '', /^[0-9a-f-]{36}$/i);
    assert.equal(success.response.headers.get('x-correlation-id'), 'external-request-id');

    const successEvent = await getLatestEvent('login');
    assert.equal(successEvent.resultado, 'exito');
    assert.equal(successEvent.correlation_id, 'external-request-id');
    assert.notEqual(successEvent.payload_resumen_json.body.contrasena, 'SuperSecret123');
    assert.notEqual(
      successEvent.payload_resumen_json.body.refreshToken,
      '123456789012345678901234',
    );
    assert.equal(successEvent.payload_resumen_json.headers.authorization, '[REDACTED]');
    results.push('registro exitoso ok');

    await auditService.registerHttpEvent({
      options: {
        servicio: TEST_SERVICE,
        modulo: TEST_MODULE,
        entidad: 'usuario',
        accion: 'login',
        tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
        severidad: AUDIT_SEVERITY.INFO,
        capturarPayload: true,
      },
      request: {
        method: 'POST',
        originalUrl: '/test-audit/login-fail',
        route: { path: '/test-audit/login-fail' },
        baseUrl: '',
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'audit-test',
        },
        body: {
          correo: 'bad@example.com',
          contrasena: 'BadSecret123',
        },
        params: {},
        query: {},
        requestId: randomUUID(),
        correlationId: 'manual-failure',
      } as any,
      error: new UnauthorizedException('Credenciales invalidas'),
      result: 'fallo',
      statusCode: 401,
    });
    const failureEvent = await getLatestEvent('login');
    assert.equal(failureEvent.resultado, 'fallo');
    assert.equal(failureEvent.codigo_http, 401);
    assert.equal(failureEvent.error_codigo, 'UnauthorizedException');
    assert.match(failureEvent.error_resumen, /Credenciales invalidas/i);
    results.push('registro fallo ok');

    const personaId = randomUUID();
    const update = await fetchJson(`/test-audit/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        primerNombre: 'Despues',
        password: 'NoDebePersistirse',
      }),
    });
    assert.equal(update.response.status, 200);
    const updateEvent = await getLatestEvent('actualizar-persona');
    assert.equal(updateEvent.antes_json.primerNombre, 'Antes');
    assert.equal(updateEvent.despues_json.primerNombre, 'Despues');
    assert.notEqual(updateEvent.payload_resumen_json.body.password, 'NoDebePersistirse');
    results.push('antes y despues ok');

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
    results.push('consultas administrativas ok');

    console.log('Audit tests passed:');
    for (const result of results) {
      console.log(`- ${result}`);
    }
  } finally {
    const dataSource = app.get(DataSource) as DataSource & { destroy?: () => Promise<void> };
    await dataSource.destroy?.();
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
