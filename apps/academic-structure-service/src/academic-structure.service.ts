import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { setAuditAfterState, setAuditEntityId } from '@libs/audit';
import { JwtPayload } from '@libs/common';
import {
  AnioLectivo,
  AreaConocimiento,
  Asignatura,
  CargaAcademicaDocente,
  Docente,
  Grado,
  Grupo,
  Institucion,
  Jornada,
  PlanEstudioGrado,
  Sede,
} from '@libs/database';
import {
  CrearAreaConocimientoDto,
  CrearAsignaturaDto,
  CrearCargaAcademicaDocenteDto,
  CrearGradoDto,
  CrearGrupoDto,
  CrearJornadaDto,
  CrearPlanEstudioGradoDto,
} from './dto';

@Injectable()
export class AcademicStructureService {
  constructor(
    @InjectRepository(Institucion)
    private readonly institucionesRepository: Repository<Institucion>,
    @InjectRepository(Sede)
    private readonly sedesRepository: Repository<Sede>,
    @InjectRepository(AnioLectivo)
    private readonly aniosLectivosRepository: Repository<AnioLectivo>,
    @InjectRepository(AreaConocimiento)
    private readonly areasRepository: Repository<AreaConocimiento>,
    @InjectRepository(Asignatura)
    private readonly asignaturasRepository: Repository<Asignatura>,
    @InjectRepository(Grado)
    private readonly gradosRepository: Repository<Grado>,
    @InjectRepository(Jornada)
    private readonly jornadasRepository: Repository<Jornada>,
    @InjectRepository(Grupo)
    private readonly gruposRepository: Repository<Grupo>,
    @InjectRepository(PlanEstudioGrado)
    private readonly planesRepository: Repository<PlanEstudioGrado>,
    @InjectRepository(Docente)
    private readonly docentesRepository: Repository<Docente>,
    @InjectRepository(CargaAcademicaDocente)
    private readonly cargasRepository: Repository<CargaAcademicaDocente>,
  ) {}

  async createAreaConocimiento(
    institucionId: string,
    dto: CrearAreaConocimientoDto,
  ) {
    await this.findInstitucionById(institucionId);
    const area = await this.areasRepository.save(
      this.areasRepository.create({
        institucionId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        orden: dto.orden ?? 0,
        activo: true,
      }),
    );
    setAuditEntityId(area.id);
    setAuditAfterState(area);
    return area;
  }

