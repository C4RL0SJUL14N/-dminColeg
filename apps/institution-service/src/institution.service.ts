import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import {
  setAuditAfterState,
  setAuditBeforeState,
  setAuditEntityId,
} from '@libs/audit';
import { JwtPayload } from '@libs/common';
import {
  AnioLectivo,
  ConfiguracionInstitucion,
  EscalaValoracion,
  Institucion,
  NivelEscalaValoracion,
  PeriodoAcademico,
  Sede,
} from '@libs/database';
import {
  ActualizarAnioLectivoDto,
  ActualizarEscalaValoracionDto,
  ActualizarInstitucionDto,
  ActualizarSedeDto,
  ConfiguracionInstitucionDto,
  CrearAnioLectivoDto,
  CrearEscalaValoracionDto,
  CrearInstitucionDto,
  CrearPeriodoAcademicoDto,
  CrearSedeDto,
} from './dto';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institucion)
    private readonly institucionesRepository: Repository<Institucion>,
    @InjectRepository(Sede)
    private readonly sedesRepository: Repository<Sede>,
    @InjectRepository(AnioLectivo)
    private readonly aniosLectivosRepository: Repository<AnioLectivo>,
    @InjectRepository(PeriodoAcademico)
    private readonly periodosRepository: Repository<PeriodoAcademico>,
    @InjectRepository(ConfiguracionInstitucion)
    private readonly configuracionesRepository: Repository<ConfiguracionInstitucion>,
    @InjectRepository(EscalaValoracion)
    private readonly escalasRepository: Repository<EscalaValoracion>,
    @InjectRepository(NivelEscalaValoracion)
    private readonly nivelesRepository: Repository<NivelEscalaValoracion>,
  ) {}

  async createInstitucion(dto: CrearInstitucionDto, currentUser: JwtPayload) {
    if (!currentUser.superadministrador) {
      throw new ForbiddenException(
        'Solo el superadministrador puede crear instituciones',
      );
    }

    const institucion = await this.institucionesRepository.save(
      this.institucionesRepository.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(institucion.id);
    setAuditAfterState(institucion);
    return institucion;
  }

  findInstituciones(currentUser: JwtPayload) {
    if (currentUser.superadministrador) {
      return this.institucionesRepository.find({ order: { nombre: 'ASC' } });
    }

    return this.institucionesRepository.find({
      where: { id: currentUser.institucionId ?? undefined },
      order: { nombre: 'ASC' },
    });
  }

  async findInstitucionById(id: string) {
    const institucion = await this.institucionesRepository.findOneBy({ id });
    if (!institucion) {
      throw new NotFoundException('Institucion no encontrada');
    }

    return institucion;
  }

  async updateInstitucion(id: string, dto: ActualizarInstitucionDto) {
    const institucion = await this.findInstitucionById(id);
    setAuditEntityId(id);
    setAuditBeforeState(institucion);
    Object.assign(institucion, dto);
    const updated = await this.institucionesRepository.save(institucion);
    setAuditAfterState(updated);
    return updated;
  }

  async createSede(institucionId: string, dto: CrearSedeDto) {
    await this.findInstitucionById(institucionId);
    let sede: Sede;
    try {
      sede = await this.sedesRepository.save(
        this.sedesRepository.create({
          institucionId,
          codigo: dto.codigo.trim().toUpperCase(),
          nombre: dto.nombre.trim(),
          activo: true,
          eliminadoEn: null,
          version: 1,
        }),
      );
    } catch (error) {
      this.handleSedeUniqueError(error);
      throw error;
    }
    setAuditEntityId(sede.id);
    setAuditAfterState(sede);
    return sede;
  }

  findSedes(institucionId: string) {
    return this.sedesRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      order: { nombre: 'ASC' },
    });
  }

  async updateSede(
    institucionId: string,
    sedeId: string,
    dto: ActualizarSedeDto,
  ) {
    const sede = await this.findSedeById(institucionId, sedeId);
    setAuditEntityId(sede.id);
    setAuditBeforeState(sede);
    if (dto.nombre !== undefined) sede.nombre = dto.nombre.trim();
    if (dto.activo !== undefined) sede.activo = dto.activo;
    sede.version += 1;

    try {
      const updated = await this.sedesRepository.save(sede);
      setAuditAfterState(updated);
      return updated;
    } catch (error) {
      this.handleSedeUniqueError(error);
      throw error;
    }
  }

  async deleteSede(institucionId: string, sedeId: string) {
    const sede = await this.findSedeById(institucionId, sedeId);
    setAuditEntityId(sede.id);
    setAuditBeforeState(sede);
    sede.activo = false;
    sede.eliminadoEn = new Date();
    sede.version += 1;
    const deleted = await this.sedesRepository.save(sede);
    setAuditAfterState(deleted);
    return deleted;
  }

  async createAnioLectivo(institucionId: string, dto: CrearAnioLectivoDto) {
    await this.findInstitucionById(institucionId);
    this.assertAnioLectivoDates(dto.fechaInicio, dto.fechaFin);
    let anio: AnioLectivo;
    try {
      anio = await this.aniosLectivosRepository.save(
        this.aniosLectivosRepository.create({
          codigo: randomUUID().slice(0, 8),
          institucionId,
          nombre: dto.nombre.trim(),
          anio: new Date(dto.fechaInicio).getUTCFullYear(),
          fechaInicio: dto.fechaInicio,
          fechaFin: dto.fechaFin,
          estado: 'activo',
          eliminadoEn: null,
          version: 1,
        }),
      );
    } catch (error) {
      this.handleAnioLectivoUniqueError(error);
      throw error;
    }
    setAuditEntityId(anio.id);
    setAuditAfterState(anio);
    return anio;
  }

  findAniosLectivos(institucionId: string) {
    return this.aniosLectivosRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      order: { fechaInicio: 'DESC' },
    });
  }

  async updateAnioLectivo(
    institucionId: string,
    anioId: string,
    dto: ActualizarAnioLectivoDto,
  ) {
    const anio = await this.findAnioLectivoInstitucion(institucionId, anioId);
    if (anio.estado === 'cerrado') {
      throw new ConflictException(
        'Un año lectivo cerrado no puede modificarse',
      );
    }

    const fechaInicio = dto.fechaInicio ?? anio.fechaInicio;
    const fechaFin = dto.fechaFin ?? anio.fechaFin;
    this.assertAnioLectivoDates(fechaInicio, fechaFin);
    if (dto.fechaInicio !== undefined || dto.fechaFin !== undefined) {
      const periodosFueraDeRango = await this.periodosRepository
        .createQueryBuilder('periodo')
        .where('periodo.anioLectivoId = :anioId', { anioId })
        .andWhere('periodo.eliminadoEn IS NULL')
        .andWhere(
          '(periodo.fechaInicio < :fechaInicio OR periodo.fechaFin > :fechaFin)',
          { fechaInicio, fechaFin },
        )
        .getCount();
      if (periodosFueraDeRango > 0) {
        throw new BadRequestException(
          'Las fechas deben contener todos los períodos académicos existentes',
        );
      }
    }
    setAuditEntityId(anio.id);
    setAuditBeforeState(anio);
    if (dto.nombre !== undefined) anio.nombre = dto.nombre.trim();
    if (dto.fechaInicio !== undefined) {
      anio.fechaInicio = dto.fechaInicio;
      anio.anio = new Date(dto.fechaInicio).getUTCFullYear();
    }
    if (dto.fechaFin !== undefined) anio.fechaFin = dto.fechaFin;
    if (dto.estado !== undefined) anio.estado = dto.estado;
    anio.version += 1;

    try {
      const updated = await this.aniosLectivosRepository.save(anio);
      setAuditAfterState(updated);
      return updated;
    } catch (error) {
      this.handleAnioLectivoUniqueError(error);
      throw error;
    }
  }

  async deleteAnioLectivo(institucionId: string, anioId: string) {
    const anio = await this.findAnioLectivoInstitucion(institucionId, anioId);
    setAuditEntityId(anio.id);
    setAuditBeforeState(anio);
    anio.eliminadoEn = new Date();
    anio.version += 1;
    const deleted = await this.aniosLectivosRepository.save(anio);
    setAuditAfterState(deleted);
    return deleted;
  }

  async createPeriodo(
    anioLectivoId: string,
    dto: CrearPeriodoAcademicoDto,
    currentUser: JwtPayload,
  ) {
    await this.findAnioLectivoById(anioLectivoId, currentUser);
    const periodo = await this.periodosRepository.save(
      this.periodosRepository.create({
        codigo: randomUUID().slice(0, 8),
        anioLectivoId,
        nombre: dto.nombre,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        orden: dto.orden,
        estado: 'abierto',
        modoCierre: 'manual',
        cerradoPorUsuarioId: null,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(periodo.id);
    setAuditAfterState(periodo);
    return periodo;
  }

  async findPeriodos(anioLectivoId: string, currentUser: JwtPayload) {
    await this.findAnioLectivoById(anioLectivoId, currentUser);
    return this.periodosRepository.find({
      where: { anioLectivoId },
      order: { orden: 'ASC' },
    });
  }

  async cerrarPeriodo(periodoId: string, currentUser: JwtPayload) {
    const periodo = await this.findPeriodoById(periodoId, currentUser);
    setAuditEntityId(periodo.id);
    setAuditBeforeState({ ...periodo });

    periodo.estado = 'cerrado';
    const updated = await this.periodosRepository.save(periodo);
    setAuditAfterState(updated);
    return updated;
  }

  async upsertConfiguracion(
    institucionId: string,
    dto: ConfiguracionInstitucionDto,
  ) {
    await this.findInstitucionById(institucionId);
    setAuditEntityId(institucionId);
    const existente = await this.configuracionesRepository.findOne({
      where: { institucionId },
    });

    if (existente) {
      setAuditBeforeState(existente);
      existente.modeloPedagogico =
        (dto.configuracion?.modeloPedagogico as string | undefined) ??
        dto.idioma ??
        existente.modeloPedagogico;
      existente.enfoquePedagogico =
        (dto.configuracion?.enfoquePedagogico as string | undefined) ??
        dto.zonaHoraria ??
        existente.enfoquePedagogico;
      existente.tipoEscalaValoracion =
        (dto.configuracion?.tipoEscalaValoracion as string | undefined) ??
        existente.tipoEscalaValoracion;
      const updated = await this.configuracionesRepository.save(existente);
      setAuditAfterState(updated);
      return updated;
    }

    const created = await this.configuracionesRepository.save(
      this.configuracionesRepository.create({
        institucionId,
        logoUrl: null,
        modeloPedagogico:
          (dto.configuracion?.modeloPedagogico as string | undefined) ??
          dto.idioma ??
          null,
        enfoquePedagogico:
          (dto.configuracion?.enfoquePedagogico as string | undefined) ??
          dto.zonaHoraria ??
          null,
        tipoEscalaValoracion:
          (dto.configuracion?.tipoEscalaValoracion as string | undefined) ??
          'numerica',
        actualizadoPorUsuarioId: null,
        version: 1,
      }),
    );
    setAuditAfterState(created);
    return created;
  }

  async getConfiguracion(institucionId: string) {
    await this.findInstitucionById(institucionId);
    return this.configuracionesRepository.findOne({
      where: { institucionId },
    });
  }

  async createEscalaValoracion(
    institucionId: string,
    dto: CrearEscalaValoracionDto,
  ) {
    await this.findInstitucionById(institucionId);
    this.assertEscalaNiveles(dto.niveles);
    const nombre = dto.nombre.trim();
    const existente = await this.escalasRepository.findOne({
      where: { institucionId, nombre },
    });
    if (existente) {
      throw new ConflictException(
        `Ya existe una escala de valoración llamada "${nombre}"`,
      );
    }

    try {
      await this.escalasRepository.manager.transaction(async (manager) => {
        const escala = await manager.save(
          manager.create(EscalaValoracion, {
            institucionId,
            nombre,
            tipo: 'numerica',
            valorMinimo: dto.niveles[0]?.valorMinimo ?? null,
            valorMaximo:
              dto.niveles[dto.niveles.length - 1]?.valorMaximo ?? null,
            valorAprobacion: null,
            esPredeterminada: false,
            activo: true,
          }),
        );

        await manager.save(
          NivelEscalaValoracion,
          dto.niveles.map((nivel) =>
            manager.create(NivelEscalaValoracion, {
              escalaValoracionId: escala.id,
              nombre: nivel.nombre.trim(),
              etiquetaCorta: nivel.codigo.trim().toUpperCase(),
              valorMinimo: nivel.valorMinimo,
              valorMaximo: nivel.valorMaximo,
              orden: nivel.orden,
              colorHex: null,
            }),
          ),
        );
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          `Ya existe una escala de valoración llamada "${nombre}"`,
        );
      }
      throw error;
    }

    return this.findEscalasValoracion(institucionId);
  }

  async updateEscalaValoracion(
    institucionId: string,
    escalaId: string,
    dto: ActualizarEscalaValoracionDto,
  ) {
    const escala = await this.findEscalaValoracionById(institucionId, escalaId);
    const nivelesAntes = await this.nivelesRepository.find({
      where: { escalaValoracionId: escalaId },
      order: { orden: 'ASC' },
    });
    setAuditEntityId(escala.id);
    setAuditBeforeState({ ...escala, niveles: nivelesAntes });
    if (dto.niveles) this.assertEscalaNiveles(dto.niveles);

    try {
      await this.escalasRepository.manager.transaction(async (manager) => {
        if (dto.nombre !== undefined) escala.nombre = dto.nombre.trim();
        if (dto.activo !== undefined) escala.activo = dto.activo;

        if (dto.niveles) {
          const existentes = await manager.find(NivelEscalaValoracion, {
            where: { escalaValoracionId: escalaId },
          });
          const porId = new Map(existentes.map((nivel) => [nivel.id, nivel]));
          const conservados = new Set<string>();
          const actualizados = dto.niveles.map((nivel) => {
            const codigo = nivel.codigo.trim().toUpperCase();
            if (!nivel.id) {
              return manager.create(NivelEscalaValoracion, {
                escalaValoracionId: escalaId,
                nombre: nivel.nombre.trim(),
                etiquetaCorta: codigo,
                valorMinimo: nivel.valorMinimo,
                valorMaximo: nivel.valorMaximo,
                orden: nivel.orden,
                colorHex: null,
              });
            }

            const existente = porId.get(nivel.id);
            if (!existente) {
              throw new BadRequestException(
                'Uno de los niveles no pertenece a la escala de valoración',
              );
            }
            if (existente.etiquetaCorta !== codigo) {
              throw new BadRequestException(
                'Los códigos de los niveles no pueden modificarse',
              );
            }
            conservados.add(existente.id);
            existente.nombre = nivel.nombre.trim();
            existente.valorMinimo = nivel.valorMinimo;
            existente.valorMaximo = nivel.valorMaximo;
            existente.orden = nivel.orden;
            return existente;
          });

          const eliminados = existentes.filter(
            (nivel) => !conservados.has(nivel.id),
          );
          if (eliminados.length) await manager.remove(eliminados);
          await manager.save(NivelEscalaValoracion, actualizados);

          const ordenados = [...dto.niveles].sort(
            (left, right) => left.orden - right.orden,
          );
          escala.valorMinimo = ordenados[0]?.valorMinimo ?? null;
          escala.valorMaximo =
            ordenados[ordenados.length - 1]?.valorMaximo ?? null;
        }

        await manager.save(EscalaValoracion, escala);
      });
    } catch (error) {
      this.handleEscalaValoracionUniqueError(
        error,
        dto.nombre ?? escala.nombre,
      );
      throw error;
    }

    const result = await this.findEscalasValoracion(institucionId);
    setAuditAfterState(result.find((item) => item.id === escalaId));
    return result;
  }

  async deleteEscalaValoracion(institucionId: string, escalaId: string) {
    const escala = await this.findEscalaValoracionById(institucionId, escalaId);
    const niveles = await this.nivelesRepository.find({
      where: { escalaValoracionId: escalaId },
      order: { orden: 'ASC' },
    });
    setAuditEntityId(escala.id);
    setAuditBeforeState({ ...escala, niveles });
    await this.escalasRepository.remove(escala);
    setAuditAfterState({ id: escalaId, eliminado: true });
    return this.findEscalasValoracion(institucionId);
  }

  async findEscalasValoracion(institucionId: string) {
    const escalas = await this.escalasRepository.find({
      where: { institucionId },
      order: { nombre: 'ASC' },
    });

    const result = [];
    for (const escala of escalas) {
      const niveles = await this.nivelesRepository.find({
        where: { escalaValoracionId: escala.id },
        order: { orden: 'ASC' },
      });
      result.push({ ...escala, niveles });
    }

    return result;
  }

  private async findAnioLectivoInstitucion(
    institucionId: string,
    anioId: string,
  ) {
    const anio = await this.aniosLectivosRepository.findOneBy({
      id: anioId,
      institucionId,
      eliminadoEn: IsNull(),
    });
    if (!anio) {
      throw new NotFoundException('Año lectivo no encontrado');
    }
    return anio;
  }

  private assertAnioLectivoDates(fechaInicio: string, fechaFin: string) {
    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de finalización debe ser posterior a la fecha de inicio',
      );
    }
  }

  private handleAnioLectivoUniqueError(error: unknown): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        'Ya existe un año lectivo para ese año en la institución',
      );
    }
  }

  private async findEscalaValoracionById(
    institucionId: string,
    escalaId: string,
  ) {
    const escala = await this.escalasRepository.findOneBy({
      id: escalaId,
      institucionId,
    });
    if (!escala) {
      throw new NotFoundException('Escala de valoración no encontrada');
    }
    return escala;
  }

  private assertEscalaNiveles(
    niveles: Array<{ valorMinimo: string; valorMaximo: string }>,
  ) {
    if (
      niveles.some((nivel) => {
        const minimo = Number(nivel.valorMinimo);
        const maximo = Number(nivel.valorMaximo);
        return (
          !Number.isFinite(minimo) ||
          !Number.isFinite(maximo) ||
          minimo > maximo
        );
      })
    ) {
      throw new BadRequestException(
        'Los rangos de los niveles de valoración no son válidos',
      );
    }
  }

  private handleEscalaValoracionUniqueError(
    error: unknown,
    nombre: string,
  ): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        `Ya existe una escala de valoración llamada "${nombre.trim()}"`,
      );
    }
  }

  private async findSedeById(institucionId: string, sedeId: string) {
    const sede = await this.sedesRepository.findOneBy({
      id: sedeId,
      institucionId,
      eliminadoEn: IsNull(),
    });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }
    return sede;
  }

  private handleSedeUniqueError(error: unknown): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      const constraint = (error.driverError as { constraint?: string })
        .constraint;
      throw new ConflictException(
        constraint === 'uq_sedes_institucion_nombre' ||
          constraint === 'uq_sedes_institucion_nombre_activas'
          ? 'Ya existe una sede con ese nombre en la institución'
          : 'Ya existe una sede con ese código',
      );
    }
  }

  private async findAnioLectivoById(id: string, currentUser?: JwtPayload) {
    const anio = await this.aniosLectivosRepository.findOneBy({
      id,
      eliminadoEn: IsNull(),
    });
    if (!anio) {
      throw new NotFoundException('Anio lectivo no encontrado');
    }

    this.assertInstitutionAccess(anio.institucionId, currentUser);

    return anio;
  }

  private async findPeriodoById(id: string, currentUser?: JwtPayload) {
    const periodo = await this.periodosRepository.findOneBy({ id });
    if (!periodo) {
      throw new NotFoundException('Periodo academico no encontrado');
    }

    const anio = await this.findAnioLectivoById(
      periodo.anioLectivoId,
      currentUser,
    );
    this.assertInstitutionAccess(anio.institucionId, currentUser);

    return periodo;
  }

  private assertInstitutionAccess(
    institucionId: string,
    currentUser?: JwtPayload,
  ) {
    if (!currentUser || currentUser.superadministrador) {
      return;
    }

    if (
      !currentUser.institucionId ||
      currentUser.institucionId !== institucionId
    ) {
      throw new ForbiddenException(
        'No puede operar fuera de la institucion asociada a su usuario',
      );
    }
  }
}
