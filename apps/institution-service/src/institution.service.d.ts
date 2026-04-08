import { Repository } from 'typeorm';
import { JwtPayload } from '@libs/common';
import { AnioLectivo, ConfiguracionInstitucion, EscalaValoracion, Institucion, NivelEscalaValoracion, PeriodoAcademico, Sede } from '@libs/database';
import { ActualizarInstitucionDto, ConfiguracionInstitucionDto, CrearAnioLectivoDto, CrearEscalaValoracionDto, CrearInstitucionDto, CrearPeriodoAcademicoDto, CrearSedeDto } from './dto';
export declare class InstitutionService {
    private readonly institucionesRepository;
    private readonly sedesRepository;
    private readonly aniosLectivosRepository;
    private readonly periodosRepository;
    private readonly configuracionesRepository;
    private readonly escalasRepository;
    private readonly nivelesRepository;
    constructor(institucionesRepository: Repository<Institucion>, sedesRepository: Repository<Sede>, aniosLectivosRepository: Repository<AnioLectivo>, periodosRepository: Repository<PeriodoAcademico>, configuracionesRepository: Repository<ConfiguracionInstitucion>, escalasRepository: Repository<EscalaValoracion>, nivelesRepository: Repository<NivelEscalaValoracion>);
    createInstitucion(dto: CrearInstitucionDto, currentUser: JwtPayload): Promise<Institucion>;
    findInstituciones(): Promise<Institucion[]>;
    findInstitucionById(id: string): Promise<Institucion>;
    updateInstitucion(id: string, dto: ActualizarInstitucionDto): Promise<Institucion>;
    createSede(institucionId: string, dto: CrearSedeDto): Promise<Sede>;
    findSedes(institucionId: string): Promise<Sede[]>;
    createAnioLectivo(institucionId: string, dto: CrearAnioLectivoDto): Promise<AnioLectivo>;
    findAniosLectivos(institucionId: string): Promise<AnioLectivo[]>;
    createPeriodo(anioLectivoId: string, dto: CrearPeriodoAcademicoDto): Promise<PeriodoAcademico>;
    findPeriodos(anioLectivoId: string): Promise<PeriodoAcademico[]>;
    cerrarPeriodo(periodoId: string): Promise<PeriodoAcademico>;
    upsertConfiguracion(institucionId: string, dto: ConfiguracionInstitucionDto): Promise<ConfiguracionInstitucion>;
    getConfiguracion(institucionId: string): Promise<ConfiguracionInstitucion | null>;
    createEscalaValoracion(institucionId: string, dto: CrearEscalaValoracionDto): Promise<{
        niveles: NivelEscalaValoracion[];
        institucionId: string;
        nombre: string;
        descripcion: string | null;
        activa: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findEscalasValoracion(institucionId: string): Promise<{
        niveles: NivelEscalaValoracion[];
        institucionId: string;
        nombre: string;
        descripcion: string | null;
        activa: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    private findAnioLectivoById;
}