  findAreasConocimiento(institucionId: string) {
    return this.areasRepository.find({
      where: { institucionId },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async createAsignatura(institucionId: string, dto: CrearAsignaturaDto) {
    await this.findInstitucionById(institucionId);
    await this.findAreaById(dto.areaConocimientoId, institucionId);
    const asignatura = await this.asignaturasRepository.save(
      this.asignaturasRepository.create({
        institucionId,
        areaConocimientoId: dto.areaConocimientoId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        activo: true,
      }),
    );
    setAuditEntityId(asignatura.id);
    setAuditAfterState(asignatura);
    return asignatura;
  }

  findAsignaturas(institucionId: string) {
    return this.asignaturasRepository.find({
      where: { institucionId },
      order: { nombre: 'ASC' },
    });
  }

  async createGrado(institucionId: string, dto: CrearGradoDto) {
    await this.findInstitucionById(institucionId);
    const grado = await this.gradosRepository.save(
      this.gradosRepository.create({
        institucionId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        nombreCorto: dto.nombreCorto ?? null,
        nivelEducativo: dto.nivelEducativo,
        orden: dto.orden,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(grado.id);
    setAuditAfterState(grado);
    return grado;
  }

  findGrados(institucionId: string) {
    return this.gradosRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async createJornada(institucionId: string, dto: CrearJornadaDto) {
    await this.findInstitucionById(institucionId);
    const jornada = await this.jornadasRepository.save(
      this.jornadasRepository.create({
        institucionId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        horaInicio: dto.horaInicio ?? null,
        horaFin: dto.horaFin ?? null,
        activo: true,
      }),
    );
    setAuditEntityId(jornada.id);
    setAuditAfterState(jornada);
    return jornada;
  }

  findJornadas(institucionId: string) {
    return this.jornadasRepository.find({
      where: { institucionId },
      order: { nombre: 'ASC' },
    });
  }

  async createGrupo(institucionId: string, dto: CrearGrupoDto) {
    await this.findInstitucionById(institucionId);
    await this.findSedeById(dto.sedeId, institucionId);
    await this.findAnioLectivoById(dto.anioLectivoId, undefined, institucionId);
    await this.findGradoById(dto.gradoId, institucionId);
    await this.findJornadaById(dto.jornadaId, institucionId);

    const grupo = await this.gruposRepository.save(
      this.gruposRepository.create({
        institucionId,
        codigo: dto.codigo,
        sedeId: dto.sedeId,
        anioLectivoId: dto.anioLectivoId,
        gradoId: dto.gradoId,
        jornadaId: dto.jornadaId,
        nombre: dto.nombre,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(grupo.id);
    setAuditAfterState(grupo);
    return grupo;
  }

  findGrupos(institucionId: string) {
    return this.gruposRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      order: { nombre: 'ASC' },
    });
  }

  async createPlanEstudio(
    anioLectivoId: string,
    dto: CrearPlanEstudioGradoDto,
    currentUser: JwtPayload,
  ) {
    const anio = await this.findAnioLectivoById(anioLectivoId, currentUser);
    await this.findGradoById(dto.gradoId, anio.institucionId);
    await this.findAsignaturaById(dto.asignaturaId, anio.institucionId);

    const plan = await this.planesRepository.save(
      this.planesRepository.create({
        anioLectivoId,
        gradoId: dto.gradoId,
        asignaturaId: dto.asignaturaId,
        horasSemanales: dto.horasSemanales,
        activo: true,
      }),
    );
    setAuditEntityId(plan.id);
    setAuditAfterState(plan);
    return plan;
  }

  async findPlanesEstudio(anioLectivoId: string, currentUser: JwtPayload) {
    await this.findAnioLectivoById(anioLectivoId, currentUser);
    return this.planesRepository.find({
      where: { anioLectivoId },
      order: { gradoId: 'ASC', asignaturaId: 'ASC' },
    });
  }

  async createCargaDocente(
    grupoId: string,
    dto: CrearCargaAcademicaDocenteDto,
    currentUser: JwtPayload,
  ) {
    const grupo = await this.findGrupoById(grupoId, currentUser);
    const plan = await this.findPlanById(dto.planEstudioGradoId);
    const docente = await this.findDocenteById(dto.docenteId);

    if (
      plan.anioLectivoId !== grupo.anioLectivoId ||
      plan.gradoId !== grupo.gradoId
    ) {
      throw new BadRequestException(
        'El plan de estudio no corresponde al anio lectivo y grado del grupo',
      );
    }

    if (docente.institucionId !== grupo.institucionId) {
      throw new BadRequestException(
        'El docente no pertenece a la institucion del grupo',
      );
    }

    const carga = await this.cargasRepository.save(
      this.cargasRepository.create({
        grupoId,
        planEstudioGradoId: dto.planEstudioGradoId,
        docenteId: dto.docenteId,
        codigo: dto.codigo,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(carga.id);
    setAuditAfterState(carga);
    return carga;
  }

  async findCargasDocentes(grupoId: string, currentUser: JwtPayload) {
    await this.findGrupoById(grupoId, currentUser);
    return this.cargasRepository.find({
      where: { grupoId, eliminadoEn: IsNull() },
      order: { codigo: 'ASC' },
    });
  }

  private async findInstitucionById(id: string) {
    const institucion = await this.institucionesRepository.findOneBy({ id });
    if (!institucion) {
      throw new NotFoundException('Institucion no encontrada');
    }

    return institucion;
  }

  private async findSedeById(id: string, institucionId: string) {
    const sede = await this.sedesRepository.findOneBy({ id });
    if (!sede) {
      throw new NotFoundException('Sede no encontrada');
    }

    this.assertSameInstitution(
      sede.institucionId,
      institucionId,
      'La sede no pertenece a la institucion',
    );
    return sede;
  }

  private async findAnioLectivoById(
    id: string,
    currentUser?: JwtPayload,
    expectedInstitutionId?: string,
  ) {
    const anio = await this.aniosLectivosRepository.findOneBy({ id });
    if (!anio) {
      throw new NotFoundException('Anio lectivo no encontrado');
    }

    if (expectedInstitutionId) {
      this.assertSameInstitution(
        anio.institucionId,
        expectedInstitutionId,
        'El anio lectivo no pertenece a la institucion',
      );
    }
    this.assertInstitutionAccess(anio.institucionId, currentUser);
    return anio;
  }

  private async findAreaById(id: string, institucionId: string) {
    const area = await this.areasRepository.findOneBy({ id });
    if (!area) {
      throw new NotFoundException('Area de conocimiento no encontrada');
    }

    this.assertSameInstitution(
      area.institucionId,
      institucionId,
      'El area de conocimiento no pertenece a la institucion',
    );
    return area;
  }

  private async findAsignaturaById(id: string, institucionId: string) {
    const asignatura = await this.asignaturasRepository.findOneBy({ id });
    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    this.assertSameInstitution(
      asignatura.institucionId,
      institucionId,
      'La asignatura no pertenece a la institucion',
    );
    return asignatura;
  }

  private async findGradoById(id: string, institucionId: string) {
    const grado = await this.gradosRepository.findOneBy({ id });
    if (!grado) {
      throw new NotFoundException('Grado no encontrado');
    }

    this.assertSameInstitution(
      grado.institucionId,
      institucionId,
      'El grado no pertenece a la institucion',
    );
    return grado;
  }

  private async findJornadaById(id: string, institucionId: string) {
    const jornada = await this.jornadasRepository.findOneBy({ id });
    if (!jornada) {
      throw new NotFoundException('Jornada no encontrada');
    }

    this.assertSameInstitution(
      jornada.institucionId,
      institucionId,
      'La jornada no pertenece a la institucion',
    );
    return jornada;
  }

  private async findGrupoById(id: string, currentUser: JwtPayload) {
    const grupo = await this.gruposRepository.findOneBy({ id });
    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    this.assertInstitutionAccess(grupo.institucionId, currentUser);
    return grupo;
  }

  private async findPlanById(id: string) {
    const plan = await this.planesRepository.findOneBy({ id });
    if (!plan) {
      throw new NotFoundException('Plan de estudio no encontrado');
    }

    return plan;
  }

  private async findDocenteById(id: string) {
    const docente = await this.docentesRepository.findOneBy({ id });
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return docente;
  }

  private assertSameInstitution(
    actual: string,
    expected: string,
    message: string,
  ) {
    if (actual !== expected) {
      throw new BadRequestException(message);
    }
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
