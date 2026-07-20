import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AUDIT_EVENT_TYPE,
  AUDIT_SCOPE,
  AUDIT_SEVERITY,
} from './audit.constants';
import { getAuditContext } from './audit.context';
import { sanitizeAuditError, sanitizeAuditPayload } from './audit.sanitizer';
import {
  AuditEventRecord,
  AuditOptions,
  AuditRequest,
  AuditSearchFilters,
  AuditSummaryRecord,
  RegisterAuditEventInput,
} from './audit.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly dataSource: DataSource) {}

  async registerHttpEvent(input: RegisterAuditEventInput): Promise<void> {
    try {
      const { options, request, responseBody, statusCode, result, error } = input;
      const principal = request.user ?? {};
      const context = getAuditContext();
      const { errorCodigo, errorResumen } = sanitizeAuditError(error);

      const payloadResumen = options.capturarPayload
        ? sanitizeAuditPayload({
            params: request.params,
            query: request.query,
            body: request.body,
            headers: {
              authorization: request.headers.authorization,
              'user-agent': request.headers['user-agent'],
            },
          })
        : null;

      const metadataJson = sanitizeAuditPayload({
        requestId: request.requestId ?? context?.requestId ?? null,
        correlationId: request.correlationId ?? context?.correlationId ?? null,
        ...(context?.metadata ?? {}),
      });

      const entidadId =
        context?.entityId ??
        this.resolveEntityId(options, request, responseBody) ??
        principal.usuarioId ??
        null;

      const tipoEvento = this.resolveEventType(input);
      const severidad = this.resolveSeverity(input);

      await this.dataSource.query(
        `
          select registrar_evento_auditoria(
            $1::uuid, $2::varchar, $3::uuid, $4::uuid, $5::uuid, $6::uuid, $7::uuid, $8::boolean,
            $9::varchar, $10::varchar, $11::auditoria_ambito_enum, $12::varchar, $13::varchar,
            $14::varchar, $15::uuid, $16::varchar, $17::auditoria_tipo_evento_enum,
            $18::auditoria_severidad_enum, $19::auditoria_resultado_enum, $20::varchar,
            $21::varchar, $22::integer, $23::inet, $24::text, $25::jsonb, $26::jsonb, $27::jsonb,
            $28::varchar, $29::text, $30::jsonb
          )
        `,
        [
          request.requestId ?? context?.requestId ?? null,
          request.correlationId ?? context?.correlationId ?? null,
          principal.usuarioId ?? null,
          principal.personaId ?? null,
          principal.institucionId ?? this.resolveInstitutionId(request) ?? null,
          this.resolveSedeId(request) ?? null,
          principal.perfilIdSeleccionado ?? null,
          Boolean(principal.superadministrador),
          principal.roles?.[0] ?? null,
          principal.perfilCodigoSeleccionado ?? null,
          this.resolveScope(options, principal.institucionId, this.resolveSedeId(request)),
          options.servicio,
          options.modulo,
          options.entidad,
          entidadId,
          options.accion,
          tipoEvento,
          severidad,
          result,
          request.method,
          request.route?.path ? `${request.baseUrl}${request.route.path}` : request.originalUrl,
          statusCode,
          this.normalizeIp(request.ip),
          String(request.headers['user-agent'] ?? ''),
          payloadResumen ? JSON.stringify(payloadResumen) : null,
          options.capturarAntes && context?.before !== undefined
            ? JSON.stringify(sanitizeAuditPayload(context.before))
            : null,
          options.capturarDespues
            ? JSON.stringify(sanitizeAuditPayload(context?.after ?? responseBody ?? null))
            : null,
          errorCodigo,
          errorResumen,
          metadataJson ? JSON.stringify(metadataJson) : null,
        ],
      );
    } catch (registerError) {
      this.logger.error('No se pudo registrar el evento de auditoria', registerError as Error);
    }
  }

  async searchEvents(filters: AuditSearchFilters): Promise<{ data: AuditEventRecord[]; total: number }> {
    const rows = (await this.dataSource.query(
      `
        select *
        from buscar_auditoria_eventos(
          $1::timestamptz, $2::timestamptz, $3::uuid, $4::uuid, $5::varchar, $6::varchar,
          $7::varchar, $8::varchar, $9::uuid, $10::varchar, $11::varchar, $12::varchar,
          $13::varchar, $14::integer, $15::integer
        )
      `,
      [
        filters.fechaDesde ?? null,
        filters.fechaHasta ?? null,
        filters.institucionId ?? null,
        filters.usuarioId ?? null,
        filters.tipoEvento ?? null,
        filters.resultado ?? null,
        filters.severidad ?? null,
        filters.entidad ?? null,
        filters.entidadId ?? null,
        filters.accion ?? null,
        filters.servicio ?? null,
        filters.modulo ?? null,
        filters.texto ?? null,
        filters.limit ?? 50,
        filters.offset ?? 0,
      ],
    )) as AuditEventRecord[];

    const totalResult = await this.dataSource.query(
      `
        select contar_auditoria_eventos(
          $1::timestamptz, $2::timestamptz, $3::uuid, $4::uuid, $5::varchar, $6::varchar,
          $7::varchar, $8::varchar, $9::uuid, $10::varchar, $11::varchar, $12::varchar, $13::varchar
        ) as total
      `,
      [
        filters.fechaDesde ?? null,
        filters.fechaHasta ?? null,
        filters.institucionId ?? null,
        filters.usuarioId ?? null,
        filters.tipoEvento ?? null,
        filters.resultado ?? null,
        filters.severidad ?? null,
        filters.entidad ?? null,
        filters.entidadId ?? null,
        filters.accion ?? null,
        filters.servicio ?? null,
        filters.modulo ?? null,
        filters.texto ?? null,
      ],
    );

    return {
      data: rows,
      total: Number(totalResult[0]?.total ?? 0),
    };
  }

  async getSummary(filters: AuditSearchFilters): Promise<{ data: AuditSummaryRecord[]; total: number }> {
    const { whereSql, params } = this.buildSummaryWhereClause(filters);
    const rows = (await this.dataSource.query(
      `
        select *
        from vw_auditoria_eventos_resumen
        ${whereSql}
        order by fecha_hora desc
        limit $${params.length + 1}
        offset $${params.length + 2}
      `,
      [...params, filters.limit ?? 50, filters.offset ?? 0],
    )) as AuditSummaryRecord[];

    const total = await this.searchEvents({ ...filters, limit: 1, offset: 0 });
    return { data: rows, total: total.total };
  }

  private buildSummaryWhereClause(filters: AuditSearchFilters): { whereSql: string; params: unknown[] } {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const addClause = (sql: string, value: unknown) => {
      params.push(value);
      clauses.push(sql.replace('?', `$${params.length}`));
    };

    if (filters.fechaDesde) addClause('fecha_hora >= ?', filters.fechaDesde);
    if (filters.fechaHasta) addClause('fecha_hora <= ?', filters.fechaHasta);
    if (filters.institucionId) addClause('institucion_id = ?', filters.institucionId);
    if (filters.usuarioId) addClause('usuario_id = ?', filters.usuarioId);
    if (filters.tipoEvento) addClause('tipo_evento::text = ?', filters.tipoEvento);
    if (filters.resultado) addClause('resultado::text = ?', filters.resultado);
    if (filters.severidad) addClause('severidad::text = ?', filters.severidad);
    if (filters.entidad) addClause('entidad = ?', filters.entidad);
    if (filters.entidadId) addClause('entidad_id = ?', filters.entidadId);
    if (filters.accion) addClause('accion = ?', filters.accion);
    if (filters.servicio) addClause('servicio = ?', filters.servicio);
    if (filters.modulo) addClause('modulo = ?', filters.modulo);
    if (filters.texto) {
      addClause(
        `(coalesce(servicio, '') ilike ? or coalesce(modulo, '') ilike ? or coalesce(entidad, '') ilike ? or coalesce(accion, '') ilike ? or coalesce(error_codigo, '') ilike ?)`,
        `%${filters.texto}%`,
      );
      const repeated = params[params.length - 1];
      params.push(repeated, repeated, repeated, repeated);
      clauses[clauses.length - 1] = clauses[clauses.length - 1]
        .replace('?', `$${params.length - 4}`)
        .replace('?', `$${params.length - 3}`)
        .replace('?', `$${params.length - 2}`)
        .replace('?', `$${params.length - 1}`)
        .replace('?', `$${params.length}`);
    }

    return {
      whereSql: clauses.length ? `where ${clauses.join(' and ')}` : '',
      params,
    };
  }

  private resolveEventType(input: RegisterAuditEventInput) {
    if (input.overrideType) {
      return input.overrideType;
    }

    if (input.statusCode === 401 || input.statusCode === 403) {
      return AUDIT_EVENT_TYPE.SEGURIDAD;
    }

    return input.options.tipoEvento;
  }

  private resolveSeverity(input: RegisterAuditEventInput) {
    if (input.overrideSeverity) {
      return input.overrideSeverity;
    }

    if (input.statusCode >= 500) {
      return AUDIT_SEVERITY.CRITICAL;
    }

    if (input.statusCode === 401 || input.statusCode === 403) {
      return AUDIT_SEVERITY.ERROR;
    }

    if (input.statusCode >= 400) {
      return AUDIT_SEVERITY.WARN;
    }

    return input.options.severidad ?? AUDIT_SEVERITY.INFO;
  }

  private resolveScope(options: AuditOptions, institucionId?: string | null, sedeId?: string | null) {
    if (options.ambitoOperacion) {
      return options.ambitoOperacion;
    }

    if (sedeId) {
      return AUDIT_SCOPE.SEDE;
    }

    return institucionId ? AUDIT_SCOPE.INSTITUCIONAL : AUDIT_SCOPE.GLOBAL;
  }

  private resolveInstitutionId(request: AuditRequest): string | null {
    const candidate =
      (typeof request.body?.institucionId === 'string' && request.body.institucionId) ||
      (typeof request.params?.id === 'string' && request.originalUrl.includes('instituciones/')
        ? request.params.id
        : null) ||
      (typeof request.query?.institucionId === 'string' ? request.query.institucionId : null);

    return candidate ?? null;
  }

  private resolveSedeId(request: AuditRequest): string | null {
    if (typeof request.body?.sedeId === 'string') {
      return request.body.sedeId;
    }

    return null;
  }

  private resolveEntityId(options: AuditOptions, request: AuditRequest, responseBody: unknown): string | null {
    const responseData =
      responseBody && typeof responseBody === 'object' && 'data' in (responseBody as Record<string, unknown>)
        ? (responseBody as Record<string, unknown>).data
        : responseBody;

    if (options.entidadIdParam && typeof request.params?.[options.entidadIdParam] === 'string') {
      return String(request.params[options.entidadIdParam]);
    }

    if (options.entidadIdBodyKey && typeof request.body?.[options.entidadIdBodyKey] === 'string') {
      return request.body[options.entidadIdBodyKey] as string;
    }

    if (
      options.entidadIdResponseKey &&
      responseData &&
      typeof responseData === 'object' &&
      typeof (responseData as Record<string, unknown>)[options.entidadIdResponseKey] === 'string'
    ) {
      return (responseData as Record<string, unknown>)[options.entidadIdResponseKey] as string;
    }

    if (responseData && typeof responseData === 'object' && typeof (responseData as Record<string, unknown>).id === 'string') {
      return (responseData as Record<string, unknown>).id as string;
    }

    return null;
  }

  private normalizeIp(ip?: string | null): string | null {
    if (!ip) {
      return null;
    }

    return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  }
}
